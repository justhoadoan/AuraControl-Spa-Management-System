package com.example.auracontrol.booking.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appointment_resource")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResource {

    @EmbeddedId
    private AppointmentResourceId id = new AppointmentResourceId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("appointmentId")
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;


    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("resourceId")
    @JoinColumn(name = "resource_id")
    private Resource resource;
}
