package com.example.auracontrol.service;

import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.service.dto.ServiceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceService {
    private final ServiceRepository serviceRepository;

    public List<com.example.auracontrol.service.Service> getAllServices() {
        return serviceRepository.findAll();
    }
    public com.example.auracontrol.service.Service getServiceById(Integer id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find service: " + id));
    }
    @Transactional
    public com.example.auracontrol.service.Service create(ServiceRequest request) {

        com.example.auracontrol.service.Service newService = com.example.auracontrol.service.Service.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .durationMinutes(request.getDurationMinutes())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return serviceRepository.save(newService);

    }
    @Transactional
    public com.example.auracontrol.service.Service update(Integer id, ServiceRequest request) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy dịch vụ để cập nhật.");
        }

        int rowsAffected = serviceRepository.update(
                id,
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getDurationMinutes(),
                request.getIsActive()
        );


        if (rowsAffected > 0) {
            return getServiceById(id);
        } else {
            throw new RuntimeException("Lỗi cập nhật dịch vụ.");
        }
    }
    @Transactional
    public void deleteService(Integer serviceId) {
        // 1. Tìm service
        com.example.auracontrol.service.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service doesnot exists: " + serviceId));


        service.setIsActive(false);

        // 3. Lưu lại
        serviceRepository.save(service);
    }
}
