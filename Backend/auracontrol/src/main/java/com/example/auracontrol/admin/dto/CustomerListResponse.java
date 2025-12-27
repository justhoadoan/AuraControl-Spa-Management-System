package com.example.auracontrol.admin.dto;

import lombok.Data;

@Data
public class CustomerListResponse {
    private Integer userId;
    private Integer customerId;
    private String name;
    private String email;
    private long totalAppointments;
}
