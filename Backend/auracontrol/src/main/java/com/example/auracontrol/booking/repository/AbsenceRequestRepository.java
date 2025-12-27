package com.example.auracontrol.booking.repository;

import com.example.auracontrol.booking.entity.AbsenceRequest;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface AbsenceRequestRepository extends JpaRepository<AbsenceRequest, Integer> {
    // 1. Find absence requests by status (used for Admin approval)
    List<AbsenceRequest> findByStatusOrderByCreatedAtDesc(String status);

    // 2. Retrieve absence history of a specific technician
    List<AbsenceRequest> findByTechnician_TechnicianIdOrderByStartDateDesc(Integer technicianId);


    // 3. Retrieve absence requests within a specific day
// (Used by getAvailableSlots method in AppointmentService)
// This query finds all APPROVED absence requests of the given technicians
// that overlap with the specified day
    @Query("SELECT a FROM AbsenceRequest a " +
            "WHERE a.technician.technicianId IN :techIds " +
            "AND a.status = :status " +
            "AND a.startDate < :endOfDay " +
            "AND a.endDate > :startOfDay")
    List<AbsenceRequest> findByTechnicianIdInAndStatusAndDateRange(
            @Param("techIds") List<Integer> techIds,
            @Param("status") String status,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("SELECT a FROM AbsenceRequest a ORDER BY CASE WHEN a.status = 'PENDING' THEN 0 ELSE 1 END, a.createdAt DESC")
    List<AbsenceRequest> findAllRequestsOrdered();


    @Query("SELECT ar FROM AbsenceRequest ar WHERE ar.technician.technicianId = :techId " +
            "AND ar.endDate >= :from AND ar.startDate <= :to")
    List<AbsenceRequest> findByTechnicianIdAndDateRange(Integer techId, LocalDateTime from, LocalDateTime to);


}
