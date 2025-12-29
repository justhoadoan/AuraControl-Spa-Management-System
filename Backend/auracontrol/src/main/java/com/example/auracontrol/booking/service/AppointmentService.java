package com.example.auracontrol.booking.service;

import com.example.auracontrol.booking.dto.AdminAppointmentDto;
import com.example.auracontrol.booking.dto.BookingRequest;
import com.example.auracontrol.booking.dto.BookingResponseDto;
import com.example.auracontrol.booking.dto.TechnicianOptionDto;
import com.example.auracontrol.booking.entity.AbsenceRequest;
import com.example.auracontrol.booking.entity.Appointment;
import com.example.auracontrol.booking.entity.AppointmentResource;
import com.example.auracontrol.booking.entity.Resource;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
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
                .orElseThrow(() -> new ResourceNotFoundException(currentUserEmail));

        // 2. Get service information
        var service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        // 3. Technician handling (manual selection or auto-assignment)
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

            // Selected technician must be available
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

        // 4. Resource handling (room/equipment)
        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        Resource selectedResource = null;

        // Check if this service requires a resource
        var requirementOpt =
                serviceResourceRequirementRepository.findByServiceId(service.getServiceId());

        if (requirementOpt.isPresent()) {
            String requiredType = requirementOpt.get().getResourceType();

            // Find busy resources during the requested time
            List<Integer> busyIds =
                    resourceRepository.findBusyResourceIds(startTime, endTime);

            // Prevent empty IN-clause issues
            if (busyIds.isEmpty()) {
                busyIds.add((int) -1L);
            }

            // Select the first available resource
            selectedResource =
                    resourceRepository
                            .findFirstAvailableByType(requiredType, busyIds)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "No available room/equipment at this time."
                                    )
                            );
        }

        // 5. Persist appointment entity
        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setTechnician(technician);
        appointment.setService(service);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setStatus("PENDING");

        appointment = appointmentRepository.save(appointment);



        return appointment;
    }

    /**
     * Get available time slots for a service on a specific date.
     * Time slots are checked every 5 minutes between 09:00 and 21:00.
     */
    public List<String> getAvailableSlots(Integer serviceId, LocalDate date) {
        List<String> availableSlots = new ArrayList<>();

        // Get service duration
        var service = serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Service not found")
                );

        int durationMinutes = service.getDurationMinutes();

        // If no technician can perform this service, return empty list
        List<Technician> skilledTechs =
                technicianRepository.findAllByServiceId(serviceId);

        if (skilledTechs.isEmpty()) {
            return availableSlots;
        }

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
        boolean requiresResource = false;
        long totalResources = 0;
        List<Appointment> resourceUsingAppointments = new ArrayList<>();

        var requirementOpt =
                serviceResourceRequirementRepository.findByServiceId(serviceId);

        if (requirementOpt.isPresent()) {
            requiresResource = true;
            String resourceType = requirementOpt.get().getResourceType();

            totalResources = resourceRepository.countByType(resourceType);

            resourceUsingAppointments =
                    appointmentResourceRepository
                            .findAppointmentsByResourceTypeAndDate(
                                    resourceType,
                                    startOfDay,
                                    endOfDay
                            );
        }

        // Iterate through time slots (09:00 -> 21:00)
        LocalDateTime currentSlot = date.atTime(9, 0);
        LocalDateTime closingTime = date.atTime(21, 0);

        while (!currentSlot.plusMinutes(durationMinutes).isAfter(closingTime)) {

            // Skip past time slots
            if (currentSlot.isBefore(LocalDateTime.now())) {
                currentSlot = currentSlot.plusMinutes(15);
                continue;
            }

            LocalDateTime slotEnd = currentSlot.plusMinutes(durationMinutes);

            // 1. Technician availability check
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
            boolean hasResource = true;

            if (requiresResource) {
                long busyResourceCount =
                        countBusyResources(
                                resourceUsingAppointments,
                                currentSlot,
                                slotEnd
                        );

                hasResource = busyResourceCount < totalResources;
            }

            // 3. Slot is available only if both technician and resource are available
            if (hasTechnician && hasResource) {
                availableSlots.add(
                        currentSlot.format(
                                DateTimeFormatter.ofPattern("HH:mm")
                        )
                );
            }

            currentSlot = currentSlot.plusMinutes(5);
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
