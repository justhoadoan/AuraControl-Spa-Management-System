package com.example.auracontrol.booking.repository;

import com.example.auracontrol.admin.dto.RevenueStatDto;
import com.example.auracontrol.booking.entity.Appointment;
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


}