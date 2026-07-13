## Why

Currently, the PEC Events application uses a very basic custom frontend state router and has simple role checks that are hardcoded. We need a robust React Router configuration to support role-based layout nesting (e.g., `/admin/*`, `/spoc/*`, `/student/*`) to match the clean decoupled architecture pattern seen in the reference implementation. Additionally, the system must enforce role limits per department that are configurable by the Admin dynamically rather than being static values.

## What Changes

1. **Frontend Nested Routing**: Install and integrate React Router. Set up role-based sub-dashboards with public/private route guards.
2. **Multi-Role Authentication & Authorization**:
   - Students & Student Coordinators log in using Student Registration Number and password.
   - SPOCs & Faculty Coordinators log in using Faculty Registration Number and password.
   - Admins log in using Email and password.
3. **Dynamic Department Limits & Department Management**: Implement a `system_configurations` key-value table to track and allow Admins to configure maximum limits for SPOCs, Faculty Coordinators, and Student Coordinators per department. Also, implement a department CRUD management flow allowing Admins to create, read, update, and delete academic departments.
4. **Enhanced Coordinator Actions**: Allow Faculty/Student Coordinators to export registration details to CSV with custom-selected fields.
5. **Profile Editing**: Allow all authenticated users to update their profile details (name, email, phone number, and profile image) while locking their department, registration number, and role.
6. **Dynamic API Synchronization**: Configure automatic Swagger/OpenAPI code/type generation on compile/build from Spring Boot backend.

## Capabilities

### New Capabilities
- `dynamic-role-limits`: Tracks department limits for SPOCs, Faculty, and Student Coordinators dynamically in the database via a generic key-value settings table, exposing Admin endpoints to modify them.
- `registration-export`: Allows coordinators (Faculty & Student) to select custom fields from the frontend and export event registration lists into CSV format.
- `department-management`: Exposes REST endpoints and frontend pages for Admins to perform CRUD operations on academic departments.

### Modified Capabilities
- `user-auth`: Extends authentication to support login via registration numbers (student/faculty) for appropriate roles, email for Admin, and locks profile fields (department, registration number, role) while allowing editability of email, name, phone number, and profile image.

## Impact

- **Frontend**: React Router v7 layout structures, dynamic API client generated from Swagger schema, forms for role-based dashboard pages, CSV exporter utility, and a department management view for Admins.
- **Backend**: Spring Boot schema updates (system settings table, departments table, role limit constraints check in service/database triggers), REST endpoints for admin configuration CRUD and department CRUD, updated login controller routing, and OpenAPI/Swagger configuration.
- **Database**: `system_configurations` table, `departments` table, DB validation trigger/functions for user counts, seeded role/permissions metadata.
