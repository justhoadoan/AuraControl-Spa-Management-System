package com.example.auracontrol.admin.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CustomerDetailResponse {
    private Integer userId;
    private Integer customerId;
    private String name;
    private String email;
    private List<AppointmentHistoryDto> appointmentHistory;

    @Data
    public static class AppointmentHistoryDto {
        private Integer appointmentId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String serviceName;
        private String technicianName;
        private String status;
        private BigDecimal price;
    }
}
