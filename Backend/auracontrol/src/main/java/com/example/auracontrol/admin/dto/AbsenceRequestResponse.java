package com.example.auracontrol.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AbsenceRequestResponse {
    private Integer requestId;
    private String technicianName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
}
