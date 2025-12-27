package com.example.auracontrol.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
@Data
@Builder
public class DashboardAppointmentDto {
    private Integer appointmentId;
    private LocalDateTime startTime;
    private String customerName;
    private String serviceName;
    private String technicianName;
    private String status;
}
