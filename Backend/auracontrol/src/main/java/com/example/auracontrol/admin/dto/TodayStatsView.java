package com.example.auracontrol.admin.dto;

import java.math.BigDecimal;

public interface TodayStatsView {
    BigDecimal getTodayRevenue();
    Long getTodayAppointments();
    Long getNewCustomers();
}
