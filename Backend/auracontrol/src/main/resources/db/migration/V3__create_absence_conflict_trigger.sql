CREATE OR REPLACE FUNCTION validate_absence_request_master()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Date sanity check (Always check)
    IF NEW.end_date <= NEW.start_date THEN
        RAISE EXCEPTION 'End date must be greater than start date.';
END IF;

    -- 2. Lock technician row (CRITICAL for Concurrency)
    -- Locks the technician to prevent race conditions during checks
    PERFORM 1
    FROM technician
    WHERE technician_id = NEW.technician_id
    FOR UPDATE;

-- 3. Check overlapping absence requests
-- (Ensure technician doesn't have multiple requests for the same period)
IF EXISTS (
        SELECT 1
        FROM absence_request
        WHERE technician_id = NEW.technician_id
          AND request_id != COALESCE(NEW.request_id, -1) -- Skip self check
          AND status IN ('PENDING', 'APPROVED')          -- Ignore REJECTED
          AND start_date < NEW.end_date
          AND end_date > NEW.start_date
    ) THEN
        RAISE EXCEPTION
            'You already have another absence request overlapping this time period.';
END IF;

    -- 4. Check conflict with appointments (The Optimized Logic)
    -- Only check if:
    --   a) Status is APPROVED
    --   b) AND (It's a new Insert OR Dates changed OR Status just changed to Approved)
    IF NEW.status = 'APPROVED' AND (
        TG_OP = 'INSERT' OR
        OLD.status IS DISTINCT FROM NEW.status OR
        OLD.start_date IS DISTINCT FROM NEW.start_date OR
        OLD.end_date IS DISTINCT FROM NEW.end_date
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM appointment
            WHERE technician_id = NEW.technician_id
              AND status != 'CANCELLED'
              AND start_time < NEW.end_date
              AND end_time > NEW.start_date
        ) THEN
            RAISE EXCEPTION
                'Cannot approve absence: Technician has scheduled appointments during this time.';
END IF;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Xóa 2 trigger cũ đi
DROP TRIGGER IF EXISTS trg_validate_absence_request ON absence_request;
DROP TRIGGER IF EXISTS trg_check_absence_conflict ON absence_request;

-- Tạo 1 trigger duy nhất
CREATE TRIGGER trg_validate_absence_request_master
    BEFORE INSERT OR UPDATE ON absence_request
                         FOR EACH ROW
                         EXECUTE FUNCTION validate_absence_request_master();