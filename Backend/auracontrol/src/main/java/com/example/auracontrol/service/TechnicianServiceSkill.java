package com.example.auracontrol.service;


import com.example.auracontrol.user.entity.Technician;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "technician_services")
public class TechnicianServiceSkill {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", referencedColumnName = "technician_id")
    private Technician technician;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", referencedColumnName = "service_id")
    private Service service;
}
