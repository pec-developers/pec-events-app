# Dynamic Role Limits Specification

## Purpose
Specification for dynamic role limits per department in the PEC Events application.

## Requirements

### Requirement: Dynamic role limit configuration
The system must allow administrators to configure the maximum limit of SPOCs, Faculty Coordinators, and Student Coordinators allowed per department.

#### Scenario: Configure SPOC limits per department
- **WHEN** An Admin updates the `MAX_SPOCS_PER_DEPT` system configuration key.
- **THEN** The system validation updates the limit, and any subsequent promotion that exceeds the new limit is rejected.

#### Scenario: Configure coordinator limits per department
- **WHEN** An Admin updates `MAX_FACULTY_COORDINATORS_PER_DEPT` or `MAX_STUDENT_COORDINATORS_PER_DEPT` keys.
- **THEN** The backend validates coordinator creation and update operations against these configured settings.

#### Scenario: Prevent exceeding the dynamic department-based SPOC limit
- **WHEN** A user tries to create or update a user to be SPOC in department "CSE" where a SPOC already exists (and `MAX_SPOCS_PER_DEPT` is 1).
- **THEN** The database trigger and backend application layer block the action and return an error message "Maximum SPOC limit exceeded for this department".
