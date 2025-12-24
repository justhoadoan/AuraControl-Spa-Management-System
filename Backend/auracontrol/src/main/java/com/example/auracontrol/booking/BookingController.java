package com.example.auracontrol.booking;


import com.example.auracontrol.booking.dto.TechnicianOptionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
}
