package com.example.auracontrol.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

public interface TechnicianRepository extends JpaRepository<Technician, Integer> {

    @Query(value = "SELECT * FROM get_available_technicians(:serviceId, CAST(:checkTime AS TIMESTAMP))",
            nativeQuery = true)
    List<TechnicianOptionProjection> findAvailableTechnicians(
            @Param("serviceId") Integer serviceId,
            @Param("checkTime") LocalDateTime checkTime
    );
}

