package com.example.auracontrol.admin.controller;

import com.example.auracontrol.admin.dto.AbsenceRequestResponse;
import com.example.auracontrol.booking.service.AbsenceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/absence-requests")
@RequiredArgsConstructor
public class AbsenceRequestController {
    private final AbsenceRequestService absenceRequestService;


    /**
     * 1. Retrieve absence request list
     * URL: GET /api/admin/absence-requests
     * Filter URL: GET /api/admin/absence-requests?status=PENDING
     */
    @GetMapping
    public ResponseEntity<Page<AbsenceRequestResponse>> getRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(absenceRequestService.getRequestsForAdmin(status, page, size));
    }
    /**
     * 2. Approve an absence request
     * URL: PUT /api/admin/absence-requests/{id}/approve
     *
     * Note:
     * If there is a scheduling conflict (blocked by database trigger),
     * GlobalExceptionHandler will catch the exception and return
     * Conflict for the frontend to display an error message.
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveRequest(@PathVariable Integer id) {
        absenceRequestService.reviewRequest(id, "APPROVED");
        return ResponseEntity.ok("Absence request approved successfully.");
    }

    /**
     * 3. Reject an absence request
     * URL: PUT /api/admin/absence-requests/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectRequest(@PathVariable Integer id) {
        absenceRequestService.reviewRequest(id, "REJECTED");
        return ResponseEntity.ok("Absence request rejected.");
    }

}
