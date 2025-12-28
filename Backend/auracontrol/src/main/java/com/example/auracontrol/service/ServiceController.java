package com.example.auracontrol.service;

import com.example.auracontrol.service.dto.ServiceBookingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {
    private final ServiceService serviceService;

    @GetMapping("/active")
    public ResponseEntity<Page<ServiceBookingResponse>> getActiveServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {

        Page<Service> servicePage = serviceService.getServicesForBooking(page, size);


        Page<ServiceBookingResponse> dtoPage = servicePage.map(service ->
                ServiceBookingResponse.builder()
                        .serviceId(service.getServiceId())
                        .name(service.getName())
                        .description(service.getDescription())
                        .price(service.getPrice())
                        .durationMinutes(service.getDurationMinutes())
                        .build()
        );

        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceBookingResponse> getServiceDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(serviceService.getServiceDetailForCustomer(id));

    }
}
