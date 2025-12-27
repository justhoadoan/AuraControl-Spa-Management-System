package com.example.auracontrol.admin.controller;

import com.example.auracontrol.admin.service.AdminTechnicianService;
import com.example.auracontrol.admin.dto.TechnicianRequest;
import com.example.auracontrol.admin.dto.TechnicianResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/technicians")
@RequiredArgsConstructor
public class AdminTechnicianController {
    private final AdminTechnicianService adminTechnicianService;

    @GetMapping
    public ResponseEntity<Page<TechnicianResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("technicianId").descending());

        return ResponseEntity.ok(adminTechnicianService.getAllTechnicians(pageable));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody TechnicianRequest request) {
        return ResponseEntity.ok(adminTechnicianService.createTechnician(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody TechnicianRequest request) {
        return ResponseEntity.ok(adminTechnicianService.updateTechnician(id, request));
    }
}
