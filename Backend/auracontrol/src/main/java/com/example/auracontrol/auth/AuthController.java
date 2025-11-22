package com.example.auracontrol.auth;

import com.example.auracontrol.auth.dto.AuthResponse;
import com.example.auracontrol.auth.dto.LoginRequest;
import com.example.auracontrol.auth.dto.RegisterRequest;
import com.example.auracontrol.user.dto.ForgotPasswordRequest;
import com.example.auracontrol.user.dto.ResetPasswordRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("Registration successful! Please check your email to activate your account.");
    }

    // Account verification (Frontend will call this endpoint)
    @GetMapping("/verify-account")
    public ResponseEntity<String> verifyAccount(@RequestParam String token) {
        authService.verifyAccount(token);
        return ResponseEntity.ok("Your account has been activated! You can now log in.");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest loginRequest
    ) throws Exception {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request.getEmail());

        return ResponseEntity.ok("If the email exists, a password reset instruction has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request.getToken(), request.getNewPassword());

        return ResponseEntity.ok("Password has been reset successfully. You may now log in.");
    }

}
