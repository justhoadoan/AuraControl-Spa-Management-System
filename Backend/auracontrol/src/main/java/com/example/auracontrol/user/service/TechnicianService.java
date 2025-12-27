package com.example.auracontrol.user.service;

import com.example.auracontrol.booking.entity.AbsenceRequest;
import com.example.auracontrol.booking.entity.Appointment;
import com.example.auracontrol.booking.repository.AbsenceRequestRepository;
import com.example.auracontrol.booking.repository.AppointmentRepository;
import com.example.auracontrol.user.dto.CalendarEventDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TechnicianService {
    private final AppointmentRepository appointmentRepository;
    private final AbsenceRequestRepository absenceRequestRepository;

    public List<CalendarEventDto> getTechnicianSchedule(Integer technicianId, LocalDateTime fromDate, LocalDateTime toDate) {
        List<CalendarEventDto> events = new ArrayList<>();


        List<Appointment> appointments = appointmentRepository.findByTechnicianIdAndDateRange(technicianId, fromDate, toDate);

        for (Appointment appt : appointments) {
            events.add(CalendarEventDto.builder()
                    .id("appt-" + appt.getAppointmentId())
                    .title("Customer: " + appt.getCustomer().getUser().getName())
                    .start(appt.getStartTime())
                    .end(appt.getEndTime())
                    .type("APPOINTMENT")
                    .status(appt.getStatus())
                    .description(appt.getService().getName())
                    .build());
        }

        List<AbsenceRequest> absences = absenceRequestRepository.findByTechnicianIdAndDateRange(technicianId, fromDate, toDate);

        for (AbsenceRequest abs : absences) {

            if (!abs.getStatus().equals("REJECTED")) {
                events.add(CalendarEventDto.builder()
                        .id("abs-" + abs.getRequestId())
                        .title("Absence: " + abs.getReason())
                        .start(abs.getStartDate())
                        .end(abs.getEndDate())
                        .type("ABSENCE")
                        .status(abs.getStatus())
                        .description(abs.getReason())
                        .build());
            }
        }

        return events;
    }
}
