package com.example.auracontrol.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResourceDto {
    @NotBlank(message = "Resource name is required")
    private String name;

    @NotBlank(message = "Resource type is required")
    private String type; // Ví dụ: "ROOM", "MACHINE", "BED"
}
