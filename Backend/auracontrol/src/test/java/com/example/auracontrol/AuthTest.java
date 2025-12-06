package com.example.auracontrol;
import com.example.auracontrol.auth.AuthService;
import com.example.auracontrol.auth.dto.AuthResponse;
import com.example.auracontrol.auth.dto.LoginRequest;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.shared.security.JwtService;
import com.example.auracontrol.user.Role;
import com.example.auracontrol.user.User;
import com.example.auracontrol.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
public class AuthTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @InjectMocks
    private AuthService authService;


    @Test
    @DisplayName("Should return Token when login credentials are correct")
    void login_Success() throws Exception {

        LoginRequest request = new LoginRequest("test@gmail.com", "password123");


        User mockUser = new User();
        mockUser.setEmail("test@gmail.com");
        mockUser.setRole(Role.CUSTOMER);
        mockUser.setUser_id(1L);


        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(mockUser));


        when(jwtService.generateToken(mockUser)).thenReturn("fake-jwt-token");


        AuthResponse response = authService.login(request);


        assertNotNull(response);
        assertEquals("fake-jwt-token", response.getToken());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when password is wrong")
    void login_WrongPassword() {

        LoginRequest request = new LoginRequest("test@gmail.com", "wrongpass");


        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));


        assertThrows(BadCredentialsException.class, () -> {
            authService.login(request);
        });


        verify(jwtService, never()).generateToken(any());
    }


    @Test
    @DisplayName("Should throw ResourceNotFoundException when email does not exist")
    void login_EmailNotFound() {
        LoginRequest request = new LoginRequest("nonexistent@gmail.com", "123");


        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        // --- ACT & ASSERT ---
        assertThrows(ResourceNotFoundException.class, () -> {
            authService.login(request);
        });
    }
}
