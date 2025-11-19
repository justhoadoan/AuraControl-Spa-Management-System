package com.example.auracontrol.config;

import com.example.auracontrol.user.Role;
import com.example.auracontrol.user.User;
import com.example.auracontrol.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {

        if (userRepository.findByEmail(adminEmail).isEmpty()) {

            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail(adminEmail);
            admin.setPhone_number("0000000000");

            admin.setPassword(passwordEncoder.encode(adminPassword));

            admin.setRole(Role.ADMIN);

            userRepository.save(admin);

        }
    }
}
