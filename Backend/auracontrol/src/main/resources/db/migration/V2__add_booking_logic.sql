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
      AND u.is_enabled = true
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

v_req_record RECORD;
    v_available_count INT;
BEGIN
    -- 1. Prevent booking in the past
    IF (TG_OP = 'INSERT' OR OLD.start_time IS DISTINCT FROM NEW.start_time) THEN
        IF NEW.start_time < CURRENT_TIMESTAMP THEN
            RAISE EXCEPTION 'Cannot book an appointment in the past.';
END IF;
END IF;

    -- Lock OLD technician if technician is changed
    IF TG_OP = 'UPDATE' AND OLD.technician_id IS DISTINCT FROM NEW.technician_id THEN
        PERFORM 1 FROM technician WHERE technician_id = OLD.technician_id FOR UPDATE;
END IF;

    -- 2. Lock NEW technician row (Concurrency Control)
    PERFORM 1
    FROM technician
    WHERE technician_id = NEW.technician_id
    FOR UPDATE;

IF NOT FOUND THEN
        RAISE EXCEPTION 'Technician not found.';
END IF;

    -- 3. Validate technician skill
    IF NOT EXISTS (
        SELECT 1
        FROM technician_services
        WHERE technician_id = NEW.technician_id
          AND service_id = NEW.service_id
    ) THEN
        RAISE EXCEPTION 'Technician does not have required skill.';
END IF;

    -- 4. Check approved absence
    IF EXISTS (
        SELECT 1
        FROM absence_request ar
        WHERE ar.technician_id = NEW.technician_id
          AND ar.status = 'APPROVED'
          AND ar.start_date < NEW.end_time
          AND ar.end_date > NEW.start_time
    ) THEN
        RAISE EXCEPTION 'Technician is on approved leave during this time.';
END IF;

    -- 5. Prevent overlapping appointments (Technician Busy Check)
    IF EXISTS (
        SELECT 1
        FROM appointment a
        WHERE a.technician_id = NEW.technician_id
          AND a.appointment_id != COALESCE(NEW.appointment_id, -1)
          AND a.status != 'CANCELLED'
          AND a.start_time < NEW.end_time
          AND a.end_time > NEW.start_time
    ) THEN
        RAISE EXCEPTION 'Technician is not available in this time slot.';
END IF;


   -- 6. Validate Resource Availability (Capacity Check)

FOR v_req_record IN
SELECT resource_type, quantity
FROM service_resource_requirement
WHERE service_id = NEW.service_id
    LOOP
-- Count free resources
SELECT COUNT(*)
INTO v_available_count
FROM resources r
WHERE r.type = v_req_record.resource_type
  AND r.is_deleted = FALSE

  AND NOT EXISTS (
    SELECT 1
    FROM appointment_resource ar
             JOIN appointment a ON ar.appointment_id = a.appointment_id
    WHERE ar.resource_id = r.resource_id
      AND a.status != 'CANCELLED'
                AND a.appointment_id != COALESCE(NEW.appointment_id, -1) -- Tránh đếm chính nó (khi update)
                AND a.start_time < NEW.end_time
                AND a.end_time > NEW.start_time
);


IF v_available_count < v_req_record.quantity THEN
             RAISE EXCEPTION 'Not enough resources (%s) available for this time slot. Required: %, Available: %',
                             v_req_record.resource_type, v_req_record.quantity, v_available_count;
END IF;
END LOOP;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: validate appointment before insert or update
DROP TRIGGER IF EXISTS trg_validate_appointment ON appointment;
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
v_req_record RECORD;      -- Holds each required resource type
    v_resource_id INT;        -- Holds the selected resource ID
BEGIN
    -- 1. Iterate over ALL resource types required by the service
    -- Example: Service requires 'BED' and 'SAUNA_MACHINE' → loop runs twice
FOR v_req_record IN
SELECT resource_type
FROM service_resource_requirement
WHERE service_id = NEW.service_id
    LOOP
        -- Reset resource ID for each iteration
        v_resource_id := NULL;

