## ADDED Requirements

### Requirement: Admin Department Management CRUD
The system must allow administrators to perform complete CRUD operations (Create, Read, Update, Delete) on academic departments.

#### Scenario: Create an academic department
- **WHEN** An Admin submits a request to create a department with code "CSE" and name "Computer Science and Engineering".
- **THEN** The system validates the code and name, stores the record, and returns a success status.

#### Scenario: Update an academic department
- **WHEN** An Admin submits an update to change department "CSE" name to "Computer Science".
- **THEN** The system updates the department name in the database.

#### Scenario: Delete an academic department
- **WHEN** An Admin deletes a department (e.g. "MECH").
- **THEN** The system deletes the department, or prevents deletion if there are active users/events referencing it.
