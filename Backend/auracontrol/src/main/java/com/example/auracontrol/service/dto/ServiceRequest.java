package com.example.auracontrol.service.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationMinutes;
    private Boolean isActive;
}
