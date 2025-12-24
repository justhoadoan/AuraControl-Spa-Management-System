package com.example.auracontrol.user;

import com.example.auracontrol.booking.dto.TechnicianOptionDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TechnicianRepository extends JpaRepository<Technician, Integer> {

    @Query(value = "SELECT * FROM get_available_technicians(:serviceId, CAST(:checkTime AS TIMESTAMP))",
            nativeQuery = true)
    List<TechnicianOptionDto> findAvailableTechnicians(
            @Param("serviceId") Integer serviceId,
            @Param("checkTime") LocalDateTime checkTime
    );
    @Query(value = "SELECT t.* FROM technician t " +
            "JOIN technician_services ts ON t.technician_id = ts.technician_id " +
            "WHERE ts.service_id = :serviceId",
            nativeQuery = true)
    List<Technician> findAllByServiceId(@Param("serviceId") Integer serviceId);
}

