## ADDED Requirements

### Requirement: Event Registration & Payment Submission
Students can register for free events immediately, or upload UPI payment screenshots for paid events to register with pending status.

#### Scenario: Free Event Immediate Confirmation
- **WHEN** an authenticated student registers for an active free event
- **THEN** their registration status is set to `CONFIRMED` and the event's available slot counter is decreased by 1.

#### Scenario: Paid Event UPI Submission
- **WHEN** an authenticated student registers for a paid event
- **THEN** they are presented with the payment UPI QR code, upload a payment screenshot, input the transaction ID, and their registration is created with a `PENDING_PAYMENT_VERIFICATION` status.

#### Scenario: Payment Screenshot S3 Upload
- **WHEN** a student submits their payment screenshot payload
- **THEN** the Spring Boot backend uploads the file directly to the provisioned AWS S3 bucket and records the S3 object URL in the registration audit table.
