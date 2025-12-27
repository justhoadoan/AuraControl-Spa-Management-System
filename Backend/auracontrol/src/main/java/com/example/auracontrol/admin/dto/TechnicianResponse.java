package com.example.auracontrol.admin.dto;

import lombok.Data;

import java.util.List;
@Data
public class TechnicianResponse {
    private Integer technicianId;
    private String fullName;
    private String email;
    private List<String> serviceNames;
    private List<Integer> serviceIds;
}
