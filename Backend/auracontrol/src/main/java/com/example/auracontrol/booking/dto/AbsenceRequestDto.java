package com.example.auracontrol.booking.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AbsenceRequestDto {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;
}

