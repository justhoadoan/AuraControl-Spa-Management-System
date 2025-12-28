package com.example.auracontrol.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceBookingResponse {
    private Integer serviceId;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationMinutes;
}
