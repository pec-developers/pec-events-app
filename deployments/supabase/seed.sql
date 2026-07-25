-- Seed Departments
INSERT INTO departments (code, name) VALUES
('CSE', 'Computer Science & Engineering'),
('ECE', 'Electronics & Communication Engineering'),
('ME', 'Mechanical Engineering'),
('CE', 'Civil Engineering'),
('EEE', 'Electrical & Electronics Engineering')
ON CONFLICT (code) DO NOTHING;

-- Seed System Configurations (quote column names 'key' and 'value' because they are reserved keywords)
INSERT INTO system_configurations ("key", "value", description, updated_at) VALUES
('MAX_SPOCS_PER_DEPT', 1, 'Maximum SPOCs allowed per department', CURRENT_TIMESTAMP),
('MAX_FACULTY_COORDINATORS_PER_DEPT', 3, 'Maximum Faculty Coordinators allowed per department', CURRENT_TIMESTAMP),
('MAX_STUDENT_COORDINATORS_PER_DEPT', 3, 'Maximum Student Coordinators allowed per department', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- Seed Eligible Enrollments
INSERT INTO eligible_enrollments (registration_number, name, email, phone_number, department, role) VALUES
('PEC-SPOC-01', 'Dave SPOC', 'spoc@pec.edu', '+919000000001', 'CSE', 'SPOC'),
('PEC-FACULTY-COORD-01', 'Charlie Faculty Coord', 'facultycoord@pec.edu', '+919000000002', 'CSE', 'FACULTY_COORDINATOR'),
('PEC-STUDENT-COORD-01', 'Bob Student Coord', 'studentcoord@pec.edu', '+919000000003', 'CSE', 'STUDENT_COORDINATOR'),
('PEC-STUDENT-01', 'Alice Student', 'student@pec.edu', '+919000000004', 'CSE', 'STUDENT')
ON CONFLICT (registration_number) DO NOTHING;

-- Seed Events
INSERT INTO events (id, title, description, price, capacity, department, active, date, status, department_scope) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Inception 2026', 'The annual flagship tech symposium of PEC Computer Science Department, featuring hackathons, algorithms challenges, and paper presentations.', 0.00, 100, 'CSE', true, '2026-08-20 09:00:00', 'PUBLISHED', 'ALL_DEPTS'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'RoboQuest 2026', 'Design, assemble, and fight against autonomous bots in a maze arena. Organized by the Electronics & Robotics Society.', 150.00, 50, 'ECE', true, '2026-08-25 10:00:00', 'PUBLISHED', 'ALL_DEPTS'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Department Coding Meet - Draft', 'Internal practice coding competition for CSE department students only.', 0.00, 30, 'CSE', true, '2026-08-15 14:00:00', 'DRAFT', 'ONLY_DEPT')
ON CONFLICT (id) DO NOTHING;
