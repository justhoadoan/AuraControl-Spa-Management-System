package com.example.auracontrol.service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Integer> {

    @Override
    @Query("SELECT s FROM Service s ORDER BY s.serviceId DESC")
    List<Service> findAll();
    List<Service> findByIsActiveTrue();
    @Override
    @Query("SELECT s FROM Service s WHERE s.serviceId = :id")
    Optional<Service> findById(@Param("id") Integer id);

    @Modifying
    @Query("UPDATE Service s SET " +
            "s.name = :name, " +
            "s.description = :desc, " +
            "s.price = :price, " +
            "s.durationMinutes = :duration, " +
            "s.isActive = :active " +
            "WHERE s.serviceId = :id")
    int update(
            @Param("id") Integer id,
            @Param("name") String name,
            @Param("desc") String description,
            @Param("price") BigDecimal price,
            @Param("duration") Integer duration,
            @Param("active") Boolean isActive
    );

    @Override
    @Modifying
    @Query("DELETE FROM Service s WHERE s.serviceId = :id")
    void deleteById(@Param("id") Integer id);

    Page<Service> findByIsActiveTrue(Pageable pageable);

    // Search by name or description
    @Query("SELECT s FROM Service s WHERE s.isActive = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Service> searchActiveServices(@Param("keyword") String keyword, Pageable pageable);

    Optional<Service> findByServiceIdAndIsActiveTrue(Integer id);

    List<com.example.auracontrol.service.Service> findByServiceIdInAndIsActiveTrue(List<Integer> ids);


}
