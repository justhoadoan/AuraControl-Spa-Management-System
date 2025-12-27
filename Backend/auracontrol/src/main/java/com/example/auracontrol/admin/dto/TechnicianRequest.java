package com.example.auracontrol.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class TechnicianRequest {

    private String fullName;

    private String email;

    private String password;

    private List<Integer> serviceIds;
}
