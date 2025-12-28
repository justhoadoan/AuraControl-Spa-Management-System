-- 1. Table: Users
CREATE TABLE IF NOT EXISTS users (
                        user_id SERIAL PRIMARY KEY,
                        name VARCHAR(255),
                        email VARCHAR(255) NOT NULL UNIQUE,
                        password VARCHAR(255) NOT NULL,
                        role VARCHAR(50), -- Enum stored as string: 'CUSTOMER', 'TECHNICIAN', 'ADMIN'
                        is_enabled BOOLEAN DEFAULT TRUE,
                        verification_token VARCHAR(255),
                        reset_password_token VARCHAR(255),
                        reset_password_token_expiry TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
-- 2. Table: Customer (Links to Users)
CREATE TABLE customer (
                          customer_id SERIAL PRIMARY KEY,
                          user_id INT UNIQUE NOT NULL,
                          CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- 3. Table: Technician (Links to Users)
CREATE TABLE technician (
                            technician_id SERIAL PRIMARY KEY,
                            user_id INT UNIQUE NOT NULL,
                            CONSTRAINT fk_technician_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- 4. Table: Services
CREATE TABLE services (
                          service_id SERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          price DECIMAL(10, 2) NOT NULL,
                          duration_minutes INT NOT NULL,
                          is_active BOOLEAN DEFAULT TRUE
);

-- 5. Table: Resources (Equipment/Rooms)
CREATE TABLE resources (
                           resource_id SERIAL PRIMARY KEY,
                           name VARCHAR(255) NOT NULL,
                           type VARCHAR(100), -- e.g., 'ROOM', 'DEVICE'
                           is_deleted BOOLEAN DEFAULT FALSE
);

-- 6. Table: Technician_Services (Junction table: Which tech can do which service)
CREATE TABLE technician_services (
                                     technician_id INT NOT NULL,
                                     service_id INT NOT NULL,
                                     PRIMARY KEY (technician_id, service_id),
                                     CONSTRAINT fk_ts_technician FOREIGN KEY (technician_id) REFERENCES technician(technician_id) ON DELETE CASCADE,
                                     CONSTRAINT fk_ts_service FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

-- 7. Table: Service_Resource_Requirement (What resources a service needs)
CREATE TABLE service_resource_requirement (
                                              requirement_id SERIAL PRIMARY KEY,
                                              service_id INT NOT NULL,
                                              resource_type VARCHAR(100),
                                              quantity INT DEFAULT 1,
                                              CONSTRAINT fk_srr_service FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

-- 8. Table: Appointment (The core transaction table)
CREATE TABLE appointment (
                             appointment_id SERIAL PRIMARY KEY,
                             customer_id INT NOT NULL,
                             technician_id INT NOT NULL,
                             service_id INT NOT NULL,
                             start_time TIMESTAMP NOT NULL,
                             end_time TIMESTAMP NOT NULL,
                             status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, COMPLETED
                             final_price DECIMAL(10, 2),
                             note_text TEXT,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                             CONSTRAINT fk_appt_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
                             CONSTRAINT fk_appt_technician FOREIGN KEY (technician_id) REFERENCES technician(technician_id),
                             CONSTRAINT fk_appt_service FOREIGN KEY (service_id) REFERENCES services(service_id)
);

-- 9. Table: Appointment_Resource (Specific resources booked for an appointment)
CREATE TABLE appointment_resource (
                                      appointment_id INT NOT NULL,
                                      resource_id INT NOT NULL,
                                      PRIMARY KEY (appointment_id, resource_id),
                                      CONSTRAINT fk_ar_appointment FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE CASCADE,
                                      CONSTRAINT fk_ar_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE
);


-- 10. Table: Absence_Request (Technician leave requests)
CREATE TABLE absence_request (
                                 request_id SERIAL PRIMARY KEY,
                                 technician_id INT NOT NULL,
                                 start_date TIMESTAMP NOT NULL,
                                 end_date TIMESTAMP NOT NULL,
                                 reason TEXT,
                                 status VARCHAR(50) DEFAULT 'PENDING',
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 CONSTRAINT fk_absence_tech FOREIGN KEY (technician_id) REFERENCES technician(technician_id) ON DELETE CASCADE
);
-- 1. Users
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_users_reset_token ON users(reset_password_token);

-- 2. Customer
CREATE INDEX idx_customer_user_id ON customer(user_id);

-- 3. Technician
CREATE INDEX idx_technician_user_id ON technician(user_id);

-- 4. Services
CREATE INDEX idx_services_active ON services(is_active);

-- 5. Resources
CREATE INDEX idx_resources_type ON resources(type) WHERE is_deleted = FALSE;

-- 6. Technician_Services
CREATE INDEX idx_ts_service_technician ON technician_services(service_id, technician_id);

-- 7. Service_Resource_Requirement
CREATE INDEX idx_srr_service ON service_resource_requirement(service_id);

-- 8. Appointment
CREATE INDEX idx_appt_technician_time_active
    ON appointment(technician_id, start_time, end_time)
    WHERE status != 'CANCELLED';

CREATE INDEX idx_appt_completed_end_time
    ON appointment (end_time)
    WHERE status = 'COMPLETED';

CREATE INDEX idx_appt_customer_time ON appointment(customer_id, start_time DESC);

CREATE INDEX idx_appt_service ON appointment(service_id);

CREATE INDEX idx_appt_status ON appointment(status);

CREATE INDEX idx_appt_today
    ON appointment (start_time, status);

CREATE INDEX idx_users_today_customer
    ON users (created_at)
    WHERE role = 'CUSTOMER';


-- 9. Appointment_Resource
CREATE INDEX idx_ar_resource ON appointment_resource(resource_id);

-- 10. Absence_Request
CREATE INDEX idx_absence_technician_time_approved
    ON absence_request(technician_id, start_date, end_date)
    WHERE status = 'APPROVED';
