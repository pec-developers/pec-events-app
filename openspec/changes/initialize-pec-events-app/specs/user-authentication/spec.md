## ADDED Requirements

### Requirement: Institutional Role Mapping & Sync
Users must be authenticated via Keycloak through Kong paths, mapping their JWT claims into specific system roles, and synchronizing their profile details to Supabase. Logins are pre-created by the System Admin.

#### Scenario: Successful OAuth2 PKCE Authentication
- **WHEN** a user logs in with pre-created credentials via Keycloak routed through `/auth/*` on Kong
- **THEN** the React frontend receives and stores the JWT in the Zustand state, and forwards the token in the `Authorization: Bearer <token>` header for all subsequent API requests.

#### Scenario: Profile Sync on First Login
- **WHEN** a user completes successful login for the first time
- **THEN** the Spring Boot backend parses the JWT claims and synchronizes the user ID, name, email, department, and basic role (`STUDENT`, `FACULTY`, `ADMIN`) into the local Supabase PostgreSQL user profiles table.

#### Scenario: Admin Designates SPOC
- **WHEN** the System Admin marks a specific Faculty user as a department SPOC
- **THEN** the user's role is updated to `SPOC` and they are assigned administrative authority over that department's coordinators in the database.

#### Scenario: SPOC Promotes Coordinator
- **WHEN** a SPOC promotes a user of their department to coordinator
- **THEN** if the user profile type is Student, their role changes to `STUDENT_COORDINATOR`; if it is Faculty, it changes to `FACULTY_COORDINATOR` in the database user profile.
