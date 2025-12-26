package com.example.auracontrol.booking.repository;

import com.example.auracontrol.booking.entity.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.awt.print.Pageable;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource,Integer> {
    @Query("SELECT ar.id.resourceId FROM AppointmentResource ar " +
            "JOIN ar.appointment a " +
            "WHERE a.status <> 'CANCELLED' " +
            "AND a.startTime < :endTime AND a.endTime > :startTime")
    List<Integer> findBusyResourceIds(@Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);

    // Tìm 1 Resource rảnh theo Type
    @Query("SELECT r FROM Resource r " +
            "WHERE r.type = :type " +
            "AND r.resourceId NOT IN :busyIds")
    List<Resource> findAvailableResources(@Param("type") String type,
                                          @Param("busyIds") Collection<Integer> busyIds,
                                          Pageable pageable);

    default Optional<Resource> findFirstAvailableByType(String type, List<Integer> busyIds) {

        if (busyIds == null || busyIds.isEmpty()) {
            return findFirstByType(type);
        }


        List<Resource> result = findAvailableResources(type, (Collection<Integer>) busyIds, (Pageable) PageRequest.of(0, 1));
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }
    Optional<Resource> findFirstByType(String type);
    long countByType(String type);
    boolean existsByName(String name);
    boolean existsByNameAndResourceIdNot(String name, Integer id);

}

