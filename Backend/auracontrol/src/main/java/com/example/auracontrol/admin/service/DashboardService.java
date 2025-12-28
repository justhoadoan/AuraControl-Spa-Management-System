package com.example.auracontrol.admin.service;

import com.example.auracontrol.admin.dto.*;
import com.example.auracontrol.booking.entity.Appointment;
import com.example.auracontrol.booking.repository.AppointmentRepository;
import com.example.auracontrol.exception.InvalidRequestException;
import com.example.auracontrol.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public List<RevenueStatDto> getRevenueChartData(String period) {
        if (period == null || period.trim().isEmpty()) {
            throw new InvalidRequestException("Period must not be null or empty");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime start;
        LocalDateTime end;
        String type;

        switch (period.toUpperCase()) {
            case "WEEK":
                start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                        .atStartOfDay();
                end = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                        .atTime(23, 59, 59);
                type = "DAY";
                break;

            case "MONTH":
                start = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
                end = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);
                type = "DAY";
                break;

            case "YEAR":
                start = today.with(TemporalAdjusters.firstDayOfYear()).atStartOfDay();
                end = today.with(TemporalAdjusters.lastDayOfYear()).atTime(23, 59, 59);
                type = "MONTH";
                break;

            default:
                throw new InvalidRequestException("Invalid period: " + period);
        }

        return appointmentRepository.getRevenueStatistics(start, end, type);
    }
    /**
     * API 1: Retrieve statistics for the 3 dashboard summary cards
     */
    public DashboardStatsDto getDashboardStats() {

        TodayStatsView stats = appointmentRepository.getTodayStatsView();

        return DashboardStatsDto.builder()

                .todayRevenue(stats != null ? stats.getTodayRevenue() : BigDecimal.ZERO)
                .todayAppointments(stats != null ? stats.getTodayAppointments() : 0L)
                .newCustomers(stats != null ? stats.getNewCustomers() : 0L)
                .build();
    }

    /**
     * API 2: Retrieve the next 10 upcoming appointments
     */
    public List<DashboardAppointmentDto> getUpcomingAppointments() {

        List<UpcomingAppointmentView> views = appointmentRepository.getUpcomingAppointmentsView();

        return views.stream().map(view -> DashboardAppointmentDto.builder()
                .appointmentId(view.getAppointmentId())
                .startTime(view.getStartTime())
                .customerName(view.getCustomerName())
                .serviceName(view.getServiceName())
                .technicianName(view.getTechnicianName())
                .status(view.getStatus())
                .build()
        ).collect(Collectors.toList());
    }
    }

