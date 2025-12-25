package com.example.auracontrol.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResourceId implements Serializable {
    @Column(name = "appointment_id")
    private Integer appointmentId;

    @Column(name = "resource_id")
    private Integer resourceId;
}
