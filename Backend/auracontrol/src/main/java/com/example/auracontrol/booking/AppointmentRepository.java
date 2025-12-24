package com.example.auracontrol.booking;

import org.springframework.data.jpa.repository.JpaRepository;
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
}