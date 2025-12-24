package com.example.auracontrol.booking;

import com.example.auracontrol.booking.dto.BookingRequest;
import com.example.auracontrol.booking.dto.TechnicianOptionDto;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.service.ServiceRepository;
import com.example.auracontrol.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final TechnicianRepository technicianRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceRepository serviceRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public List<TechnicianOptionDto> getAvailableTechnicians(Integer serviceId, LocalDateTime time) {
        return technicianRepository.findAvailableTechnicians(serviceId, time);
    }
    /**
     * Creates a new appointment for the currently authenticated customer.
     *
     * <p>
     * This method performs the following steps:
     * <ul>
     *   <li>Retrieves the currently logged-in user from the security context</li>
     *   <li>Ensures the user is associated with a Customer entity</li>
     *   <li>Validates the requested service and technician</li>
     *   <li>Creates an Appointment entity with status PENDING</li>
     *   <li>Persists the appointment within a transactional boundary</li>
     * </ul>
     *
     * <p>
     * Business rules such as time validation, skill validation, and overlap
     * checks are handled at the database level via triggers.
     *
     * @param request the booking request containing service ID, technician ID,
     *                start time, and optional note
     * @return the persisted Appointment entity
     * @throws ResourceNotFoundException if the user, customer, service,
     *                                  or technician cannot be found
     */
    @Transactional
    public Appointment createAppointment(BookingRequest request) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Customer customer = customerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Current user is not a customer"));

       com.example.auracontrol.service.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        Technician technician = technicianRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setTechnician(technician);
        appointment.setService(service);
        appointment.setStartTime(request.getStartTime());
        appointment.setNoteText(request.getNote());
        appointment.setStatus("PENDING");


        return appointmentRepository.save(appointment);
    }
    /**
     * Calculates all available booking time slots for a given service and date.
     *
     *
     * A slot is considered available if:
     *
     *   The slot is within business hours (09:00 - 21:00)
     *   The slot is not in the past
     *   At least one technician skilled for the service is available
     *
     *
     *
     * Slots are generated in 5-minute intervals and validated against
     * existing appointments to prevent overlapping bookings.
     *
     * @param serviceId the ID of the service being booked
     * @param date the date for which available slots are requested
     * @return a list of available time slots formatted as {@code HH:mm}
     * @throws ResourceNotFoundException if the service does not exist
     */
    public List<String> getAvailableSlots(Integer serviceId, LocalDate date) {
        List<String> availableSlots = new ArrayList<>();

        com.example.auracontrol.service.Service service =  serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        int durationMinutes = service.getDurationMinutes();

        List<Technician> skilledTechs = technicianRepository.findAllByServiceId(serviceId);
        if (skilledTechs.isEmpty()) {
            return availableSlots;
        }

        LocalDateTime startOfDay = date.atTime(0, 0, 0);
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<Appointment> todaysAppointments = appointmentRepository
                .findAllByStartTimeBetweenAndStatusNot(startOfDay, endOfDay, "CANCELLED");

        LocalDateTime currentSlot = date.atTime(9, 0);
        LocalDateTime closingTime = date.atTime(21, 0);

        while (currentSlot.plusMinutes(durationMinutes).isBefore(closingTime) || currentSlot.plusMinutes(durationMinutes).isEqual(closingTime)) {

            if (currentSlot.isBefore(LocalDateTime.now())) {
                currentSlot = currentSlot.plusMinutes(5);
                continue;
            }


            LocalDateTime slotEnd = currentSlot.plusMinutes(durationMinutes);


            long busyTechCount = countBusyTechnicians(skilledTechs, todaysAppointments, currentSlot, slotEnd);

            if (busyTechCount < skilledTechs.size()) {
                availableSlots.add(currentSlot.format(DateTimeFormatter.ofPattern("HH:mm")));
            }

            currentSlot = currentSlot.plusMinutes(5);
        }

        return availableSlots;
    }

    private long countBusyTechnicians(List<Technician> skilledTechs,
                                      List<Appointment> appointments,
                                      LocalDateTime slotStart,
                                      LocalDateTime slotEnd) {
        int count = 0;

        for (Technician tech : skilledTechs) {
            boolean isBusy = appointments.stream().anyMatch(appt ->

                    appt.getTechnician().getTechnicianId().equals(tech.getTechnicianId()) &&
                            (appt.getStartTime().isBefore(slotEnd) && appt.getEndTime().isAfter(slotStart))
            );

            if (isBusy) {
                count++;
            }
        }
        return count;
    }
}
