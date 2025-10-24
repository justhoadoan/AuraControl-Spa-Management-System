package com.example.auracontrol.auth;

import com.example.auracontrol.auth.dto.AuthResponse;
import com.example.auracontrol.auth.dto.LoginRequest;
import com.example.auracontrol.auth.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest registerRequest
    ) throws Exception {
        return ResponseEntity.ok(authService.register(registerRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest loginRequest
    ) throws Exception {
        return ResponseEntity.ok(authService.login(loginRequest));
    }


}
