-- V8__validate_absence_request.sql

CREATE OR REPLACE FUNCTION validate_absence_request_logic()
RETURNS TRIGGER AS $$
DECLARE
v_conflict_appt_count INT;
BEGIN
    -- 1. Validate date logic (Data sanity check)
    IF NEW.end_date <= NEW.start_date THEN
        RAISE EXCEPTION 'End date must be greater than start date.';
END IF;

    -- 2. Check overlap with other absence requests (Prevent spam)
    -- Logic: A technician cannot have two requests (PENDING or APPROVED)
    -- overlapping in time
    IF EXISTS (
        SELECT 1 FROM absence_request
        WHERE technician_id = NEW.technician_id
          AND request_id != COALESCE(NEW.request_id, -1) -- Ignore itself (on update)
          AND status != 'REJECTED' -- Only consider APPROVED or PENDING requests
          -- Time overlap logic
          AND start_date < NEW.end_date
          AND end_date > NEW.start_date
    ) THEN
        RAISE EXCEPTION 'You already have another absence request overlapping this time period.';
END IF;

    -- 3. Check conflict with appointments (Only when status is APPROVED)
    -- (Prevent admin from approving absence when technician has appointments)
    IF NEW.status = 'APPROVED' THEN
SELECT COUNT(*) INTO v_conflict_appt_count
FROM appointment
WHERE technician_id = NEW.technician_id
  AND status != 'CANCELLED'
          AND start_time < NEW.end_date
          AND end_time > NEW.start_date;

IF v_conflict_appt_count > 0 THEN
            RAISE EXCEPTION 'Cannot approve absence: technician has scheduled appointments during this time.';
END IF;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to absence_request table
-- Execute before INSERT or UPDATE
CREATE TRIGGER trg_validate_absence_request
    BEFORE INSERT OR UPDATE ON absence_request
                         FOR EACH ROW
                         EXECUTE FUNCTION validate_absence_request_logic();
