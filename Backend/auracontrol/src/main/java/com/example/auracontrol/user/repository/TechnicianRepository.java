package com.example.auracontrol.user.repository;

import com.example.auracontrol.booking.dto.TechnicianOptionDto;
import com.example.auracontrol.user.entity.Technician;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TechnicianRepository extends JpaRepository<Technician, Integer> {

    @Query(value = "SELECT * FROM get_available_technicians(:serviceId, CAST(:checkTime AS TIMESTAMP))",
            nativeQuery = true)
    List<TechnicianOptionDto> findAvailableTechnicians(
            @Param("serviceId") Integer serviceId,
            @Param("checkTime") LocalDateTime checkTime
    );

    @Query(value = "SELECT t.* FROM technician t " +
            "JOIN technician_services ts ON t.technician_id = ts.technician_id " +
            "JOIN users u ON t.user_id = u.user_id " +
            "WHERE ts.service_id = :serviceId AND u.is_enabled = true",
            nativeQuery = true)
    List<Technician> findAllByServiceId(@Param("serviceId") Integer serviceId);


    Page<Technician> findAllByUser_EnabledTrue(Pageable pageable);


    Optional<Technician> findByUser_EmailAndUser_EnabledTrue(String email);


    Optional<Technician> findByUser_UserIdAndUser_EnabledTrue(Integer userId);

    Optional<Technician> findByUser_UserId(Integer userId);
}

