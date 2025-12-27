package com.example.auracontrol.booking.service;

import com.example.auracontrol.admin.dto.AbsenceRequestResponse;
import com.example.auracontrol.booking.dto.AbsenceRequestDto;
import com.example.auracontrol.booking.entity.AbsenceRequest;
import com.example.auracontrol.booking.repository.AbsenceRequestRepository;
import com.example.auracontrol.exception.DuplicateResourceException;
import com.example.auracontrol.exception.InvalidRequestException;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.user.entity.Technician;
import com.example.auracontrol.user.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AbsenceRequestService {
    private final AbsenceRequestRepository absenceRequestRepository;
    private final TechnicianRepository technicianRepository;

    @Transactional
    public AbsenceRequest submitRequest(Integer technicianId, AbsenceRequestDto requestDto) {
        // Validation cơ bản
        if (requestDto.getStartDate().isBefore(LocalDateTime.now())) {
            throw new InvalidRequestException("Can't submit request because start date is before now.");
        }
        if (requestDto.getEndDate().isBefore(requestDto.getStartDate())) {
            throw new InvalidRequestException("Can't submit request because end date is before start date.");
        }

        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician with id: " + technicianId + " not found."));


        boolean isOverlap = absenceRequestRepository.existsOverlappingRequest(
                technicianId, requestDto.getStartDate(), requestDto.getEndDate()
        );

        if (isOverlap) {
            throw new DuplicateResourceException("You already have this absence request.");
        }


        AbsenceRequest absence = AbsenceRequest.builder()
                .technician(technician)
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .reason(requestDto.getReason())
                .status("PENDING")
                .build();

        return absenceRequestRepository.save(absence);
    }
    public List<AbsenceRequestResponse> getRequestsForAdmin(String status) {
        List<AbsenceRequest> requests;

        if (status != null && !status.isEmpty()) {
            requests = absenceRequestRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            requests = absenceRequestRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        return requests.stream().map(this::mapToDto).collect(Collectors.toList());
    }
    @Transactional
    public void reviewRequest(Integer requestId, String status) {
        if (!status.equals("APPROVED") && !status.equals("REJECTED")) {
            throw new InvalidRequestException("Invalid stats   ");
        }

        AbsenceRequest request = absenceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find request with id: " + requestId));

        request.setStatus(status);
        absenceRequestRepository.save(request);
    }


    public List<AbsenceRequest> getPendingRequests() {
        return absenceRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }


    public List<AbsenceRequest> getTechnicianHistory(Integer technicianId) {
        return absenceRequestRepository.findByTechnician_TechnicianIdOrderByStartDateDesc(technicianId);
    }


    private AbsenceRequestResponse mapToDto(AbsenceRequest entity) {
        AbsenceRequestResponse dto = new AbsenceRequestResponse();
        dto.setRequestId(entity.getRequestId());
        if (entity.getTechnician() != null && entity.getTechnician().getUser() != null) {
            dto.setTechnicianName(entity.getTechnician().getUser().getName());
        }
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setReason(entity.getReason());
        dto.setStatus(entity.getStatus());
        return dto;
    }
}
