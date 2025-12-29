package com.example.auracontrol.booking.repository;

import com.example.auracontrol.booking.entity.Resource;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
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

    @Query("SELECT DISTINCT r.type FROM Resource r ORDER BY r.type")
    List<String> findDistinctTypes();

    boolean existsByType(String type);

    @Query("SELECT r FROM Resource r " +
            "WHERE r.deleted = false " +
            "AND (:keyword IS NULL OR :keyword = '' OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:type IS NULL OR :type = '' OR r.type = :type) " +
            "ORDER BY r.resourceId DESC") // Sắp xếp mới nhất lên đầu
    Page<Resource> searchResources(
            @Param("keyword") String keyword,
            @Param("type") String type,
            org.springframework.data.domain.Pageable pageable
    );
}

