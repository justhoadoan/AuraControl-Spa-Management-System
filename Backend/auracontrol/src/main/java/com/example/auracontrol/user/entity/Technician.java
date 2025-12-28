package com.example.auracontrol.user.entity;


import com.example.auracontrol.service.TechnicianServiceSkill;
import jakarta.persistence.*;
import lombok.*;

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

    @OneToOne(fetch = FetchType.LAZY,cascade = {CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn(name = "user_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private User user;

    @OneToMany(mappedBy = "technician", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TechnicianServiceSkill> skills;

}
