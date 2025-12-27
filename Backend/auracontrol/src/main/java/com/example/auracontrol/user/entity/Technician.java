package com.example.auracontrol.user.entity;


import com.example.auracontrol.service.TechnicianServiceSkill;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table
public class  Technician {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "technician_id")
    private Integer technicianId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @OneToMany(mappedBy = "technician", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TechnicianServiceSkill> skills;

}
