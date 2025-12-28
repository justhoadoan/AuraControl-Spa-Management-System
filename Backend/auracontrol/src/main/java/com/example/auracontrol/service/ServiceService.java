package com.example.auracontrol.service;

import com.example.auracontrol.booking.entity.ServiceResourceRequirement;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.service.dto.ServiceBookingResponse;
import com.example.auracontrol.service.dto.ServiceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
                .resourceRequirements(new ArrayList<>())
                .build();
        if (request.getResources() != null && !request.getResources().isEmpty()) {
            for (ServiceRequest.ServiceResourceDto resDto : request.getResources()) {

                ServiceResourceRequirement resource = new ServiceResourceRequirement();
                resource.setResourceType(resDto.getResourceType());
                resource.setQuantity(resDto.getQuantity());


                resource.setService(newService);

                newService.getResourceRequirements().add(resource);
            }
        }
        return serviceRepository.save(newService);

    }
    @Transactional
    public com.example.auracontrol.service.Service update(Integer id, ServiceRequest request) {

        com.example.auracontrol.service.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find service: " + id));


        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setDurationMinutes(request.getDurationMinutes());
        if (request.getIsActive() != null) {
            service.setIsActive(request.getIsActive());
        }


        if (request.getResources() != null) {
            service.getResourceRequirements().clear();


            for (ServiceRequest.ServiceResourceDto resDto : request.getResources()) {
                ServiceResourceRequirement resource = new ServiceResourceRequirement();
                resource.setResourceType(resDto.getResourceType());
                resource.setQuantity(resDto.getQuantity());


                resource.setService(service);

                service.getResourceRequirements().add(resource);
            }
        }


        return serviceRepository.save(service);
    }
    @Transactional
    public void deleteService(Integer serviceId) {

        com.example.auracontrol.service.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service does not exists: " + serviceId));

        service.setIsActive(false);


        serviceRepository.save(service);
    }
    public Page<ServiceBookingResponse> getServicesForBooking(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<com.example.auracontrol.service.Service> entities = serviceRepository.findByIsActiveTrue(pageable);

        return entities.map(this::mapToResponse);
    }


    public ServiceBookingResponse getServiceDetailForCustomer(Integer id) {
        com.example.auracontrol.service.Service service = serviceRepository.findByServiceIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tồn tại"));


        return mapToResponse(service);
    }
    private ServiceBookingResponse mapToResponse(com.example.auracontrol.service.Service service) {
        return ServiceBookingResponse.builder()
                .serviceId(service.getServiceId())
                .name(service.getName())
                .description(service.getDescription())
                .price(service.getPrice())
                .durationMinutes(service.getDurationMinutes())
                .build();
    }
}
