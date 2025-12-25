package com.example.auracontrol.user.controller;
import com.example.auracontrol.user.service.UserService;
import com.example.auracontrol.user.dto.ChangePasswordRequest;
import com.example.auracontrol.user.dto.UpdateProfileRequest;
import com.example.auracontrol.user.dto.UpdateProfileResponseWrapper;
import com.example.auracontrol.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    /**
     * GET /api/users/me
     * Get user's detail
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }
    /**
     * PUT /api/users/me
     * Update
     */
    @PutMapping("/me")
    public ResponseEntity<UpdateProfileResponseWrapper> updateProfile(
            @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateCurrentUserProfile(request));
    }
    /**
     * PATCH /api/users/me/password
     * Change password
     */
    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(request);
        return ResponseEntity.ok(Collections.singletonMap("message", "Password changed successfully"));
    }
}
