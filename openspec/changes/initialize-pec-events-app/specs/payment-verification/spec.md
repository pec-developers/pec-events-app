## ADDED Requirements

### Requirement: Manual Verification Dashboard
Coordinators can view payment screenshots and transaction details to verify and either approve or reject event registrations.

#### Scenario: Coordinator Approves Valid UPI Registration
- **WHEN** a Student Coordinator or Faculty Coordinator clicks approve on a registration in the `PENDING_PAYMENT_VERIFICATION` state
- **THEN** the registration status is updated to `CONFIRMED`, the event slot capacity is decremented by 1, and a success notification payload is created for the student.

#### Scenario: Coordinator Rejects Invalid UPI Registration
- **WHEN** a Coordinator rejects a registration due to an invalid screenshot or transaction mismatch
- **THEN** the registration status is updated to `REJECTED` and a notification containing the rejection reason is scheduled for the student.
