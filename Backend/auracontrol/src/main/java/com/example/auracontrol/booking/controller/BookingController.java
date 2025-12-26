package com.example.auracontrol.booking.controller;


import com.example.auracontrol.booking.dto.BookingRequest;
import com.example.auracontrol.booking.dto.BookingResponseDto;
import com.example.auracontrol.booking.dto.TechnicianOptionDto;
import com.example.auracontrol.booking.entity.Appointment;
import com.example.auracontrol.booking.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {
    private final AppointmentService appointmentService;

    // GET /api/booking/available-slots?serviceId=1&date=2025-10-20
    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam Integer serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<String> slots = appointmentService.getAvailableSlots(serviceId, date);
        return ResponseEntity.ok(Map.of(
                "serviceId", serviceId,
                "date", date,
                "availableSlots", slots
        ));
    }

    // GET /api/booking/available-technicians?serviceId=1&startTime=2025-10-20T09:00:00
    @GetMapping("/available-technicians")
    public ResponseEntity<List<TechnicianOptionDto>> getAvailableTechnicians(
            @RequestParam Integer serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime
    ) {
        return ResponseEntity.ok(appointmentService.getAvailableTechnicians(serviceId, startTime));
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody @Valid BookingRequest request) {
        Appointment newAppointment = appointmentService.createAppointment(request);

        return ResponseEntity.ok(Map.of(
                "message", "Booking successfully created!.",
                "appointmentId", newAppointment.getAppointmentId(),
                "status", newAppointment.getStatus(),
                "startTime", newAppointment.getStartTime()
        ));
    }
    //GET /api/booking/upcoming-appointments
    @GetMapping("/upcoming-appointments")
    public ResponseEntity<List<BookingResponseDto>> getUpcomingAppointments() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        List<BookingResponseDto> list = appointmentService.getUpcomingAppointments(currentUserEmail);

        return ResponseEntity.ok(list);
    }
    //PUT /api/booking/upcoming-appointments
    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Integer id) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            appointmentService.cancelAppointment(id, currentUserEmail);
            return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully."));
        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    // GET /api/booking/history
    @GetMapping("/history")
    public ResponseEntity<List<BookingResponseDto>> getAppointmentHistory() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        List<BookingResponseDto> history = appointmentService.getAppointmentHistory(currentUserEmail);

        return ResponseEntity.ok(history);
    }


}
