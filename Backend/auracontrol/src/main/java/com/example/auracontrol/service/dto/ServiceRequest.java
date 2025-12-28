package com.example.auracontrol.service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ServiceRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationMinutes;
    private Boolean isActive;


    private List<ServiceResourceDto> resources;

    @Data
    public static class ServiceResourceDto {
        private String resourceType;
        private Integer quantity;
    }
}