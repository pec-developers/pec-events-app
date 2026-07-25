-- supabase/migrations/20260711000000_init_schema.sql

-- 1. Eligible Enrollments Table
CREATE TABLE eligible_enrollments (
    registration_number VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    department VARCHAR(50),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions TEXT[]
);

-- Seed Initial Roles
INSERT INTO roles (name, permissions) VALUES 
('STUDENT', ARRAY['BROWSE_EVENTS', 'REGISTER_EVENTS', 'RECEIVE_NOTIFICATIONS']),
('STUDENT_COORDINATOR', ARRAY['BROWSE_EVENTS', 'REGISTER_EVENTS', 'CREATE_EVENTS', 'MANAGE_REGISTRATIONS', 'RECEIVE_NOTIFICATIONS']),
('FACULTY_COORDINATOR', ARRAY['BROWSE_EVENTS', 'CREATE_EVENTS', 'PUBLISH_EVENTS', 'MANAGE_REGISTRATIONS', 'MANAGE_COLLABORATORS', 'RECEIVE_NOTIFICATIONS']),
('SPOC', ARRAY['BROWSE_EVENTS', 'CREATE_EVENTS', 'PUBLISH_EVENTS', 'MANAGE_REGISTRATIONS', 'MANAGE_COLLABORATORS', 'PROMOTE_COORDINATORS', 'RECEIVE_NOTIFICATIONS']),
('ADMIN', ARRAY['MANAGE_USERS', 'MANAGE_ROLES', 'VIEW_AUDIT_LOGS', 'CONFIGURE_SYSTEM']);

-- 3. Users Table (synchronized from Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Matches Supabase auth.users.id
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    registration_number VARCHAR(50) REFERENCES eligible_enrollments(registration_number),
    department VARCHAR(50),
    role VARCHAR(50), -- Matches role name
    role_id INT REFERENCES roles(id),
    profile_image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES users(id),
    department VARCHAR(50),
    price DECIMAL(10, 2) DEFAULT 0.00,
    capacity INT NOT NULL,
    qr_code_url VARCHAR(255),
    banner_image_url VARCHAR(255),
    poster_image_url VARCHAR(255),
    event_photos_urls VARCHAR(255)[],
    active BOOLEAN DEFAULT TRUE,
    date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Event Collaborators Table
CREATE TABLE event_coordinators (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id)
);

-- 6. Registrations Table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    event_id UUID REFERENCES events(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payment Audit Logs Table
CREATE TABLE payment_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100),
    screenshot_s3_url VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Push Subscriptions Table
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
