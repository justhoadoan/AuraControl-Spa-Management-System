package com.example.auracontrol.booking.repository;

import com.example.auracontrol.booking.entity.Appointment;
import com.example.auracontrol.booking.entity.AppointmentResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentResourceRepository extends JpaRepository<AppointmentResource,Integer> {
    @Query("SELECT ar.appointment FROM AppointmentResource ar " +
            "WHERE ar.resource.type = :type " +
            "AND ar.appointment.startTime BETWEEN :start AND :end " +
            "AND ar.appointment.status <> 'CANCELLED'")
    List<Appointment> findAppointmentsByResourceTypeAndDate(
            @Param("type") String type,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
