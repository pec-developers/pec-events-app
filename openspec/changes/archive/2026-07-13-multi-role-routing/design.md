## Context

The current application requires transitioning from simple client-state routing to robust multi-role route navigation using React Router v7. Furthermore, we must implement 5 distinct login flows and enforce configurable per-department role quotas (1 SPOC, 3 Faculty Coordinators, 3 Student Coordinators) which admins can modify dynamically.

## Goals / Non-Goals

**Goals:**
- Implement nested route structures in React Router v7 for `ADMIN`, `SPOC`, `FACULTY_COORDINATOR`, `STUDENT_COORDINATOR`, and `STUDENT`.
- Support credentials-based authentication: Students & Student Coordinators log in via student registration number; SPOCs & Faculty Coordinators log in via faculty registration number; Admins log in via email.
- Allow Admins to configure department-based role limits dynamically.
- Implement an automated Swagger-to-TypeScript client generation strategy using `openapi-generator-cli`.
- Allow all users to update name, email, phone number, and profile image, while locking role, department, and registration number.
- Expose CSV registration export with customizable field selections for coordinator roles.
- Enforce strict role-specific authorization boundaries:
  1. **Admin**: CRUD all users (except SPOC management is the primary user flow); CRUD departments; read, update, delete any event (explicitly blocked from accessing participant lists).
  2. **SPOC**: CRUD student coordinators' and faculty coordinators' profiles; seed student profiles; read all events; delete only events of their department.
  3. **Faculty Coordinator**: CRUD events; read, update, and delete registrations; export registrations to CSV with custom fields.
  4. **Student Coordinator**: Read all events; CRUD *only draft events* within their department (cannot modify active/published events); read, update, delete registrations; export registrations to CSV with custom fields; plus all capabilities of a Student.
  5. **Student**: Read all events; create and update their own registrations; view their own past registrations.

**Non-Goals:**
- Integrating live payment gateways (Razorpay is out of scope for V1).
- Direct authentication via external identity providers in V1 (Keycloak and Kong integration is a Phase 2 non-goal for this change).

## Decisions

### 1. Frontend 3-Tier Architecture
We will organize our frontend code according to the 3-tier architecture:
- **View Layer**: Components and dashboards reside under `src/pages/` and `src/components/`. We will create role-specific dashboards inside `src/pages/admin/`, `src/pages/spoc/`, `src/pages/coordinator/`, and `src/pages/student/`. Styling will continue to leverage HeroUI v3 + Tailwind CSS v4.
- **Data & State Layer**: Zustand stores (`src/stores/authStore.ts`, `src/stores/settingsStore.ts`) manage global session and UI settings (like the theme). Form state is managed via React hooks inside `src/hooks/`.
- **API & Service Layer**: `src/api/` will contain generated Swagger services. We will add a script (`scripts/generate-api.js`) that downloads the OpenAPI spec from `http://localhost:8080/v3/api-docs` and triggers `@openapitools/openapi-generator-cli` to produce clean Axios-based api hooks and types.

### 2. Database Schema Updates
We will add a `system_configurations` table and a `departments` table:
```sql
CREATE TABLE departments (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_configurations (
    key VARCHAR(50) PRIMARY KEY,
    value INT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed defaults
INSERT INTO system_configurations (key, value, description) VALUES
('MAX_SPOCS_PER_DEPT', 1, 'Maximum SPOCs allowed per department'),
('MAX_FACULTY_COORDINATORS_PER_DEPT', 3, 'Maximum Faculty Coordinators allowed per department'),
('MAX_STUDENT_COORDINATORS_PER_DEPT', 3, 'Maximum Student Coordinators allowed per department');
```

To enforce these dynamic constraints on a database level, we will create a PL/pgSQL validation trigger on `users`. First, we should ensure the user's department references a valid department in the `departments` table:
```sql
ALTER TABLE eligible_enrollments 
ADD CONSTRAINT fk_eligible_enrollments_department 
FOREIGN KEY (department) REFERENCES departments(code) ON UPDATE CASCADE;

ALTER TABLE users 
ADD CONSTRAINT fk_users_department 
FOREIGN KEY (department) REFERENCES departments(code) ON UPDATE CASCADE;

ALTER TABLE events 
ADD CONSTRAINT fk_events_department 
FOREIGN KEY (department) REFERENCES departments(code) ON UPDATE CASCADE;
```

Validation trigger function on `users`:
```sql
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

CREATE TRIGGER trigger_check_department_role_limits
BEFORE INSERT OR UPDATE OF role, department ON users
FOR EACH ROW EXECUTE FUNCTION check_department_role_limits();
```

### 3. Backend Separations & Spring Boot APIs
- **Controllers**:
  - `controller/admin/AdminConfigController.java`: Exposes GET/PUT for system configurations.
  - `controller/admin/AdminDepartmentController.java`: Exposes CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`) for departments, secured with `@RequiresRole("ADMIN")`.
  - `controller/shared/ProfileController.java`: Handles user profile modifications.
  - `controller/shared/AuthController.java`: Modified login endpoint handling both email and registration number checks.
- **Service Layer**:
  - Validate role assignment quotas and department existence inside `UserService.java` / `DepartmentService.java`.
- **AOP Security**:
  - Ensure `@RequiresRole` checks request authorization.

## Risks / Trade-offs

- **Offline API Generation**: If the backend is not running during a build, OpenAPI sync can fail. We will commit the latest generated API specification to the repository to serve as a offline fallback.
