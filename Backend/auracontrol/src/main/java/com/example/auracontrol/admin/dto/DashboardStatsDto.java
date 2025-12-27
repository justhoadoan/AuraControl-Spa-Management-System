package com.example.auracontrol.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardStatsDto {
    private BigDecimal todayRevenue;
    private long todayAppointments;
    private long newCustomers;
}
