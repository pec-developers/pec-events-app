## ADDED Requirements

### Requirement: Event Creation & Collaborations
Events can only be created by Faculty Coordinators. Faculty Coordinators can assign other coordinators (Faculty/Student) as collaborators to the event. Any collaborator assigned to an event can modify its parameters.

#### Scenario: Event Creation by Faculty Coordinator
- **WHEN** a Faculty Coordinator publishes a new event
- **THEN** the event record is saved in PostgreSQL with custom metadata, capacity, creator ID, and active registration flags, and the creator is automatically added as a collaborator.

#### Scenario: Collaborative Event Modification
- **WHEN** an assigned collaborator (Faculty Coordinator or Student Coordinator) updates event details (e.g., date, price, capacity)
- **THEN** the changes are saved successfully in the database.

#### Scenario: Collaborator Management Permissions
- **WHEN** the original event creator (Faculty Coordinator) or the department SPOC attempts to assign or remove collaborators for the event
- **THEN** the action is allowed and saved in the database.
- **WHEN** an assigned collaborator (Faculty or Student Coordinator) who is not the creator or SPOC attempts to add or remove collaborators
- **THEN** the action is rejected with a `403 Forbidden` error.

#### Scenario: High Concurrency Active Reservation Control
- **WHEN** multiple concurrent students attempt to register for the last remaining seat in an event
- **THEN** the backend applies database row-level locking (`SELECT ... FOR UPDATE` on the event inside a transaction) to count registrations in `CONFIRMED` or `PENDING_PAYMENT_VERIFICATION` states against capacity, allowing exactly one transaction to acquire the confirmed seat and placing others on the WAITING_LIST.
