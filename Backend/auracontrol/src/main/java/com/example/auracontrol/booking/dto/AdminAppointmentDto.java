package com.example.auracontrol.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAppointmentDto {

    private Integer appointmentId;


    private String customerName;
    private String customerEmail;


    private String serviceName;
    private Integer duration;


    private String technicianName;


    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;


    private BigDecimal price;


    private String note;
}
