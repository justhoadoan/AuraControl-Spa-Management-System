package com.example.auracontrol.admin.dto;

import lombok.Data;

@Data
public class CustomerListResponse {
    private Integer userId;
    private Integer customerId;
    private String name;
    private String email;
    private long totalAppointments;
    // Constructor này dùng cho JPQL
    public CustomerListResponse(Integer userId, String name, String email, Integer customerId, Long totalAppointments) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.customerId = customerId;
        this.totalAppointments = totalAppointments;
    }
}
