-- supabase/migrations/20260712000000_config_and_limits.sql

-- 1. Create Departments Table
CREATE TABLE departments (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default departments
INSERT INTO departments (code, name) VALUES 
('CSE', 'Computer Science and Engineering'),
('ECE', 'Electronics and Communication Engineering'),
('EEE', 'Electrical and Electronics Engineering'),
('IT', 'Information Technology'),
('MECH', 'Mechanical Engineering'),
('CIVIL', 'Civil Engineering'),
('AIDS', 'Artificial Intelligence and Data Science');

-- 2. Add constraints to existing tables referencing departments
-- First, ensure any existing records are valid or set to seeded departments (if applicable)
UPDATE eligible_enrollments SET department = 'CSE' WHERE department IS NULL OR department NOT IN ('CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'AIDS');
UPDATE users SET department = 'CSE' WHERE department IS NULL OR department NOT IN ('CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'AIDS');
UPDATE events SET department = 'CSE' WHERE department IS NULL OR department NOT IN ('CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'AIDS');

ALTER TABLE eligible_enrollments 
ADD CONSTRAINT fk_eligible_enrollments_department 
FOREIGN KEY (department) REFERENCES departments(code) ON UPDATE CASCADE;

ALTER TABLE users 
ADD CONSTRAINT fk_users_department 
FOREIGN KEY (department) REFERENCES departments(code) ON UPDATE CASCADE;

ALTER TABLE events 
ADD CONSTRAINT fk_events_department 
FOREIGN KEY (department) REFERENCES departments(code) ON UPDATE CASCADE;

-- 3. Create System Configurations Table
CREATE TABLE system_configurations (
    key VARCHAR(50) PRIMARY KEY,
    value INT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default configuration limits
INSERT INTO system_configurations (key, value, description) VALUES
('MAX_SPOCS_PER_DEPT', 1, 'Maximum SPOCs allowed per department'),
('MAX_FACULTY_COORDINATORS_PER_DEPT', 3, 'Maximum Faculty Coordinators allowed per department'),
('MAX_STUDENT_COORDINATORS_PER_DEPT', 3, 'Maximum Student Coordinators allowed per department');

-- 4. Create trigger to enforce department role limits dynamically
CREATE OR REPLACE FUNCTION check_department_role_limits() 
RETURNS TRIGGER AS $$
DECLARE
    role_limit INT;
    current_count INT;
BEGIN
    -- Only check SPOC, FACULTY_COORDINATOR, and STUDENT_COORDINATOR limits
    IF NEW.role = 'SPOC' THEN
        SELECT value INTO role_limit FROM system_configurations WHERE key = 'MAX_SPOCS_PER_DEPT';
    ELSIF NEW.role = 'FACULTY_COORDINATOR' THEN
        SELECT value INTO role_limit FROM system_configurations WHERE key = 'MAX_FACULTY_COORDINATORS_PER_DEPT';
    ELSIF NEW.role = 'STUDENT_COORDINATOR' THEN
        SELECT value INTO role_limit FROM system_configurations WHERE key = 'MAX_STUDENT_COORDINATORS_PER_DEPT';
    ELSE
        RETURN NEW;
    END IF;

    -- Count active users with this role in the department
    SELECT COUNT(*) INTO current_count FROM users 
    WHERE role = NEW.role AND department = NEW.department AND id <> NEW.id;

    IF current_count >= role_limit THEN
        RAISE EXCEPTION 'Maximum % limit of % exceeded for department %', NEW.role, role_limit, NEW.department;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_check_department_role_limits
BEFORE INSERT OR UPDATE OF role, department ON users
FOR EACH ROW EXECUTE FUNCTION check_department_role_limits();
