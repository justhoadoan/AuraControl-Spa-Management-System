package com.example.auracontrol.booking.service;

import com.example.auracontrol.booking.dto.AdminAppointmentDto;
import com.example.auracontrol.booking.dto.BookingRequest;
import com.example.auracontrol.booking.dto.BookingResponseDto;
import com.example.auracontrol.booking.dto.TechnicianOptionDto;
import com.example.auracontrol.booking.entity.*;
import com.example.auracontrol.booking.repository.*;
import com.example.auracontrol.exception.DuplicateResourceException;
import com.example.auracontrol.exception.InvalidRequestException;
import com.example.auracontrol.user.repository.CustomerRepository;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.service.ServiceRepository;
import com.example.auracontrol.user.entity.Customer;
import com.example.auracontrol.user.entity.Technician;
import com.example.auracontrol.user.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    // Repositories for accessing database layers
    private final TechnicianRepository technicianRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceRepository serviceRepository;
    private final CustomerRepository customerRepository;
    private final ServiceResourceRequirementRepository serviceResourceRequirementRepository;
    private final ResourceRepository resourceRepository;
    private final AppointmentResourceRepository appointmentResourceRepository;
    private final AbsenceRequestRepository absenceRequestRepository;

    /**
     * Get list of available technicians for a given service and time.
     * This method delegates the availability logic to the database (SQL function).
     */
    public List<TechnicianOptionDto> getAvailableTechnicians(Integer serviceId, LocalDateTime time) {
        return technicianRepository.findAvailableTechnicians(serviceId, time);
    }

    /**
     * Create a new appointment.
     * This method handles:
     *  - Customer identification
     *  - Technician selection (manual or auto-assign)
     *  - Resource allocation (room/equipment)
     *  - Appointment persistence
     *
     * The whole process runs inside a transaction.
     */
    @Transactional(rollbackFor = Exception.class)
    public Appointment createAppointment(BookingRequest request) {

        // 1. Get currently authenticated customer
        String currentUserEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Customer customer = customerRepository.findByUserEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + currentUserEmail));

        // 2. Get service information
        var service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        // 3. Technician handling
        Technician technician;

        // Fetch available technicians at the requested time
        List<TechnicianOptionDto> availableTechs =
                technicianRepository.findAvailableTechnicians(
                        request.getServiceId(),
                        request.getStartTime()
                );

        if (request.getTechnicianId() != null) {
            // Case 1: Customer selects a specific technician
            boolean isAvailable = availableTechs.stream()
                    .anyMatch(dto ->
                            dto.getTechnicianId().equals(request.getTechnicianId())
                    );

            if (!isAvailable) {
                throw new ResourceNotFoundException(
                        "Selected technician is busy or not qualified."
                );
            }

            technician = technicianRepository.findById(request.getTechnicianId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Technician not found")
                    );
        } else {
            // Case 2: Auto-assign a technician randomly
            if (availableTechs.isEmpty()) {
                throw new ResourceNotFoundException(
                        "No available technician for this time slot."
                );
            }

            int randomIndex = new Random().nextInt(availableTechs.size());
            TechnicianOptionDto selectedDto = availableTechs.get(randomIndex);

            technician = technicianRepository.findById(selectedDto.getTechnicianId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Auto-assigned technician not found")
                    );
        }


        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        List<ServiceResourceRequirement> requirements = serviceResourceRequirementRepository.findByServiceId(service.getServiceId());

        if (!requirements.isEmpty()) {

            List<Integer> busyIds = resourceRepository.findBusyResourceIds(startTime, endTime);

            if (busyIds.isEmpty()) {
                busyIds.add(-1);
            }

            for (ServiceResourceRequirement req : requirements) {
                String requiredType = req.getResourceType();


                Resource foundResource = resourceRepository
                        .findFirstAvailableByType(requiredType, busyIds)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Hiện tại không đủ tài nguyên loại: " + requiredType
                                )
                        );


                busyIds.add(foundResource.getResourceId());
            }
        }

        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setTechnician(technician);
        appointment.setService(service);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);




        appointment.setStatus("CONFIRMED");

        return appointmentRepository.save(appointment);
    }

    /**
     * Get available time slots for a service on a specific date.
     * Time slots are checked every 15 minutes between 09:00 and 21:00.
     */
    public List<String> getAvailableSlots(Integer serviceId, LocalDate date) {
        List<String> availableSlots = new ArrayList<>();

        // Get service duration
        var service = serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Service not found")
                );
        if (service.getIsActive() == null || !service.getIsActive()) {
            throw new ResourceNotFoundException("Service is inactive");
        }
        int durationMinutes = service.getDurationMinutes();

        // If no technician can perform this service, return empty list
        List<Technician> skilledTechs =
                technicianRepository.findAllByServiceId(serviceId);

        if (skilledTechs.isEmpty()) {
            return availableSlots;
        }
        LocalDateTime lunchStart = date.atTime(12, 0);
        LocalDateTime lunchEnd   = date.atTime(14, 0);

        // Fetch all appointments of the day (performance optimization)
        LocalDateTime startOfDay = date.atTime(0, 0, 0);
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<Appointment> todaysAppointments =
                appointmentRepository.findAllByStartTimeBetweenAndStatusNot(
                        startOfDay,
                        endOfDay,
                        "CANCELLED"
                );
        List<Integer> skilledTechIds = skilledTechs.stream()
                .map(Technician::getTechnicianId)
                .collect(Collectors.toList());

        List<AbsenceRequest> todaysAbsences = absenceRequestRepository
                .findByTechnicianIdInAndStatusAndDateRange(
                        skilledTechIds,
                        "APPROVED",
                        startOfDay,
                        endOfDay
                );

        // Resource-related preparation
        List<ServiceResourceRequirement> requirements = serviceResourceRequirementRepository.findAllByService_ServiceId(serviceId);

        Map<String, Long> resourceTotalMap = new HashMap<>();

        Map<String, List<Appointment>> resourceUsageMap = new HashMap<>();
        if (!requirements.isEmpty()) {
            for (ServiceResourceRequirement req : requirements) {
                String type = req.getResourceType();

                if (!resourceTotalMap.containsKey(type)) {
                    resourceTotalMap.put(type, resourceRepository.countByType(type));
                }

                if (!resourceUsageMap.containsKey(type)) {
                    resourceUsageMap.put(type, appointmentResourceRepository.findAppointmentsByResourceTypeAndDate(type, startOfDay, endOfDay));
                }
            }
        }

        // Iterate through time slots (09:00 -> 21:00)
        LocalDateTime currentSlot = date.atTime(9, 0);
        LocalDateTime closingTime = date.atTime(21, 0);

        while (!currentSlot.plusMinutes(durationMinutes).isAfter(closingTime)) {
            LocalDateTime slotEnd = currentSlot.plusMinutes(durationMinutes);

            if (currentSlot.isBefore(lunchEnd) && slotEnd.isAfter(lunchStart)) {
                currentSlot = currentSlot.plusMinutes(15);
                continue;
            }


            if (currentSlot.isBefore(LocalDateTime.now())) {
                currentSlot = currentSlot.plusMinutes(15);
                continue;
            }


            long busyTechCount =
                    countBusyTechnicians(
                            skilledTechs,
                            todaysAppointments,
                            todaysAbsences,
                            currentSlot,
                            slotEnd
                    );

            boolean hasTechnician =
                    busyTechCount < skilledTechs.size();

            // 2. Resource availability check
            boolean hasAllResources = true;

            if (!requirements.isEmpty()) {
                for (ServiceResourceRequirement req : requirements) {
                    String type = req.getResourceType();
                    int requiredQty = req.getQuantity();
                    long totalQty = resourceTotalMap.getOrDefault(type, 0L);


                    List<Appointment> appsUsingResource = resourceUsageMap.getOrDefault(type, new ArrayList<>());
                    long busyQty = countBusyResources(appsUsingResource, currentSlot, slotEnd);


                    if ((totalQty - busyQty) < requiredQty) {
                        hasAllResources = false;
                        break;
                    }
                }
            }

            // 3. Slot is available only if both technician and resource are available
            if (hasTechnician && hasAllResources) {
                availableSlots.add(
                        currentSlot.format(
                                DateTimeFormatter.ofPattern("HH:mm")
                        )
                );
            }

            currentSlot = currentSlot.plusMinutes(15);
        }

        return availableSlots;
    }
    /**
     * Get upcoming appointment for customer.
     */
    public List<BookingResponseDto> getUpcomingAppointments(String userEmail) {
        LocalDateTime now = LocalDateTime.now();

        List<Appointment> appointments = appointmentRepository
                .findByCustomer_User_EmailAndStartTimeAfterAndStatusNotOrderByStartTimeAsc(
                        userEmail,
                        now,
                        "CANCELLED"
                );
        return appointments.stream()
                .map(appt -> BookingResponseDto.builder()
                        .id(appt.getAppointmentId())
                        .serviceName(appt.getService().getName())
                        .serviceId(appt.getService().getServiceId())
                        .startTime(appt.getStartTime())
                        .duration(appt.getService().getDurationMinutes())
                        .technicianName(appt.getTechnician() != null ? appt.getTechnician().getUser().getName() : "Arranging")
                        .status(appt.getStatus())
                        .build())
                .collect(Collectors.toList());
    }
    /**
     * Cancel an appointment.
     * Rules:
     * 1. Must be the owner (security).
     * 2. Cannot cancel if already cancelled.
     * 3. Cannot cancel within 30 minutes of start time.
     */
    @Transactional(rollbackFor = Exception.class)
    public void cancelAppointment(Integer appointmentId, String currentUserEmail) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        String ownerEmail = appointment.getCustomer().getUser().getEmail();
        if (!ownerEmail.equals(currentUserEmail)) {
            throw new InvalidRequestException("Unauthorized: You are not the owner of this appointment.");
        }

        if ("CANCELLED".equals(appointment.getStatus())) {
            throw new DuplicateResourceException("Appointment is already cancelled.");
        }


        LocalDateTime deadline = LocalDateTime.now().plusMinutes(30);
        if (deadline.isAfter(appointment.getStartTime())) {
            throw new InvalidRequestException("Cannot cancel appointment less than 30 minutes before start time.");
        }


        appointment.setStatus("CANCELLED");

        appointmentRepository.save(appointment);
    }
    /**
     * Get past appointments (History).
     */
    public List<BookingResponseDto> getAppointmentHistory(String userEmail) {
        LocalDateTime now = LocalDateTime.now();

        List<Appointment> appointments = appointmentRepository
                .findByCustomer_User_EmailAndStartTimeBeforeOrderByStartTimeDesc(
                        userEmail,
                        now
                );

        return appointments.stream()
                .map(appt -> BookingResponseDto.builder()
                        .id(appt.getAppointmentId())
                        .serviceName(appt.getService().getName())
                        .startTime(appt.getStartTime())
                        .duration(appt.getService().getDurationMinutes())
                        .technicianName(appt.getTechnician() != null ? appt.getTechnician().getUser().getName() : "Unknown")
                        .status(appt.getStatus()) //Cancelled, COMPLETED
                        .build())
                .collect(Collectors.toList());
    }
    @Transactional
    public void confirmAppointment(Integer appointmentId, String userEmail) {

        Technician currentTech = technicianRepository.findByUser_EmailAndUser_EnabledTrue(userEmail)
                .orElseThrow(() -> new AccessDeniedException("You are not a valid technician"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!currentTech.getTechnicianId().equals(appointment.getTechnician().getTechnicianId())) {
            throw new AccessDeniedException("You are not allowed to operate on another technician's appointment");
        }

        if (!"PENDING".equals(appointment.getStatus())) {
            throw new IllegalStateException("Only appointments in PENDING status can be confirmed");
        }

        appointment.setStatus("CONFIRMED");
        appointmentRepository.save(appointment);
    }

    /**
     * Reschedule an appointment.
     *
     * Business logic is delegated to Database Triggers:
     * 1. trg_calculate_end_time (BEFORE UPDATE):
     *    Automatically recalculates the appointment end time.
     *
     * 2. trg_validate_appointment (BEFORE UPDATE):
     *    - Checks technician schedule conflicts
     *    - Checks technician approved absences
     *    - Checks resource availability
     *
     * 3. trg_update_resource_on_reschedule (AFTER UPDATE):
     *    - Releases previously assigned resources
     *    - Automatically assigns new available resources
     */
    @Transactional(rollbackFor = Exception.class)
    public Appointment rescheduleAppointment(
            Integer appointmentId,
            LocalDateTime newStartTime,
            String currentUserEmail
    ) {

        // 1. Retrieve appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // 2. Ownership validation (Security check)
        if (!appointment.getCustomer().getUser().getEmail().equals(currentUserEmail)) {
            throw new InvalidRequestException("Unauthorized: You are not the owner of this appointment.");
        }

        // 3. Status validation (Only allow reschedule when PENDING or CONFIRMED)
        if (List.of("CANCELLED", "COMPLETED").contains(appointment.getStatus())) {
            throw new InvalidRequestException("Cannot reschedule a cancelled or completed appointment.");
        }

        // 4. Time validation (Business rules)
        LocalDateTime now = LocalDateTime.now();

        // Cannot reschedule to a past time
        if (newStartTime.isBefore(now)) {
            throw new InvalidRequestException("Cannot reschedule to the past.");
        }

        // Must reschedule at least 30 minutes before the original start time
        if (now.plusMinutes(30).isAfter(appointment.getStartTime())) {
            throw new InvalidRequestException(
                    "Cannot reschedule less than 30 minutes before the original start time."
            );
        }

        // If start time is unchanged, return the current appointment
        if (newStartTime.isEqual(appointment.getStartTime())) {
            return appointment;
        }

        // 5. Apply new start time
        appointment.setStartTime(newStartTime);

        try {
            // 6. Persist and flush to trigger DB validations immediately
            Appointment updatedAppointment = appointmentRepository.saveAndFlush(appointment);
            return updatedAppointment;

        } catch (Exception e) {
            // 7. Handle PostgreSQL trigger exceptions
            // Possible trigger messages:
            // - 'Technician is not available...'
            // - 'Technician is on approved leave...'
            // - 'Not enough resources...'

            Throwable rootCause = e;
            while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
                rootCause = rootCause.getCause();
            }

            String message = rootCause.getMessage();

            if (message != null) {
                if (message.contains("Technician is not available")) {
                    throw new DuplicateResourceException("Technician is busy at the selected time.");
                }
                if (message.contains("Technician is on approved leave")) {
                    throw new DuplicateResourceException("Technician is on leave at the selected time.");
                }
                if (message.contains("Not enough resources")) {
                    throw new DuplicateResourceException("No available room or equipment at the new time.");
                }
            }

            // Unknown or unexpected error
            throw new RuntimeException("Reschedule failed: " + message, e);
        }
    }

    // (COMPLETE)
    @Transactional
    public void completeAppointment(Integer appointmentId, String userEmail) {

        Technician currentTech = technicianRepository.findByUser_EmailAndUser_EnabledTrue(userEmail)
                .orElseThrow(() -> new AccessDeniedException("You are not a valid technician"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!currentTech.getTechnicianId().equals(appointment.getTechnician().getTechnicianId())) {
            throw new AccessDeniedException("You are not allowed to operate on this appointment");
        }

        if (!"CONFIRMED".equals(appointment.getStatus())) {
            throw new IllegalStateException("The appointment has not been confirmed and cannot be marked as completed");
        }

        appointment.setStatus("COMPLETED");
        appointmentRepository.save(appointment);
    }



    /**
     * Helper method: count busy technicians during a time slot.
     */
    private long countBusyTechnicians(
            List<Technician> skilledTechs,
            List<Appointment> appointments,
            List<AbsenceRequest> absences,
            LocalDateTime slotStart,
            LocalDateTime slotEnd
    ) {
        return skilledTechs.stream().filter(tech -> {
            Integer techId = tech.getTechnicianId();

            boolean hasAppointment = appointments.stream().anyMatch(appt ->
                    appt.getTechnician().getTechnicianId().equals(techId) &&
                            appt.getStartTime().isBefore(slotEnd) &&
                            appt.getEndTime().isAfter(slotStart)
            );

            if (hasAppointment) return true;

            boolean isAbsent = absences.stream().anyMatch(abs ->
                    abs.getTechnician().getTechnicianId().equals(techId) &&
                            abs.getStartDate().isBefore(slotEnd) &&
                            abs.getEndDate().isAfter(slotStart)
            );

            return isAbsent;
        }).count();
    }

    public Page<AdminAppointmentDto> getAppointmentsForAdmin(String keyword, String status, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Appointment> appointmentPage = appointmentRepository.findAppointmentsForAdmin(keyword, status, pageable);


        return appointmentPage.map(appt -> AdminAppointmentDto.builder()
                .appointmentId(appt.getAppointmentId())

                .customerName(appt.getCustomer() != null ? appt.getCustomer().getUser().getName() : "Unknown")
                .customerEmail(appt.getCustomer() != null ? appt.getCustomer().getUser().getEmail() : "")

                .serviceName(appt.getService().getName())
                .duration(appt.getService().getDurationMinutes())


                .technicianName(appt.getTechnician() != null ? appt.getTechnician().getUser().getName() : "Đang sắp xếp")

                .startTime(appt.getStartTime())
                .endTime(appt.getEndTime())
                .status(appt.getStatus())
                .price(appt.getFinalPrice())
                .note(appt.getNoteText())
                .build());
    }

    /**
     * Helper method: count busy resources during a time slot.
     */
    private long countBusyResources(
            List<Appointment> resourceAppts,
            LocalDateTime start,
            LocalDateTime end
    ) {
        if (resourceAppts == null || resourceAppts.isEmpty()) {
            return 0;
        }

        return resourceAppts.stream()
                .filter(appt ->
                        appt.getStartTime().isBefore(end) &&
                                appt.getEndTime().isAfter(start)
                )
                .count();
    }
}
