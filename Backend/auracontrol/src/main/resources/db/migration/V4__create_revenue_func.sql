CREATE OR REPLACE FUNCTION get_revenue_statistics(
    p_start_date TIMESTAMPTZ,
    p_end_date   TIMESTAMPTZ,
    p_type       VARCHAR -- Expected values: 'DAY' or 'MONTH'
)
RETURNS TABLE (
    label VARCHAR,
    value DECIMAL(15, 2)
) AS $$
BEGIN
    -- 1. Input Validation: Sanity check to ensure start date is not after end date
    IF p_start_date > p_end_date THEN
        RAISE EXCEPTION 'Invalid date range: start_date cannot be after end_date';
END IF;

    -- ==========================================
    -- LOGIC FOR DAILY STATISTICS
    -- ==========================================
    IF p_type = 'DAY' THEN
        RETURN QUERY
SELECT
    TO_CHAR(d.day, 'DD/MM')::VARCHAR AS label, -- Format date for frontend display
    COALESCE(SUM(a.final_price), 0)::DECIMAL(15,2) AS value -- Handle NULL sums for days with no revenue
FROM generate_series(
    date_trunc('day', p_start_date), -- Normalize start to 00:00:00
    date_trunc('day', p_end_date),   -- Normalize end to 00:00:00
    INTERVAL '1 day'
    ) d(day)
    -- Use LEFT JOIN to ensure days with ZERO revenue are still included in the result (Gap Filling)
    LEFT JOIN appointment a
ON a.end_time >= d.day
    AND a.end_time <  d.day + INTERVAL '1 day' -- Efficient range search (SARGable)
    AND a.status = 'COMPLETED' -- Only count actual revenue
GROUP BY d.day
ORDER BY d.day; -- Ensure chronological order

-- ==========================================
-- LOGIC FOR MONTHLY STATISTICS
-- ==========================================
ELSIF p_type = 'MONTH' THEN
        RETURN QUERY
SELECT
    TO_CHAR(d.month, 'MM/YYYY')::VARCHAR AS label,
    COALESCE(SUM(a.final_price), 0)::DECIMAL(15,2) AS value
FROM generate_series(
    date_trunc('month', p_start_date), -- Normalize to 1st of the month
    date_trunc('month', p_end_date),
    INTERVAL '1 month'
    ) d(month)
    LEFT JOIN appointment a
ON a.end_time >= d.month
    AND a.end_time <  d.month + INTERVAL '1 month'
    AND a.status = 'COMPLETED'
GROUP BY d.month
ORDER BY d.month;

-- ==========================================
-- ERROR HANDLING
-- ==========================================
ELSE
        RAISE EXCEPTION 'Invalid p_type value: %, expected DAY or MONTH', p_type;
END IF;
END;
$$ LANGUAGE plpgsql;


