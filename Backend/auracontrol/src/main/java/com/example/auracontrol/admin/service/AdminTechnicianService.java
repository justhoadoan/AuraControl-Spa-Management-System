package com.example.auracontrol.admin.service;

import com.example.auracontrol.admin.dto.TechnicianRequest;
import com.example.auracontrol.admin.dto.TechnicianResponse;
import com.example.auracontrol.exception.DuplicateResourceException;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.service.ServiceRepository;
import com.example.auracontrol.service.TechnicianServiceSkill;
import com.example.auracontrol.user.Role;
import com.example.auracontrol.user.entity.Technician;
import com.example.auracontrol.user.entity.User;
import com.example.auracontrol.user.repository.TechnicianRepository;
import com.example.auracontrol.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminTechnicianService {
    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final PasswordEncoder passwordEncoder;


    @Transactional(readOnly = true)
    public Page<TechnicianResponse> getAllTechnicians(Pageable pageable) {
        Page<Technician> pageResult = technicianRepository.findAll(pageable);
        return pageResult.map(this::mapToResponse);
    }

    //Create
    @Transactional
    public TechnicianResponse createTechnician(TechnicianRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }
        User user = new User();
        user.setName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.TECHNICIAN);
        user.setEnabled(true);
        userRepository.save(user);

        Technician tech = new Technician();
        tech.setUser(user);


        if (request.getServiceIds() != null) {
            List<com.example.auracontrol.service.Service> services = serviceRepository.findByServiceIdInAndIsActiveTrue(request.getServiceIds());

            tech.setSkills(services.stream()
                    .map(service -> {
                        TechnicianServiceSkill skill = new TechnicianServiceSkill();
                        skill.setTechnician(tech);
                        skill.setService(service);
                        return skill;
                    })
                    .collect(Collectors.toSet()));
        } else {
            tech.setSkills(new HashSet<>());
        }

        return mapToResponse(technicianRepository.save(tech));
    }

    // 3. UPDATE
    @Transactional
    public TechnicianResponse updateTechnician(Integer id, TechnicianRequest request) {

        Technician tech = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician does not exists"));

        User user = tech.getUser();
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setName(request.getFullName());
        }


        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getServiceIds() != null) {
            tech.getSkills().clear();

            List<com.example.auracontrol.service.Service> newServices =
                    serviceRepository.findByServiceIdInAndIsActiveTrue(request.getServiceIds());


            for (com.example.auracontrol.service.Service service : newServices) {

                TechnicianServiceSkill skill = new TechnicianServiceSkill();
                skill.setTechnician(tech);
                skill.setService(service);

                tech.getSkills().add(skill);
            }
        }

        return mapToResponse(technicianRepository.save(tech));
    }

    private TechnicianResponse mapToResponse(Technician t) {
        TechnicianResponse res = new TechnicianResponse();
        res.setTechnicianId(t.getTechnicianId());

        if (t.getUser() != null) {
            res.setFullName(t.getUser().getName());
            res.setEmail(t.getUser().getEmail());
        }


        if (t.getSkills() != null) {
            res.setServiceNames(t.getSkills().stream()
                    .map(skill -> skill.getService().getName())
                    .collect(Collectors.toList()));

            res.setServiceIds(t.getSkills().stream()
                    .map(skill -> skill.getService().getServiceId())
                    .collect(Collectors.toList()));
        }
        return res;
    }
}
