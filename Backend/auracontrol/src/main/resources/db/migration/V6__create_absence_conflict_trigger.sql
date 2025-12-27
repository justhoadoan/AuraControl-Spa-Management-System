-- 1. Create a function to check scheduling conflicts before approving an absence request
CREATE OR REPLACE FUNCTION check_absence_conflict_before_approve()
RETURNS TRIGGER AS $$
DECLARE
v_conflict_count INT;
BEGIN
    -- Only perform the check when the absence status is APPROVED
    -- (Applies to both INSERT and UPDATE from PENDING to APPROVED)
    IF NEW.status = 'APPROVED' THEN

        -- Count active appointments that overlap with the absence period
SELECT COUNT(*)
INTO v_conflict_count
FROM appointment a
WHERE a.technician_id = NEW.technician_id
  AND a.status != 'CANCELLED'
          -- Time overlap logic: (StartA < EndB) AND (EndA > StartB)
          AND a.start_time < NEW.end_date
          AND a.end_time > NEW.start_date;

-- If any conflicting appointment is found, block the approval immediately
IF v_conflict_count > 0 THEN
            RAISE EXCEPTION 'Cannot approve absence: Technician has active appointments during this period.';
END IF;

END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach the function to a trigger
CREATE TRIGGER trg_validate_absence_approval
    BEFORE INSERT OR UPDATE ON absence_request
                         FOR EACH ROW
                         EXECUTE FUNCTION check_absence_conflict_before_approve();
