-- =====================================================================================
-- V6__seed_data.sql
-- Purpose : Large-scale seed data (safe for 16GB RAM)
-- Target  : 20k customers, 500k appointments, Jan 2026
-- =====================================================================================

-- =====================================
-- PERFORMANCE SETTINGS
-- =====================================
SET synchronous_commit = OFF;
SET work_mem = '64MB';

-- =====================================================================================
-- PART 1: STATIC DATA
-- =====================================================================================

-- SERVICES (20)
INSERT INTO services (name, description, price, duration_minutes, is_active)
SELECT
    'Service ' || gs,
    'Auto generated ' || gs,
    (random() * 500 + 50)::DECIMAL(10,2),
    (ARRAY[30,60,90,120])[floor(random()*4)+1],
    true
FROM generate_series(1, 20) gs
ON CONFLICT DO NOTHING;

-- RESOURCES
INSERT INTO resources (name, type, is_deleted)
SELECT 'Room ' || gs, 'ROOM', false FROM generate_series(1, 50) gs
UNION ALL
SELECT 'VIP Room ' || gs, 'VIP_ROOM', false FROM generate_series(1, 10) gs
UNION ALL
SELECT 'Device ' || gs, 'DEVICE', false FROM generate_series(1, 20) gs
    ON CONFLICT DO NOTHING;

-- SERVICE RESOURCE REQUIREMENTS
-- Mandatory ROOM
INSERT INTO service_resource_requirement (service_id, resource_type, quantity)
SELECT service_id, 'ROOM', 1 FROM services
    ON CONFLICT DO NOTHING;

-- Mandatory DEVICE
INSERT INTO service_resource_requirement (service_id, resource_type, quantity)
SELECT service_id, 'DEVICE', 1 FROM services
    ON CONFLICT DO NOTHING;

-- Optional VIP ROOM (50%)
INSERT INTO service_resource_requirement (service_id, resource_type, quantity)
SELECT service_id, 'VIP_ROOM', 1
FROM services
WHERE random() < 0.5
    ON CONFLICT DO NOTHING;

-- =====================================================================================
-- PART 2: USERS GENERATION
-- =====================================================================================
DO $$
DECLARE
v_user_id INT;
    i INT;
BEGIN
    -- TECHNICIANS (50)
FOR i IN 1..50 LOOP
        INSERT INTO users (name, email, password, role, is_enabled)
        VALUES (
            'Tech ' || i,
            'tech' || i || '@aura.com',
            '$2a$10$Fake',
            'TECHNICIAN',
            true
        )
        RETURNING user_id INTO v_user_id;

INSERT INTO technician (user_id) VALUES (v_user_id);

INSERT INTO technician_services (technician_id, service_id)
SELECT t.technician_id, s.service_id
FROM technician t
         JOIN services s ON random() < 0.5
WHERE t.user_id = v_user_id;
END LOOP;

    -- CUSTOMERS (20,000)
FOR i IN 1..20000 LOOP
        INSERT INTO users (name, email, password, role, created_at)
        VALUES (
            'Cust ' || i,
            'cust' || i || '@mail.com',
            '$2a$10$Fake',
            'CUSTOMER',
            NOW() - (random() * 730 * INTERVAL '1 day')
        )
        RETURNING user_id INTO v_user_id;

INSERT INTO customer (user_id) VALUES (v_user_id);
END LOOP;
END $$;

-- =====================================================================================
-- PART 3: APPOINTMENTS SEED (BATCH SAFE)
-- =====================================================================================

-- PROCEDURE: Seed appointments in batches
CREATE OR REPLACE PROCEDURE seed_appointments(p_batch_size INT)
LANGUAGE plpgsql
AS $$
DECLARE
i INT;
    v_appt_id INT;
    v_start_time TIMESTAMP;

    v_cust_id INT;
    v_tech_id INT;
    v_service_id INT;
    v_service_price NUMERIC;
    v_service_duration INT;

    -- Preloaded arrays
    v_customer_ids INT[];
    v_technician_ids INT[];
    v_service_ids INT[];
    v_service_prices NUMERIC[];
    v_service_durations INT[];

    v_room_ids INT[];
    v_device_ids INT[];
    v_vip_ids INT[];

    v_anchor_date TIMESTAMP := TIMESTAMP '2026-01-31 23:59:59';
