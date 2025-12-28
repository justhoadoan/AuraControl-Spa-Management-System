package com.example.auracontrol.service;


import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@EqualsAndHashCode
public class TechnicianServiceId implements Serializable {
    private Integer technician;
    private Integer service;

    public TechnicianServiceId() {}

    public TechnicianServiceId(Integer technician, Integer service) {
        this.technician = technician;
        this.service = service;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TechnicianServiceId that = (TechnicianServiceId) o;
        return Objects.equals(technician, that.technician) &&
                Objects.equals(service, that.service);
    }

    @Override
    public int hashCode() {
        return Objects.hash(technician, service);
    }
}
