## ADDED Requirements

### Requirement: Institutional Role Mapping & Sync
Users must be authenticated via Keycloak through Kong paths, mapping their JWT claims into specific system roles, and synchronizing their profile details to Supabase. Users self-register using their registration number, email, and phone number.

#### Scenario: Successful Self-Registration
- **WHEN** a user registers with a unique registration number, email, and phone number
- **THEN** their account is created in Keycloak and their profile is synced to Supabase on first login.

#### Scenario: Self-Registration with Existing Registration Number
- **WHEN** a user registers with an already registered registration number
- **THEN** the request is rejected and they are redirected to the login screen with a warning.

#### Scenario: OTP Password Recovery via Keycloak
- **WHEN** a user requests a password reset on Keycloak and chooses Email or SMS (Phone)
- **THEN** Keycloak dispatches a reset code or OTP through Resend.com (Email) or Twilio (SMS), allowing them to verify and reset their credentials directly on Keycloak.

#### Scenario: Successful OAuth2 PKCE Authentication
- **WHEN** a user logs in via Keycloak routed through `/auth/*` on Kong
- **THEN** the React frontend receives and stores the JWT in the Zustand state, and forwards the token in the `Authorization: Bearer <token>` header for all subsequent API requests.

#### Scenario: Profile Sync on First Login
- **WHEN** a user completes successful login for the first time
- **THEN** the Spring Boot backend parses the JWT claims and synchronizes the user ID, name, email, phone_number, registration_number, department, and basic role (`STUDENT`, `FACULTY`, `ADMIN`) into the local Supabase PostgreSQL user profiles table.

#### Scenario: Admin Designates SPOC
- **WHEN** the System Admin marks a specific Faculty user as a department SPOC
- **THEN** the user's role is updated to `SPOC` and they are assigned administrative authority over that department's coordinators in the database.

#### Scenario: SPOC Promotes Coordinator
- **WHEN** a SPOC promotes a user of their department to coordinator
- **THEN** if the user profile type is Student, their role changes to `STUDENT_COORDINATOR`; if it is Faculty, it changes to `FACULTY_COORDINATOR` in the database user profile.
