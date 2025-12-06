package com.example.auracontrol.auth;

import com.example.auracontrol.auth.dto.AuthResponse;
import com.example.auracontrol.auth.dto.LoginRequest;
import com.example.auracontrol.auth.dto.RegisterRequest;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.shared.security.JwtService;
import com.example.auracontrol.user.Role;
import com.example.auracontrol.user.User;
import com.example.auracontrol.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private  final UserRepository userRepository;
    private  final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;


    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) throws Exception {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new Exception("Email already exists");
        }
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setName(registerRequest.getName());

        user.setRole(Role.CUSTOMER);

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(jwtToken);

        return authResponse;

    }
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) throws Exception {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(()-> new ResourceNotFoundException("User not found"));
        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);

    }


}
