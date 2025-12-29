package com.example.auracontrol.booking.repository;

import com.example.auracontrol.booking.entity.ServiceResourceRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ServiceResourceRequirementRepository extends JpaRepository<ServiceResourceRequirement,Integer> {
    @Query("SELECT s FROM ServiceResourceRequirement s WHERE s.service.serviceId = :id")
   List<ServiceResourceRequirement> findByServiceId(@Param("id") Integer id);

    List<ServiceResourceRequirement> findAllByService_ServiceId(Integer serviceId);
}
