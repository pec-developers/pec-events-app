## ADDED Requirements

### Requirement: Event Registration & FCFS Waiting List
Students can register for events. If capacity is available, they transition to confirmed (for free events) or pending verification (for paid events). If the event is full, they join the FCFS waiting list (with payment deferred for paid events).

#### Scenario: Free Event Immediate Confirmation
- **WHEN** an authenticated student registers for an active free event with slots available
- **THEN** their registration status is set to `CONFIRMED` and active reservations increment by 1.

#### Scenario: Paid Event UPI Submission
- **WHEN** an authenticated student registers for a paid event with slots available
- **THEN** they are presented with the UPI QR code, upload a payment screenshot, input the transaction ID, and their registration is created in the `PENDING_PAYMENT_VERIFICATION` status.

#### Scenario: Event Full Waiting List Placement
- **WHEN** an authenticated student registers for an event where active confirmed/pending registrations equal or exceed capacity
- **THEN** their registration is successfully created in the `WAITING_LIST` state, and no payment details are requested (for paid events).

#### Scenario: Payment Screenshot S3 Upload
- **WHEN** a student submits their payment screenshot payload (either during active registration or after waiting list promotion)
- **THEN** the Spring Boot backend uploads the file directly to the provisioned AWS S3 bucket and records the S3 object URL in the registration audit table, transitioning status to `PENDING_PAYMENT_VERIFICATION`.

#### Scenario: Faculty Member Registration Rejection
- **WHEN** an authenticated faculty member (including Non-Coordinators, Coordinators, and SPOCs) attempts to register for an event
- **THEN** their request is rejected with a `403 Forbidden` error, stating that only students are eligible to participate.
