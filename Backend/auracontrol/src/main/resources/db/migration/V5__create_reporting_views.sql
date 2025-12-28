-- 1. View: Upcoming Appointments
CREATE OR REPLACE VIEW v_upcoming_appointments AS
SELECT
    a.appointment_id,
    a.start_time,
    a.status,
    u_cust.name AS customer_name,
    s.name AS service_name,
    COALESCE(u_tech.name, 'Unassigned') AS technician_name
FROM appointment a
         JOIN customer c ON a.customer_id = c.customer_id
         JOIN users u_cust ON c.user_id = u_cust.user_id
         JOIN services s ON a.service_id = s.service_id
         LEFT JOIN technician t ON a.technician_id = t.technician_id
         LEFT JOIN users u_tech ON t.user_id = u_tech.user_id
WHERE a.status IN ('PENDING', 'CONFIRMED') -- Only include active (not completed) appointments
  AND a.start_time >= CURRENT_TIMESTAMP;


-- 2. View: Today Stats (Fixed empty result issue)
CREATE OR REPLACE VIEW v_today_stats AS
SELECT
-- Subquery 1: Today's revenue (only completed appointments)
    (SELECT COALESCE(SUM(final_price), 0)
     FROM appointment
     WHERE start_time >= CURRENT_DATE
       AND start_time < CURRENT_DATE + INTERVAL '1 day'
    AND status = 'COMPLETED') AS today_revenue,

-- Subquery 2: Number of today's appointments (excluding cancelled ones)
     (SELECT COUNT(*)
FROM appointment
WHERE start_time >= CURRENT_DATE
  AND start_time < CURRENT_DATE + INTERVAL '1 day'
  AND status != 'CANCELLED') AS today_appointments,

-- Subquery 3: New customers registered today
    (SELECT COUNT(*)
FROM users
WHERE created_at >= CURRENT_DATE
  AND created_at < CURRENT_DATE + INTERVAL '1 day'
  AND role = 'CUSTOMER') AS new_customers;
