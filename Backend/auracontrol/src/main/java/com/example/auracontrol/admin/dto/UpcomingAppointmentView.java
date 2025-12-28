package com.example.auracontrol.admin.dto;

import java.time.LocalDateTime;

public interface UpcomingAppointmentView {
    Integer getAppointmentId();
    LocalDateTime getStartTime();
    String getStatus();
    String getCustomerName();
    String getServiceName();
    String getTechnicianName();
}
