package com.example.auracontrol.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UpdateProfileResponseWrapper {
    private String message;
    private UserProfileResponse user;
}
