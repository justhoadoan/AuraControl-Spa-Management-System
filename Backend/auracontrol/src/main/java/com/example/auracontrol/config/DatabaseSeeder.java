package com.example.auracontrol.config;

import com.example.auracontrol.user.Role;
import com.example.auracontrol.user.entity.Technician;
import com.example.auracontrol.user.entity.User;
import com.example.auracontrol.user.repository.TechnicianRepository;
import com.example.auracontrol.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TechnicianRepository technicianRepository;
    private final PasswordEncoder passwordEncoder;

    // Config Admin cũ
    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    // Config Technician mới (Có thể set giá trị mặc định để đỡ phải sửa file properties)
    @Value("${app.technician.email:tech@example.com}")
    private String techEmail;

    @Value("${app.technician.password:123456}")
    private String techPassword;

    @Override
    public void run(String... args) throws Exception {

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println(">>> Seeded Admin User: " + adminEmail);
        }


        if (userRepository.findByEmail(techEmail).isEmpty()) {

            User techUser = new User();
            techUser.setName("Nguyen Van Ky Thuat");
            techUser.setEmail(techEmail);
            techUser.setPassword(passwordEncoder.encode(techPassword));
            techUser.setRole(Role.TECHNICIAN);
            techUser.setEnabled(true);


            User savedUser = userRepository.save(techUser);


            Technician technician = new Technician();
            technician.setUser(savedUser);


            technicianRepository.save(technician);
            System.out.println(">>> Seeded Technician User: " + techEmail);
        }
    }
}
