package com.example.auracontrol.admin.controller;

import com.example.auracontrol.service.Service;
import com.example.auracontrol.service.ServiceService;
import com.example.auracontrol.service.dto.ServiceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/admin/services")
@RequiredArgsConstructor
public class AdminServiceController {
    private final ServiceService serviceService;

    /**
     * 1. Get a list of all services
     * Method: GET
     * URL: /api/admin/services
     */
    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        List<Service> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }

    /**
     * 2. Get details of a specific service
     * Method: GET
     * URL: /api/admin/services/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Integer id) {
        Service service = serviceService.getServiceById(id);
        return ResponseEntity.ok(service);
    }

    /**
     * 3. Create a new service
     * Method: POST
     * URL: /api/admin/services
     */
    @PostMapping
    public ResponseEntity<Service> createService(@RequestBody ServiceRequest request) {
        Service newService = serviceService.create(request);
        // Return 201 Created status
        return new ResponseEntity<>(newService, HttpStatus.CREATED);
    }

    /**
     * 4. Update an existing service
     * Method: PUT
     * URL: /api/admin/services/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(
            @PathVariable Integer id,
            @RequestBody ServiceRequest request
    ) {
        Service updatedService = serviceService.update(id, request);
        return ResponseEntity.ok(updatedService);
    }

    /**
     * 5. Delete a service
     * Method: DELETE
     * URL: /api/admin/services/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Integer id) {
        serviceService.deleteService(id);
        // Return 204 No Content (Successful deletion, no body returned)
        return ResponseEntity.noContent().build();
    }
}
