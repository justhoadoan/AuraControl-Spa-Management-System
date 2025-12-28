package com.example.auracontrol.booking.controller;

import com.example.auracontrol.booking.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/technician/appointments")
@RequiredArgsConstructor
public class TechnicianAppointmentController {
    private final AppointmentService appointmentService;

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<?> confirmAppointment(
            @PathVariable Integer id,
            Principal principal
    ) {
        appointmentService.confirmAppointment(id, principal.getName());
        return ResponseEntity.ok("Appointment confirmed successfully");
    }

    // API Complete
    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeAppointment(
            @PathVariable Integer id,
            Principal principal
    ) {
        appointmentService.completeAppointment(id, principal.getName());
        return ResponseEntity.ok("Appointment marked as completed");
    }

}
