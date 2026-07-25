# User Authentication & Authorization Specification

This specification defines the requirements for user authentication, registration, password recovery, and role-based access control (RBAC).

## Requirements

### Requirement: User Self-Registration
The system SHALL support self-registration for students. The user MUST supply registrationNumber, email, phoneNumber, name, and password. If the registration number is already in use, the system MUST reject it.

#### Scenario: Successful self-registration
- **WHEN** a student submits unique and valid registration details to the register endpoint
- **THEN** the system creates the user in Supabase Auth via the GoTrue admin API, saves the user profile locally, and returns 201 Created

#### Scenario: Registration fails due to existing registration number
- **WHEN** a student submits registration details where the registration number is already associated with an active user profile
- **THEN** the system SHALL return a 409 Conflict response

---

### Requirement: User Login Authentication
The system SHALL authenticate users using their email/username and password. Upon successful login, the system MUST return the JWT access token and set it in a secure HTTP-only Cookie.

#### Scenario: Successful login with valid credentials
- **WHEN** a user submits correct email/username and password to the login endpoint
- **THEN** the system authenticates the user via Supabase GoTrue, sets the secure `authToken` HTTP-only cookie, and returns the session details with the access token

#### Scenario: Failed login with invalid credentials
- **WHEN** a user submits incorrect credentials to the login endpoint
- **THEN** the system SHALL return a 401 Unauthorized status

---

### Requirement: Password Reset OTP Request
The system SHALL allow users to request a password reset OTP by specifying their email/identity and preferred channel (email or phone).

#### Scenario: Successful reset OTP dispatch
- **WHEN** a user requests a reset OTP with a valid registered email and selected channel
- **THEN** the system dispatches the single OTP via the chosen channel, returning a 200 OK along with a session token

---

### Requirement: Password Reset Completion
The system SHALL verify the password reset OTP and reset the user's password to the new value supplied.

#### Scenario: Successful password reset
- **WHEN** a user submits a valid reset session token, correct OTP, and new password to the reset endpoint
- **THEN** the system verifies the OTP, updates the user's password in Supabase, and returns a 200 OK response indicating success

---

### Requirement: User Profile Synchronization
The system SHALL synchronize user profile details (ID, name, email, department, role) from the Supabase JWT payload into the local PostgreSQL database on their first successful login.

#### Scenario: Successful synchronization of new user profile
- **WHEN** a user logs in for the first time with a valid Supabase session JWT
- **THEN** the system checks if the user exists in the local database, creates a new profile record if missing, and associates their corresponding database-defined role

---

### Requirement: Role-Based Authentication Status Check
The system SHALL support a `/api/auth/me` status check endpoint. It MUST validate the user's active session and return their profile details along with their database-mapped role.

#### Scenario: Successful status retrieval
- **WHEN** a user requests the `/api/auth/me` endpoint with a valid active session JWT cookie
- **THEN** the system retrieves and returns user profile details (id, email, name, role, department, registrationNumber) with a 200 OK status

#### Scenario: Unauthorized status check
- **WHEN** a user requests the `/api/auth/me` endpoint without a valid active session JWT cookie
- **THEN** the system returns a 401 Unauthorized status

---

### Requirement: Declarative Role-Based Access Control
The system SHALL restrict REST endpoints and pages depending on the user's role mapping. The backend SHALL enforce this via a custom `@RequiresRole` annotation on controller classes or methods.

#### Scenario: Authorized endpoint access
- **WHEN** a user requests a protected endpoint annotated with their correct active role
- **THEN** the system allows request execution and returns a 200 OK response

#### Scenario: Unauthorized endpoint access
- **WHEN** a user requests a protected endpoint annotated with a role they do not have
- **THEN** the system intercepts the request via `RoleCheckAspect` and returns a 403 Forbidden response

---

### Requirement: Role-specific login identifiers
Authentication must support login using Student/Faculty registration numbers for students/coordinators/SPOCs, and email for administrators.

#### Scenario: Admin logs in using Email
- **WHEN** Admin submits credentials with an email address.
- **THEN** The backend validates the credentials and issues a JWT token with ADMIN role.

#### Scenario: Student/Coordinator/SPOC logs in using Registration Number
- **WHEN** A student, coordinator, or SPOC submits credentials using their registration number.
- **THEN** The backend looks up the registration number, validates the password, and issues a JWT token with their respective role.

---

### Requirement: Editable profile details with field locks
Users can update their personal details, but administrative identifiers are locked.

#### Scenario: Edit editable profile fields
- **WHEN** A user edits their profile details to change email, name, phone number, or profile image.
- **THEN** The frontend submits the change to the backend profile update API, and the user profile updates.

#### Scenario: Locked administrative identifiers
- **WHEN** A user attempts to update their department, registration number, or role.
- **THEN** The API rejects the modification, keeping these values locked.

---

### Requirement: Role action boundaries
Each role must be strictly limited to their permitted actions on users, events, and registrations.

#### Scenario: Admin permission boundaries
- **WHEN** Admin attempts to retrieve the participant list of an event.
- **THEN** The backend blocks the request with 403 Forbidden.
- **WHEN** Admin attempts to CRUD users (focusing on SPOC account management) or read/update/delete any event.
- **THEN** The system authorizes the action.

#### Scenario: SPOC permission boundaries
- **WHEN** SPOC attempts to CRUD student and faculty coordinators' profiles within their department, or seed student profiles, or read all events.
- **THEN** The system authorizes the action.
- **WHEN** SPOC attempts to delete an event from their own department.
- **THEN** The system deletes the event.
- **WHEN** SPOC attempts to delete or write events in another department.
- **THEN** The system blocks the action with 403 Forbidden.

#### Scenario: Faculty Coordinator permission boundaries
- **WHEN** Faculty Coordinator attempts to CRUD events, manage registrations (read, update, delete) for their department, or export registration details into CSV with custom selected fields.
- **THEN** The system authorizes the action.

#### Scenario: Student Coordinator permission boundaries
- **WHEN** Student Coordinator attempts to read, create, update, or delete a draft event within their department, or manage registrations (read, update, delete), or export registration details into CSV.
- **THEN** The system authorizes the action.
- **WHEN** Student Coordinator attempts to create, update, or delete non-draft events.
- **THEN** The system blocks the action with 403 Forbidden.

#### Scenario: Student permission boundaries
- **WHEN** Student attempts to browse events, create or update their own registrations, or view their past registrations.
- **THEN** The system authorizes the action.
- **WHEN** Student attempts to edit events or access registrations of other users.
- **THEN** The system blocks the action with 403 Forbidden.

