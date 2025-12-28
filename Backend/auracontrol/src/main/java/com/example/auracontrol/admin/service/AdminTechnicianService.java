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

import java.util.*;
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
        Page<Technician> pageResult = technicianRepository.findAllByUser_EnabledTrue(pageable);
        return pageResult.map(this::mapToResponse);
    }

    @Transactional
    public TechnicianResponse createTechnician(TechnicianRequest request) {

        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());

        User user;
        Technician tech;

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (Boolean.TRUE.equals(existingUser.isEnabled())) {
                throw new DuplicateResourceException("Email already exists and is active");
            }


            user = existingUser;
            user.setEnabled(true);
            user.setName(request.getFullName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);


            tech = technicianRepository.findByUser_UserId(user.getUserId())
                    .orElseGet(() -> {
                        Technician newTech = new Technician();
                        newTech.setUser(user);
                        return newTech;
                    });

        } else {

            user = new User();
            user.setName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(Role.TECHNICIAN);
            user.setEnabled(true);
            userRepository.save(user);

            tech = new Technician();
            tech.setUser(user);
            tech.setSkills(new HashSet<>());
        }



        if (tech.getSkills() == null) {
            tech.setSkills(new HashSet<>());
        }

        Set<Integer> requestServiceIds = (request.getServiceIds() == null)
                ? new HashSet<>()
                : new HashSet<>(request.getServiceIds());


        tech.getSkills().removeIf(skill -> !requestServiceIds.contains(skill.getService().getServiceId()));


        Set<Integer> currentServiceIds = tech.getSkills().stream()
                .map(skill -> skill.getService().getServiceId())
                .collect(Collectors.toSet());

        if (!requestServiceIds.isEmpty()) {

            List<com.example.auracontrol.service.Service> servicesToAdd =
                    serviceRepository.findByServiceIdInAndIsActiveTrue(new ArrayList<>(requestServiceIds));

            for (com.example.auracontrol.service.Service service : servicesToAdd) {

                if (!currentServiceIds.contains(service.getServiceId())) {
                    TechnicianServiceSkill skill = new TechnicianServiceSkill();
                    skill.setTechnician(tech);
                    skill.setService(service);

                    tech.getSkills().add(skill);
                }
            }
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
            Set<Integer> newServiceIds = new HashSet<>(request.getServiceIds());


            tech.getSkills().removeIf(skill -> !newServiceIds.contains(skill.getService().getServiceId()));


            Set<Integer> existingServiceIds = tech.getSkills().stream()
                    .map(skill -> skill.getService().getServiceId())
                    .collect(Collectors.toSet());

            List<Integer> idsToAdd = newServiceIds.stream()
                    .filter(serviceId -> !existingServiceIds.contains(id))
                    .collect(Collectors.toList());

            if (!idsToAdd.isEmpty()) {
                List<com.example.auracontrol.service.Service> servicesToAdd =
                        serviceRepository.findByServiceIdInAndIsActiveTrue(idsToAdd);

                for (com.example.auracontrol.service.Service service : servicesToAdd) {
                    TechnicianServiceSkill skill = new TechnicianServiceSkill();
                    skill.setTechnician(tech);
                    skill.setService(service);
                    tech.getSkills().add(skill);
                }
            }
        }

        return mapToResponse(technicianRepository.save(tech));
    }
    @Transactional
    public void deleteTechnician(Integer technicianId) {
        // 1. Tìm Technician
        Technician tech = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));

        User user = tech.getUser();

        if (user == null) {
            throw new ResourceNotFoundException("User associated with technician not found");
        }

        user.setEnabled(false);

        technicianRepository.save(tech);
    }
    private TechnicianResponse mapToResponse(Technician t) {
        TechnicianResponse res = new TechnicianResponse();
        res.setTechnicianId(t.getTechnicianId());

        if (t.getUser() != null) {
            res.setFullName(t.getUser().getName());
            res.setEmail(t.getUser().getEmail());
        }
        if (t.getSkills() != null) {

            List<com.example.auracontrol.service.Service> activeServices = t.getSkills().stream()
                    .map(skill -> skill.getService())
                    .filter(service -> service != null && Boolean.TRUE.equals(service.getIsActive()))
                    .collect(Collectors.toList());


            res.setServiceNames(activeServices.stream()
                    .map(com.example.auracontrol.service.Service::getName)
                    .collect(Collectors.toList()));

            res.setServiceIds(activeServices.stream()
                    .map(com.example.auracontrol.service.Service::getServiceId)
                    .collect(Collectors.toList()));
        }
        return res;
    }
}
