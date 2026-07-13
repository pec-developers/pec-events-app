## ADDED Requirements

### Requirement: Role-specific login identifiers
Authentication must support login using Student/Faculty registration numbers for students/coordinators/SPOCs, and email for administrators.

#### Scenario: Admin logs in using Email
- **WHEN** Admin submits credentials with an email address.
- **THEN** The backend validates the credentials and issues a JWT token with ADMIN role.

#### Scenario: Student/Coordinator/SPOC logs in using Registration Number
- **WHEN** A student, coordinator, or SPOC submits credentials using their registration number.
- **THEN** The backend looks up the registration number, validates the password, and issues a JWT token with their respective role.

### Requirement: Editable profile details with field locks
Users can update their personal details, but administrative identifiers are locked.

#### Scenario: Edit editable profile fields
- **WHEN** A user edits their profile details to change email, name, phone number, or profile image.
- **THEN** The frontend submits the change to the backend profile update API, and the user profile updates.

#### Scenario: Locked administrative identifiers
- **WHEN** A user attempts to update their department, registration number, or role.
- **THEN** The API rejects the modification, keeping these values locked.

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
