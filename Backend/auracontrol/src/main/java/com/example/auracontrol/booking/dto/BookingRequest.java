package com.example.auracontrol.booking.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private Integer serviceId;
    private Integer technicianId;
    private LocalDateTime startTime; // Format: "2024-05-20T14:00:00"
    private String note;
}
