package com.example.auracontrol.resource;
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
    private Integer resource_id;
    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String type;


//    @ManyToMany(mappedBy = "resources")
//    private Set<Appointment> appointments;
}
