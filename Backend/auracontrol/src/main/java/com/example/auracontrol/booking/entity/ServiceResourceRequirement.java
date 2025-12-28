package com.example.auracontrol.booking.entity;
import com.example.auracontrol.service.Service;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "service_resource_requirement")
public class ServiceResourceRequirement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer requirementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    @JsonIgnore
    private Service service;

    @Column(name = "resource_type", nullable = false, length = 100)
    private String resourceType;

    @Column(nullable = false)
    private Integer quantity;



}
