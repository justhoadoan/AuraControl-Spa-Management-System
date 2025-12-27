package com.example.auracontrol.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CalendarEventDto {
    private String id;
    private String title;
    private LocalDateTime start;
    private LocalDateTime end;
    private String type;            // "APPOINTMENT", "ABSENCE"
    private String status;          //  PENDING, CONFIRMED, CANCELLED, COMPLETED
    private String description;
}
