package com.example.auracontrol.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Tự động tạo getters, setters, toString, equals, hashCode
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    private String email;
    private String password;
}
