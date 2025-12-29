package com.example.auracontrol.admin.controller;

import com.example.auracontrol.admin.service.AdminResourceService;
import com.example.auracontrol.admin.dto.ResourceDto;
import com.example.auracontrol.booking.entity.Resource;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/resources")
@RequiredArgsConstructor
public class AdminResourceController {
    private final AdminResourceService adminResourceService;

    // GET /api/admin/resources/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminResourceService.getResourceById(id));
    }

    // POST /api/admin/resources
    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody @Valid ResourceDto request) {
        Resource newResource = adminResourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newResource);
    }

    // PUT /api/admin/resources/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(
            @PathVariable Integer id,
            @RequestBody @Valid ResourceDto request
    ) {
        return ResponseEntity.ok(adminResourceService.updateResource(id, request));
    }

    // DELETE /api/admin/resources/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Integer id) {
        adminResourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping
    public ResponseEntity<Page<Resource>> getResources(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<Resource> result = adminResourceService.searchResources(keyword, type, page, size);
        return ResponseEntity.ok(result);
    }
}
