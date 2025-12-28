-- =====================================================================================
-- V6__seed_data.sql
-- Purpose: Seed large-scale fake data up to Jan 2026
-- =====================================================================================

-- 1. Performance Tuning
SET synchronous_commit = OFF;
SET work_mem = '256MB';

-- =====================================================================================
-- PART 1: STATIC DATA
-- =====================================================================================
INSERT INTO services (name, description, price, duration_minutes, is_active)
SELECT 'Service ' || gs, 'Auto generated ' || gs, (random() * 500 + 50)::DECIMAL(10,2), (ARRAY[30,60,90,120])[floor(random()*4)+1], true
FROM generate_series(1, 20) gs ON CONFLICT DO NOTHING;

INSERT INTO resources (name, type, is_deleted)
SELECT 'Room ' || gs, 'ROOM', false FROM generate_series(1, 50) gs
UNION ALL SELECT 'VIP Room ' || gs, 'VIP_ROOM', false FROM generate_series(1, 10) gs
UNION ALL SELECT 'Device ' || gs, 'DEVICE', false FROM generate_series(1, 20) gs
    ON CONFLICT DO NOTHING;

INSERT INTO service_resource_requirement (service_id, resource_type, quantity)
SELECT service_id, CASE WHEN random() < 0.3 THEN 'VIP_ROOM' WHEN random() < 0.6 THEN 'DEVICE' ELSE 'ROOM' END, 1
FROM services ON CONFLICT DO NOTHING;

-- =====================================================================================
-- PART 2: USERS GENERATION
-- =====================================================================================
DO $$
DECLARE
v_user_id INT;
    i INT;
BEGIN
    -- Technicians (50)
FOR i IN 1..50 LOOP
        INSERT INTO users (name, email, password, role, is_enabled)
        VALUES ('Tech ' || i, 'tech' || i || '@aura.com', '$2a$10$Fake', 'TECHNICIAN', true) RETURNING user_id INTO v_user_id;
INSERT INTO technician (user_id) VALUES (v_user_id);

INSERT INTO technician_services (technician_id, service_id)
SELECT t.technician_id, s.service_id FROM technician t JOIN services s ON random() < 0.5 WHERE t.user_id = v_user_id;
END LOOP;

    -- Customers (2000)
FOR i IN 1..2000 LOOP
        INSERT INTO users (name, email, password, role, created_at)
        VALUES ('Cust ' || i, 'cust' || i || '@mail.com', '$2a$10$Fake', 'CUSTOMER', NOW() - (random() * 365 * INTERVAL '1 day'));
INSERT INTO customer (user_id) SELECT user_id FROM users WHERE email = 'cust' || i || '@mail.com';
END LOOP;
END $$;

-- =====================================================================================
-- PART 3: MASSIVE APPOINTMENTS (200,000 ROWS) - UP TO JAN 2026
-- =====================================================================================
DO $$
DECLARE
v_appt_id INT;
    v_start_time TIMESTAMP;
    i INT;

    -- Variables for random selection
    v_cust_id INT;
    v_tech_id INT;
    v_service_id INT;
    v_service_price NUMERIC;
    v_service_duration INT;

    -- Arrays for Pre-loading
    v_customer_ids INT[];
    v_technician_ids INT[];
    v_service_ids INT[];
    v_service_prices NUMERIC[];
    v_service_durations INT[];
    v_customer_count INT;
    v_technician_count INT;
    v_service_count INT;
    v_cust_idx INT;
    v_tech_idx INT;
    v_service_idx INT;

    -- [CHANGE] Target End Date
    v_anchor_date TIMESTAMP := TIMESTAMP '2026-01-31 23:59:59';
BEGIN
    -- [CRITICAL] Disable triggers to speed up insert
ALTER TABLE appointment DISABLE TRIGGER ALL;

-- Preload IDs
SELECT array_agg(customer_id), count(*) INTO v_customer_ids, v_customer_count FROM customer;
SELECT array_agg(technician_id), count(*) INTO v_technician_ids, v_technician_count FROM technician;
SELECT
    array_agg(service_id), array_agg(price), array_agg(duration_minutes), count(*)
INTO
    v_service_ids, v_service_prices, v_service_durations, v_service_count
FROM services;

FOR i IN 1..200000 LOOP
        -- Choose random indices
        v_cust_idx := floor(random() * v_customer_count)::INT + 1;
        v_tech_idx := floor(random() * v_technician_count)::INT + 1;
        v_service_idx := floor(random() * v_service_count)::INT + 1;

        -- Resolve values
        v_cust_id := v_customer_ids[v_cust_idx];
        v_tech_id := v_technician_ids[v_tech_idx];
        v_service_id := v_service_ids[v_service_idx];
        v_service_price := v_service_prices[v_service_idx];
        v_service_duration := v_service_durations[v_service_idx];

        -- [CHANGE] Random time logic: From Jan 2024 to Jan 2026 (2 years span ending at anchor date)
        v_start_time := v_anchor_date - (random() * 730 * INTERVAL '1 day') + (random() * 12 * INTERVAL '1 hour');

INSERT INTO appointment (customer_id, technician_id, service_id, start_time, end_time, status, final_price, created_at)
VALUES (
           v_cust_id,
           v_tech_id,
           v_service_id,
           v_start_time,
           v_start_time + (v_service_duration || ' minutes')::interval,
           (ARRAY['COMPLETED','COMPLETED','COMPLETED','CANCELLED','CONFIRMED'])[floor(random()*5)+1],
           v_service_price,
           v_start_time
       )
    RETURNING appointment_id INTO v_appt_id;


INSERT INTO appointment_resource (appointment_id, resource_id)
SELECT v_appt_id, r_found.resource_id
FROM service_resource_requirement srr
         CROSS JOIN LATERAL (
    SELECT r.resource_id
    FROM resources r
    WHERE r.type = srr.resource_type
      AND r.is_deleted = FALSE
    ORDER BY random()
        LIMIT srr.quantity
        ) r_found
WHERE srr.service_id = v_service_id;

IF i % 20000 = 0 THEN
            RAISE NOTICE 'Inserted % appointments...', i;
END IF;
END LOOP;

    -- [CRITICAL] Re-enable triggers
ALTER TABLE appointment ENABLE TRIGGER ALL;

-- Fix Sequences
PERFORM setval('appointment_appointment_id_seq', (SELECT MAX(appointment_id) FROM appointment));
    PERFORM setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
END $$;

-- Update Statistics
ANALYZE appointment;
ANALYZE users;