package com.example.auracontrol.booking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponseDto {
    private Integer id;
    private String serviceName;
    private LocalDateTime startTime;
    private Integer duration;
    private String technicianName;
    private String status;
}