-- 2. Find ONE available resource for the current resource type
-- Using SKIP LOCKED to handle high concurrency safely
SELECT r.resource_id
INTO v_resource_id
FROM resources r
WHERE r.type = v_req_record.resource_type
  AND r.is_deleted = FALSE
  AND NOT EXISTS (
    SELECT 1
    FROM appointment_resource ar
             JOIN appointment a ON ar.appointment_id = a.appointment_id
    WHERE ar.resource_id = r.resource_id
      AND a.status != 'CANCELLED'
                AND a.start_time < NEW.end_time
                AND a.end_time > NEW.start_time
)
ORDER BY r.resource_id ASC  -- Deterministic ordering to reduce deadlock risk
    FOR UPDATE SKIP LOCKED
        LIMIT 1;

-- 3. If no available resource is found → abort the booking
IF v_resource_id IS NULL THEN
            RAISE EXCEPTION
                'Booking failed: Not enough available resources (Type: %) for this time slot.',
                v_req_record.resource_type;
END IF;

        -- 4. Assign the selected resource to the appointment
        -- If a later iteration fails, this insert will be rolled back automatically
INSERT INTO appointment_resource (appointment_id, resource_id)
VALUES (NEW.appointment_id, v_resource_id);

END LOOP;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-attach trigger (must be AFTER INSERT)
DROP TRIGGER IF EXISTS trg_auto_assign_resource ON appointment;

CREATE TRIGGER trg_auto_assign_resource
    AFTER INSERT ON appointment
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_resource_after_booking();
--------------------------------------------------------------------------------------------------------------
-- Function: handle_resource_on_update
-- Purpose:
--   Automatically assign an available resource
--   after an appointment is successfully updated
CREATE OR REPLACE FUNCTION handle_resource_on_update()
RETURNS TRIGGER AS $$
DECLARE
v_req_record RECORD;          -- Holds each required resource type (e.g. BED, MACHINE)
    v_new_resource_id INT;        -- Selected available resource ID
BEGIN
    -- 1. Only execute logic if the appointment time has changed
    IF OLD.start_time IS NOT DISTINCT FROM NEW.start_time THEN
        RETURN NEW;
END IF;

    -- 2. Check if the service requires any resources
    -- If not, exit early to avoid unnecessary DELETE operations
    PERFORM 1
    FROM service_resource_requirement
    WHERE service_id = NEW.service_id;

    IF NOT FOUND THEN
        RETURN NEW;
END IF;

    -- 3. Remove all previously assigned resources
    -- Safe because this runs inside the same transaction
    -- If anything fails below, this DELETE will be rolled back
DELETE FROM appointment_resource
WHERE appointment_id = NEW.appointment_id;

-- 4. Loop through each required resource type for the service
FOR v_req_record IN
SELECT resource_type
FROM service_resource_requirement
WHERE service_id = NEW.service_id
    LOOP
        v_new_resource_id := NULL;

-- 5. Find and immediately lock an available resource
-- SKIP LOCKED prevents race conditions under concurrent rescheduling
SELECT r.resource_id
INTO v_new_resource_id
FROM resources r
WHERE r.type = v_req_record.resource_type
  AND NOT EXISTS (
    SELECT 1
    FROM appointment_resource ar
             JOIN appointment a ON ar.appointment_id = a.appointment_id
    WHERE ar.resource_id = r.resource_id
      AND a.status != 'CANCELLED'
                AND a.appointment_id != NEW.appointment_id -- Avoid self-comparison
                AND a.start_time < NEW.end_time
                AND a.end_time > NEW.start_time
)
ORDER BY r.resource_id ASC   -- Ensures consistent lock order to prevent deadlocks
    FOR UPDATE SKIP LOCKED
        LIMIT 1;

-- 6. If any required resource is unavailable, abort the reschedule
IF v_new_resource_id IS NULL THEN
            RAISE EXCEPTION
                'Reschedule Failed: No available resources (Type: %) for the new time slot.',
                v_req_record.resource_type;
END IF;

        -- 7. Assign the selected resource to the appointment
INSERT INTO appointment_resource (appointment_id, resource_id)
VALUES (NEW.appointment_id, v_new_resource_id);

END LOOP;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reassign resources after appointment rescheduling
DROP TRIGGER IF EXISTS trg_update_resource_on_reschedule ON appointment;
CREATE TRIGGER trg_update_resource_on_reschedule
    AFTER UPDATE ON appointment
    FOR EACH ROW
    EXECUTE FUNCTION handle_resource_on_update();


