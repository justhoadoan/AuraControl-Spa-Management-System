package com.example.auracontrol.booking.repository;

import com.example.auracontrol.booking.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}