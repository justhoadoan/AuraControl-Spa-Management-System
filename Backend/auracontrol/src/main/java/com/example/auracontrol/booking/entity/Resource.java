package com.example.auracontrol.booking.entity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "resources")
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer resourceId;
    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String type;



}
