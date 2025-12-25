-- Function: get_available_technicians
-- Purpose:
--   Returns a list of technicians who:
--   1. Have the required skill for the service
--   2. Do NOT have overlapping appointments
--   3. Do NOT have approved absences during the requested time
CREATE OR REPLACE FUNCTION get_available_technicians(
    p_service_id INT,
    p_check_time TIMESTAMP
)
RETURNS TABLE (
    technician_id INT,
    technician_name VARCHAR
) AS $$
DECLARE
v_duration INT;
    v_end_time TIMESTAMP;
BEGIN
    -- Get service duration
SELECT duration_minutes
INTO v_duration
FROM services
WHERE service_id = p_service_id;

-- If service does not exist, return empty result
IF v_duration IS NULL THEN
        RETURN;
END IF;

    -- Calculate end time
    v_end_time := p_check_time + (v_duration * INTERVAL '1 minute');

RETURN QUERY
SELECT t.technician_id, u.name
FROM technician t
         JOIN users u ON t.user_id = u.user_id
         JOIN technician_services ts ON t.technician_id = ts.technician_id
WHERE ts.service_id = p_service_id

  -- No overlapping appointments
  AND NOT EXISTS (
    SELECT 1
    FROM appointment a
    WHERE a.technician_id = t.technician_id
      AND a.status != 'CANCELLED'
          AND a.start_time < v_end_time
          AND a.end_time > p_check_time
)

  -- No approved absence
  AND NOT EXISTS (
    SELECT 1
    FROM absence_request ar
    WHERE ar.technician_id = t.technician_id
      AND ar.status = 'APPROVED'
      AND ar.start_date < v_end_time
      AND ar.end_date > p_check_time
);
END;
$$ LANGUAGE plpgsql;
--------------------------------------------------------------------------------------------------------------
-- Function: calculate_appointment_end_time
-- Purpose:
--   Automatically calculate appointment.end_time
--   based on service duration and start_time
CREATE OR REPLACE FUNCTION calculate_appointment_end_time()
RETURNS TRIGGER AS $$
DECLARE
v_duration INT; -- Service duration in minutes
BEGIN
    -- Get service duration
SELECT duration_minutes
INTO v_duration
FROM services
WHERE service_id = NEW.service_id;

-- Set end_time automatically
NEW.end_time := NEW.start_time + (v_duration * INTERVAL '1 minute');

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: runs before inserting a new appointment
CREATE TRIGGER trg_calculate_end_time
    BEFORE INSERT ON appointment
    FOR EACH ROW
    EXECUTE FUNCTION calculate_appointment_end_time();
--------------------------------------------------------------------------------------------------------------
-- Function: validate_appointment
-- Purpose:
--   Validate appointment business rules:
--   1. Cannot book in the past
--   2. Technician must have required skill
--   3. Technician must not have overlapping appointments
--   4. Required resources must be available
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

    -- 3. Prevent overlapping appointments for the technician
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

    -- 4. Check required resource availability
-- 4. Check required resource availability
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

-- Trigger: validate appointment before insert or update
CREATE TRIGGER trg_validate_appointment
    BEFORE INSERT OR UPDATE ON appointment
                         FOR EACH ROW
                         EXECUTE FUNCTION validate_appointment();

--------------------------------------------------------------------------------------------------------------
-- Function: auto_assign_resource_after_booking
-- Purpose:
--   Automatically assign an available resource
--   after an appointment is successfully created
CREATE OR REPLACE FUNCTION auto_assign_resource_after_booking()
RETURNS TRIGGER AS $$
DECLARE
v_req_type VARCHAR;
    v_selected_resource_id INT;
BEGIN
    -- Get required resource type
SELECT resource_type
INTO v_req_type
FROM service_resource_requirement
WHERE service_id = NEW.service_id;

IF v_req_type IS NOT NULL THEN
        -- Find an available resource
SELECT r.resource_id
INTO v_selected_resource_id
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
)
    LIMIT 1;

IF v_selected_resource_id IS NOT NULL THEN
            INSERT INTO appointment_resource (appointment_id, resource_id)
            VALUES (NEW.appointment_id, v_selected_resource_id);
ELSE
            RAISE EXCEPTION
                'System Error: Resource became unavailable during transaction.';
END IF;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger: auto-assign resource after insert
CREATE TRIGGER trg_auto_assign_resource
    AFTER INSERT ON appointment
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_resource_after_booking();


