package com.example.auracontrol.booking.repository;

import com.example.auracontrol.booking.entity.Resource;
import com.example.auracontrol.booking.entity.ServiceResourceRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource,Integer> {
    @Query("SELECT ar.id.resourceId FROM AppointmentResource ar " +
            "JOIN ar.appointment a " +
            "WHERE a.status <> 'CANCELLED' " +
            "AND a.startTime < :endTime AND a.endTime > :startTime")
    List<Long> findBusyResourceIds(@Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);

    // Tìm 1 Resource rảnh theo Type
    @Query(value = "SELECT * FROM resources r " +
            "WHERE r.type = :type " +
            "AND r.resource_id NOT IN (:busyIds) " +
            "LIMIT 1", nativeQuery = true)
    Optional<Resource> findFirstAvailableByType(@Param("type") String type,
                                                @Param("busyIds") List<Long> busyIds);
    long countByType(String type);

}