BEGIN
    -- PRELOAD IDS (ONCE PER BATCH)
SELECT array_agg(customer_id) INTO v_customer_ids FROM customer;
SELECT array_agg(technician_id) INTO v_technician_ids FROM technician;

SELECT
    array_agg(service_id),
    array_agg(price),
    array_agg(duration_minutes)
INTO
    v_service_ids,
    v_service_prices,
    v_service_durations
FROM services;

SELECT array_agg(resource_id) INTO v_room_ids
FROM resources WHERE type='ROOM' AND is_deleted=false;

SELECT array_agg(resource_id) INTO v_device_ids
FROM resources WHERE type='DEVICE' AND is_deleted=false;

SELECT array_agg(resource_id) INTO v_vip_ids
FROM resources WHERE type='VIP_ROOM' AND is_deleted=false;

-- INSERT LOOP
FOR i IN 1..p_batch_size LOOP
        v_cust_id := v_customer_ids[1 + floor(random()*array_length(v_customer_ids,1))::int];
        v_tech_id := v_technician_ids[1 + floor(random()*array_length(v_technician_ids,1))::int];

        v_service_id := v_service_ids[1 + floor(random()*array_length(v_service_ids,1))::int];
        v_service_price := v_service_prices[1 + floor(random()*array_length(v_service_prices,1))::int];
        v_service_duration := v_service_durations[1 + floor(random()*array_length(v_service_durations,1))::int];

        v_start_time :=
            v_anchor_date
            - (random() * 730 * INTERVAL '1 day')
            + (random() * 12 * INTERVAL '1 hour');

INSERT INTO appointment (
    customer_id,
    technician_id,
    service_id,
    start_time,
    end_time,
    status,
    final_price,
    created_at
)
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

-- Mandatory ROOM
INSERT INTO appointment_resource (appointment_id, resource_id)
VALUES (
           v_appt_id,
           v_room_ids[1 + floor(random()*array_length(v_room_ids,1))::int]
       );

-- Mandatory DEVICE
INSERT INTO appointment_resource (appointment_id, resource_id)
VALUES (
           v_appt_id,
           v_device_ids[1 + floor(random()*array_length(v_device_ids,1))::int]
       );

-- Optional VIP ROOM
IF random() < 0.5 AND array_length(v_vip_ids,1) IS NOT NULL THEN
            INSERT INTO appointment_resource (appointment_id, resource_id)
            VALUES (
                v_appt_id,
                v_vip_ids[1 + floor(random()*array_length(v_vip_ids,1))::int]
            );
END IF;
END LOOP;
END $$;

-- =====================================================================================
-- EXECUTION (10 x 50,000 = 500,000)
-- =====================================================================================
ALTER TABLE appointment DISABLE TRIGGER ALL;

CALL seed_appointments(50000); COMMIT;
CALL seed_appointments(50000); COMMIT;
CALL seed_appointments(50000); COMMIT;
CALL seed_appointments(50000); COMMIT;
CALL seed_appointments(50000); COMMIT;
CALL seed_appointments(50000); COMMIT;
CALL seed_appointments(50000); COMMIT;
CALL seed_appointments(50000); COMMIT;
CALL seed_appointments(50000); COMMIT;
CALL seed_appointments(50000); COMMIT;

ALTER TABLE appointment ENABLE TRIGGER ALL;

-- =====================================================================================
-- FINALIZE
-- =====================================================================================
-- =====================================================================================
-- FINALIZE
-- =====================================================================================

SELECT setval(
               'appointment_appointment_id_seq',
               COALESCE((SELECT MAX(appointment_id) FROM appointment), 1)
       );

SELECT setval(
               'users_user_id_seq',
               COALESCE((SELECT MAX(user_id) FROM users), 1)
       );

ANALYZE appointment;
ANALYZE users;
