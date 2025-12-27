package com.example.auracontrol.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbsenceRequestResponse {
    private Integer requestId;
    private String technicianName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
}
