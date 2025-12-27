package com.example.auracontrol.admin.controller;

import com.example.auracontrol.admin.service.AdminCustomerService;
import com.example.auracontrol.admin.dto.CustomerDetailResponse;
import com.example.auracontrol.admin.dto.CustomerListResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {
    private final AdminCustomerService adminCustomerService;
    /**
     * 1. API to retrieve customer list (for Table view)
     * - Supports pagination
     * - Supports searching by name or email
     *
     * Example URLs:
     * - Get first page (default): GET /api/admin/customers
     * - Search with keyword "Nguyen": GET /api/admin/customers?keyword=Nguyen
     * - Go to page 2: GET /api/admin/customers?page=1&size=10
     */
    @GetMapping
    public ResponseEntity<Page<CustomerListResponse>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("userId").descending());


        Page<CustomerListResponse> result = adminCustomerService.getCustomers(keyword, pageable);

        return ResponseEntity.ok(result);
    }

    /**
     * 2. API to view customer profile details & booking history (for Modal/Detail page)
     * - Input is userId (because the customer list is displayed based on User)
     * - The service will automatically resolve the corresponding CustomerID
     *   to retrieve booking history
     *
     * Example URL:
     * - GET /api/admin/customers/5
     */
    @GetMapping("/{userId}")
    public ResponseEntity<CustomerDetailResponse> getCustomerDetail(@PathVariable Integer userId) {
        // Gọi Service xử lý
        CustomerDetailResponse result = adminCustomerService.getCustomerDetail(userId);

        return ResponseEntity.ok(result);
    }

}
