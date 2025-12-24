-- 1. Function: Find available technicians
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
    -- Get duration from 'services' table (duration_minutes)
SELECT duration_minutes INTO v_duration
FROM services
WHERE service_id = p_service_id;

-- Return if service doesn't exist
IF v_duration IS NULL THEN
        RETURN;
END IF;

    -- Calculate expected end time based on input time + duration
    v_end_time := p_check_time + (v_duration * INTERVAL '1 minute');

    -- Return list of technicians
RETURN QUERY
SELECT t.technician_id, u.name
FROM technician t
         JOIN users u ON t.user_id = u.user_id -- Join to get name from users table
         JOIN technician_services ts ON t.technician_id = ts.technician_id
WHERE ts.service_id = p_service_id -- Technician must have the skill for this service
-- Filter 2: Must NOT have an overlapping Appointment
  AND t.technician_id NOT IN (
    SELECT a.technician_id
    FROM appointment a
    WHERE a.status != 'CANCELLED'
    AND (
    (a.start_time < v_end_time) AND (a.end_time > p_check_time)
    )
    )
-- Filter 3: Must NOT have an overlapping Absence Request
  AND t.technician_id NOT IN (
    SELECT ar.technician_id
    FROM absence_request ar
    WHERE ar.status = 'APPROVED' -- Only block if the leave is approved
    AND (
            (ar.start_date < v_end_time) AND (ar.end_date > p_check_time)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 2. Function & Trigger: Automatically calculate end_time
CREATE OR REPLACE FUNCTION calculate_appointment_end_time()
RETURNS TRIGGER AS $$
DECLARE
v_duration INT;
BEGIN
    -- Get service duration
SELECT duration_minutes INTO v_duration
FROM services
WHERE service_id = NEW.service_id;

-- Automatically set end_time based on start_time + duration
NEW.end_time := NEW.start_time + (v_duration * INTERVAL '1 minute');

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_end_time
    BEFORE INSERT ON appointment
    FOR EACH ROW EXECUTE FUNCTION calculate_appointment_end_time();


-- 3. Function & Trigger: Validation (Past check, Skill check, Overlap check)
CREATE OR REPLACE FUNCTION validate_appointment()
RETURNS TRIGGER AS $$
BEGIN

    -- 1. Prevent bookings in the past (Only for Insert or when start_time changes)
    IF (TG_OP = 'INSERT' OR OLD.start_time IS DISTINCT FROM NEW.start_time) THEN
        IF NEW.start_time < NOW() THEN
            RAISE EXCEPTION 'Cannot book an appointment in the past.';
END IF;
END IF;

    -- 2. Check technician skill (Technician must be able to perform the service)
    IF NOT EXISTS (
        SELECT 1 FROM technician_services ts
        WHERE ts.technician_id = NEW.technician_id
        AND ts.service_id = NEW.service_id
    ) THEN
        RAISE EXCEPTION 'This technician does not have the skill to perform this service.';
END IF;

    -- 3. Prevent overlapping bookings (Overlap Check)
    -- Note: trg_calculate_end_time ran first, so NEW.end_time is already calculated and available here
    IF EXISTS (
        SELECT 1 FROM appointment a
        WHERE a.technician_id = NEW.technician_id
        AND a.appointment_id != COALESCE(NEW.appointment_id, -1) -- Ignore self if updating
        AND a.status != 'CANCELLED'
        AND (a.start_time < NEW.end_time) AND (a.end_time > NEW.start_time)
    ) THEN
        RAISE EXCEPTION 'The technician is busy during the selected time slot.';
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_appointment
    BEFORE INSERT OR UPDATE ON appointment
                         FOR EACH ROW EXECUTE FUNCTION validate_appointment();