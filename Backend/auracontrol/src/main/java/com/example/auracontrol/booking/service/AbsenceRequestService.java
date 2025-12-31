package com.example.auracontrol.booking.service;

import com.example.auracontrol.admin.dto.AbsenceRequestResponse;
import com.example.auracontrol.booking.dto.AbsenceRequestDto;
import com.example.auracontrol.booking.entity.AbsenceRequest;
import com.example.auracontrol.booking.entity.Appointment;
import com.example.auracontrol.booking.repository.AbsenceRequestRepository;
import com.example.auracontrol.booking.repository.AppointmentRepository;
import com.example.auracontrol.exception.DuplicateResourceException;
import com.example.auracontrol.exception.InvalidRequestException;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.user.entity.Technician;
import com.example.auracontrol.user.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public AbsenceRequest submitRequest(Integer technicianId, AbsenceRequestDto requestDto) {

        if (requestDto.getStartDate().isBefore(LocalDateTime.now())) {
            throw new InvalidRequestException("Can't submit request because start date is before now.");
        }
        if (requestDto.getEndDate().isBefore(requestDto.getStartDate())) {
            throw new InvalidRequestException("Can't submit request because end date is before start date.");
        }

        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician with id: " + technicianId + " not found."));

        // Check for conflicting appointments during the requested absence period
        List<Appointment> conflictingAppointments = appointmentRepository.findByTechnicianIdAndDateRange(
                technicianId,
                requestDto.getStartDate(),
                requestDto.getEndDate()
        );

        if (!conflictingAppointments.isEmpty()) {
            throw new InvalidRequestException(
                    "Cannot submit absence request: You have " + conflictingAppointments.size() + 
                    " scheduled appointment(s) during this time period. Please reschedule or cancel them first."
            );
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
    public Page<AbsenceRequestResponse> getRequestsForAdmin(String status, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<AbsenceRequest> requestPage;

        if (status != null && !status.isEmpty() && !status.equals("ALL")) {

            requestPage = absenceRequestRepository.findByStatus(status, pageable);
        } else {
            requestPage = absenceRequestRepository.findAll(pageable);
        }

        // 3. Map từ Entity sang DTO nhưng vẫn giữ nguyên cấu trúc Page
        return requestPage.map(this::mapToDto);
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
