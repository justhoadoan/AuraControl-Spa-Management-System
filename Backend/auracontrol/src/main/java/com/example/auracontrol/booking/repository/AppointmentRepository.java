package com.example.auracontrol.booking.repository;

import com.example.auracontrol.admin.dto.RevenueStatDto;
import com.example.auracontrol.admin.dto.TodayStatsView;
import com.example.auracontrol.admin.dto.UpcomingAppointmentView;
import com.example.auracontrol.booking.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findAllByStartTimeBetweenAndStatusNot(
            LocalDateTime start,
            LocalDateTime end,
            String status
    );
    List<Appointment> findByCustomer_User_EmailAndStartTimeBeforeOrderByStartTimeDesc(
            String email,
            LocalDateTime now
    );

    List<Appointment> findByCustomer_User_EmailAndStartTimeAfterAndStatusNotOrderByStartTimeAsc(
            String email,
            LocalDateTime now,
            String status
    );

    long countByCustomer_CustomerId(Integer customerId);

    List<Appointment> findByCustomer_CustomerIdOrderByStartTimeDesc(Integer customerId);

    @Query(value = "SELECT * FROM get_revenue_statistics(:startDate, :endDate, :type)", nativeQuery = true)
    List<RevenueStatDto> getRevenueStatistics(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("type") String type
    );

    @Query("SELECT COALESCE(SUM(a.finalPrice), 0) FROM Appointment a " +
            "WHERE a.status = 'COMPLETED' " +
            "AND a.endTime BETWEEN :start AND :end")
    BigDecimal sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


    @Query("SELECT COUNT(a) FROM Appointment a " +
            "WHERE a.status != 'CANCELLED' " +
            "AND a.startTime BETWEEN :start AND :end")
    long countAppointmentsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT a FROM Appointment a " +
            "WHERE a.startTime >= :now " +
            "AND a.status != :status " +
            "ORDER BY a.startTime ASC")
    List<Appointment> findUpcomingAppointments(
            @Param("now") LocalDateTime now,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("SELECT a FROM Appointment a WHERE a.technician.technicianId = :techId " +
            "AND a.status != 'CANCELLED' " +
            "AND a.startTime < :from AND a.endTime > :to")
    List<Appointment> findByTechnicianIdAndDateRange(Integer techId, LocalDateTime from, LocalDateTime to);


    @Query(value = "SELECT * FROM v_upcoming_appointments ORDER BY start_time ASC LIMIT 10",
            nativeQuery = true)
    List<UpcomingAppointmentView> getUpcomingAppointmentsView();


    @Query(value = "SELECT * FROM v_today_stats", nativeQuery = true)
    TodayStatsView getTodayStatsView();

    @Query("SELECT a FROM Appointment a " +
            "WHERE (:status IS NULL OR a.status = :status) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(a.customer.user.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.technician.user.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.service.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY a.startTime DESC")
    Page<Appointment> findAppointmentsForAdmin(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable
    );
}