CREATE OR REPLACE FUNCTION get_revenue_statistics(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_type VARCHAR
)
RETURNS TABLE (
    label VARCHAR,
    value DECIMAL(15, 2)
) AS $$
BEGIN
    IF p_type = 'DAY' THEN
        RETURN QUERY
SELECT
    TO_CHAR(d.day, 'dd/MM') AS label,
    COALESCE(SUM(a.final_price), 0) AS value
FROM generate_series(p_start_date, p_end_date, INTERVAL '1 day') d(day)
    LEFT JOIN appointment a ON
    a.end_time >= d.day
    AND a.end_time < d.day + INTERVAL '1 day'
    AND a.status = 'COMPLETED'
GROUP BY d.day
ORDER BY d.day;

ELSIF p_type = 'MONTH' THEN
        RETURN QUERY
SELECT
    TO_CHAR(d.month, 'MM/yyyy') AS label,
    COALESCE(SUM(a.final_price), 0) AS value
FROM generate_series(p_start_date, p_end_date, INTERVAL '1 month') d(month)
    LEFT JOIN appointment a ON
    a.end_time >= d.month
    AND a.end_time < d.month + INTERVAL '1 month'
    AND a.status = 'COMPLETED'
GROUP BY d.month
ORDER BY d.month;
END IF;
END;
$$ LANGUAGE plpgsql;
CREATE INDEX idx_appointment_end_time_status
    ON appointment (end_time, status);
