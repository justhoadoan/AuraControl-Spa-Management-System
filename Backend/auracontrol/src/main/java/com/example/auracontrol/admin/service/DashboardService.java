package com.example.auracontrol.admin.service;

import com.example.auracontrol.admin.dto.DashboardAppointmentDto;
import com.example.auracontrol.admin.dto.DashboardStatsDto;
import com.example.auracontrol.admin.dto.RevenueStatDto;
import com.example.auracontrol.booking.entity.Appointment;
import com.example.auracontrol.booking.repository.AppointmentRepository;
import com.example.auracontrol.exception.InvalidRequestException;
import com.example.auracontrol.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
        if (period == null) {
            throw new InvalidRequestException("Period must not be null");
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
                throw new IllegalArgumentException("Invalid period: " + period);
        }

        return appointmentRepository.getRevenueStatistics(start, end, type);
    }
    /**
     * API 1: Retrieve statistics for the 3 dashboard summary cards
     */
    public DashboardStatsDto getDashboardStats() {

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        // 1. Today's revenue
        BigDecimal revenue = appointmentRepository.sumRevenueBetween(startOfDay, endOfDay);

        // 2. Today's appointments (number of customers coming today)
        long appointments = appointmentRepository.countAppointmentsBetween(startOfDay, endOfDay);

        // 3. New customers (accounts registered today)
        long newCustomers = userRepository.countNewCustomers(startOfDay, endOfDay);

        return DashboardStatsDto.builder()
                .todayRevenue(revenue)
                .todayAppointments(appointments)
                .newCustomers(newCustomers)
                .build();
    }

    /**
     * API 2: Retrieve the next 10 upcoming appointments
     */
    public List<DashboardAppointmentDto> getUpcomingAppointments() {

        // Retrieve appointments from the current time onwards, excluding cancelled ones
        List<Appointment> appointments = appointmentRepository
                .findTop10ByStartTimeAfterAndStatusNotOrderByStartTimeAsc(
                        LocalDateTime.now(),
                        "CANCELLED"
                );

        return appointments.stream().map(appt -> {

            String techName = (appt.getTechnician() != null && appt.getTechnician().getUser() != null)
                    ? appt.getTechnician().getUser().getName()
                    : "Unassigned";

            return DashboardAppointmentDto.builder()
                    .appointmentId(appt.getAppointmentId())
                    .startTime(appt.getStartTime())
                    .customerName(appt.getCustomer().getUser().getName())
                    .serviceName(appt.getService().getName())
                    .technicianName(techName)
                    .status(appt.getStatus())
                    .build();

        }).collect(Collectors.toList());
    }


}
