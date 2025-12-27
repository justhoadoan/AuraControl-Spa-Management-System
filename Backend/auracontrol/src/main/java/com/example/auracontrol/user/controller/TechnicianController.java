package com.example.auracontrol.user.controller;

import com.example.auracontrol.admin.dto.AbsenceRequestResponse;
import com.example.auracontrol.booking.dto.AbsenceRequestDto;
import com.example.auracontrol.booking.entity.AbsenceRequest;
import com.example.auracontrol.booking.service.AbsenceRequestService;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.user.dto.CalendarEventDto;
import com.example.auracontrol.user.entity.Technician;
import com.example.auracontrol.user.repository.TechnicianRepository;
import com.example.auracontrol.user.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
@RestController
@RequestMapping("/api/technician")
@RequiredArgsConstructor
public class TechnicianController {

    private final AbsenceRequestService absenceRequestService;
    private final TechnicianRepository technicianRepository;
    private final TechnicianService technicianService;

    // --- API ENDPOINTS ---

    /**
     * API: Submit an absence request
     */
    @PostMapping("/absence-requests")
    public ResponseEntity<AbsenceRequestResponse> createRequest(
            @RequestBody AbsenceRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Use helper method to get the current technician
        Technician technician = getCurrentTechnician(userDetails);

        AbsenceRequest savedRequest = absenceRequestService.submitRequest(
                technician.getTechnicianId(),
                requestDto
        );

        return ResponseEntity.ok(mapToResponse(savedRequest));
    }

    /**
     * API: Get working schedule and absence calendar
     */
    @GetMapping("/schedule")
    public ResponseEntity<List<CalendarEventDto>> getMySchedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        // Use helper method to get the current technician
        Technician technician = getCurrentTechnician(userDetails);

        return ResponseEntity.ok(
                technicianService.getTechnicianSchedule(
                        technician.getTechnicianId(),
                        start,
                        end
                )
        );
    }

    private Technician getCurrentTechnician(UserDetails userDetails) {
        return technicianRepository.findByUser_Email(userDetails.getUsername())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cannot find Technician for " + userDetails.getUsername()
                        )
                );
    }

    private AbsenceRequestResponse mapToResponse(AbsenceRequest entity) {
        return AbsenceRequestResponse.builder()
                .requestId(entity.getRequestId())
                .technicianName(entity.getTechnician().getUser().getName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .reason(entity.getReason())
                .status(entity.getStatus())
                .build();
    }
}
