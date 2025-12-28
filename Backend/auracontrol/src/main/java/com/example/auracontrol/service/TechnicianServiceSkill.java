package com.example.auracontrol.service;


import com.example.auracontrol.user.entity.Technician;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "technician_services")
@IdClass(TechnicianServiceId.class)
public class TechnicianServiceSkill {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    @ToString.Exclude
    private Technician technician;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    @ToString.Exclude
    private Service service;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TechnicianServiceSkill)) return false;
        TechnicianServiceSkill that = (TechnicianServiceSkill) o;

        Integer thisTechId = (technician != null) ? technician.getTechnicianId() : null;
        Integer thatTechId = (that.technician != null) ? that.technician.getTechnicianId() : null;

        Integer thisServiceId = (service != null) ? service.getServiceId() : null;
        Integer thatServiceId = (that.service != null) ? that.service.getServiceId() : null;

        // So sánh an toàn kể cả khi ID bị null
        return Objects.equals(thisTechId, thatTechId) &&
                Objects.equals(thisServiceId, thatServiceId);
    }

    @Override
    public int hashCode() {

        Integer techId = (technician != null) ? technician.getTechnicianId() : null;
        Integer srvId = (service != null) ? service.getServiceId() : null;


        return Objects.hash(techId, srvId);
    }
}