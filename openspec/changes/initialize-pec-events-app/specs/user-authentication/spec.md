## ADDED Requirements

### Requirement: Institutional Role Mapping & Sync
Users must be authenticated via Keycloak through Kong paths, mapping their JWT claims into specific system roles, and synchronizing their profile details to Supabase.

#### Scenario: Successful OAuth2 PKCE Authentication
- **WHEN** a user logs in via the Keycloak authentication screen routed through `/auth/*` on Kong
- **THEN** the React frontend receives and stores the JWT in the Zustand state, and forwards the token in the `Authorization: Bearer <token>` header for all subsequent API requests.

#### Scenario: Profile Sync on First Login
- **WHEN** a user completes successful login for the first time
- **THEN** the Spring Boot backend parses the JWT claims and synchronizes the user ID, name, email, department, and roles into the local Supabase PostgreSQL user profiles table.

#### Scenario: Open Domain Registration
- **WHEN** a new user registers an account
- **THEN** they are allowed to register using any email domain, and the profile is marked for manual approval/verification.
