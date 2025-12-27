package com.example.auracontrol.booking.service;

import com.example.auracontrol.booking.dto.AbsenceRequestDto;
import com.example.auracontrol.booking.entity.AbsenceRequest;
import com.example.auracontrol.booking.repository.AbsenceRequestRepository;
import com.example.auracontrol.exception.DuplicateResourceException;
import com.example.auracontrol.exception.InvalidRequestException;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.user.entity.Technician;
import com.example.auracontrol.user.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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
    @Transactional
    public void reviewRequest(Integer requestId, String status) {
        if (!status.equals("APPROVED") && !status.equals("REJECTED")) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ");
        }

        AbsenceRequest request = absenceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu không tìm thấy"));

        request.setStatus(status);
        absenceRequestRepository.save(request);


    }


    public List<AbsenceRequest> getPendingRequests() {
        return absenceRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }


    public List<AbsenceRequest> getTechnicianHistory(Integer technicianId) {
        return absenceRequestRepository.findByTechnician_TechnicianIdOrderByStartDateDesc(technicianId);
    }
}
