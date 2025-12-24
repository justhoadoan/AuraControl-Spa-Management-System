-- 1. Table: Users
CREATE TABLE users (
                       user_id SERIAL PRIMARY KEY,
                       name VARCHAR(255),
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       role VARCHAR(50), -- Enum stored as string: 'CUSTOMER', 'TECHNICIAN', 'ADMIN'
                       phone_number VARCHAR(20),
                       is_active BOOLEAN DEFAULT FALSE,
                       verification_token VARCHAR(255),
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
                           type VARCHAR(100) -- e.g., 'ROOM', 'DEVICE'
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
                                 status VARCHAR(50) DEFAULT 'ACCEPTED',
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 CONSTRAINT fk_absence_tech FOREIGN KEY (technician_id) REFERENCES technician(technician_id) ON DELETE CASCADE
);