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

    // 3. OVERLAP CHECK (Important):
// Check whether a technician has any absence request (APPROVED or PENDING)
// that overlaps with the given start-end time range.
// Logic: (AbsenceStart < CheckedEnd) AND (AbsenceEnd > CheckedStart)
    @Query("SELECT COUNT(a) > 0 FROM AbsenceRequest a " +
            "WHERE a.technician.technicianId = :techId " +
            "AND a.status IN ('APPROVED', 'PENDING') " +
            "AND a.startDate < :endTime " +
            "AND a.endDate > :startTime")
    boolean existsOverlappingRequest(@Param("techId") Integer technicianId,
                                     @Param("startTime") LocalDateTime startTime,
                                     @Param("endTime") LocalDateTime endTime);

    // 4. Retrieve absence requests within a specific day
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



}
