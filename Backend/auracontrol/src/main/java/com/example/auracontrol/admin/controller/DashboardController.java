package com.example.auracontrol.admin.controller;


import com.example.auracontrol.admin.dto.DashboardAppointmentDto;
import com.example.auracontrol.admin.dto.DashboardStatsDto;
import com.example.auracontrol.admin.dto.RevenueStatDto;
import com.example.auracontrol.admin.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    /**
     * Revenue Chart API
     * URL: GET /api/admin/dashboard/revenue-chart?period=WEEK
     *
     * Query parameter:
     * - period: WEEK, MONTH, YEAR
     */
    @GetMapping("/revenue-chart")
    public ResponseEntity<List<RevenueStatDto>> getRevenueChart(
            @RequestParam(defaultValue = "WEEK") String period
    ) {
        return ResponseEntity.ok(dashboardService.getRevenueChartData(period));
    }

    /**
     * Dashboard Statistics API (Stat Cards)
     * URL: GET /api/admin/dashboard/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    /**
     * Upcoming Appointments API (Table)
     * URL: GET /api/admin/dashboard/upcoming-appointments
     */
    @GetMapping("/upcoming-appointments")
    public ResponseEntity<List<DashboardAppointmentDto>> getUpcomingAppointments() {
        return ResponseEntity.ok(dashboardService.getUpcomingAppointments());
    }
}
