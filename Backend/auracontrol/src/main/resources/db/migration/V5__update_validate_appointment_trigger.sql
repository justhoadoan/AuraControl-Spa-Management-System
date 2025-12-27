-- V5__update_validate_appointment_trigger.sql

CREATE OR REPLACE FUNCTION validate_appointment()
RETURNS TRIGGER AS $$
DECLARE
v_req_type VARCHAR;      -- Required resource type for the service
    v_available_count INT;   -- Number of available resources
BEGIN
    -- 1. Prevent booking in the past
    IF (TG_OP = 'INSERT' OR OLD.start_time IS DISTINCT FROM NEW.start_time) THEN
        IF NEW.start_time < NOW() THEN
            RAISE EXCEPTION 'Cannot book an appointment in the past.';
END IF;
END IF;

    -- 2. Check technician skill
    IF NOT EXISTS (
        SELECT 1
        FROM technician_services ts
        WHERE ts.technician_id = NEW.technician_id
          AND ts.service_id = NEW.service_id
    ) THEN
        RAISE EXCEPTION 'This technician does not have the skill to perform this service.';
END IF;

    -- 3. Prevent overlapping appointments for the technician (Check trùng lịch hẹn)
    IF EXISTS (
        SELECT 1
        FROM appointment a
        WHERE a.technician_id = NEW.technician_id
          AND a.appointment_id != COALESCE(NEW.appointment_id, -1)
          AND a.status != 'CANCELLED'
          AND (a.start_time < NEW.end_time)
          AND (a.end_time > NEW.start_time)
    ) THEN
        RAISE EXCEPTION 'The technician is busy during the selected time slot.';
END IF;

    -- 4. Check if technician has an APPROVED absence request
    IF EXISTS (
        SELECT 1
        FROM absence_request ar
        WHERE ar.technician_id = NEW.technician_id
          AND ar.status = 'APPROVED'
          AND (ar.start_date < NEW.end_time)
          AND (ar.end_date > NEW.start_time)
    ) THEN
        RAISE EXCEPTION 'The technician is on approved leave during this time.';
END IF;



    -- 5. Check required resource availability
SELECT resource_type
INTO v_req_type
FROM service_resource_requirement
WHERE service_id = NEW.service_id;

IF v_req_type IS NOT NULL THEN
SELECT COUNT(*)
INTO v_available_count
FROM resources r
WHERE r.type = v_req_type
  AND NOT EXISTS (
    SELECT 1
    FROM appointment_resource ar
             JOIN appointment a ON ar.appointment_id = a.appointment_id
    WHERE ar.resource_id = r.resource_id
      AND a.status != 'CANCELLED'
              AND a.start_time < NEW.end_time
              AND a.end_time > NEW.start_time
);

IF v_available_count = 0 THEN
            RAISE EXCEPTION
                'No available resources (room/equipment) for this service at the selected time.';
END IF;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;