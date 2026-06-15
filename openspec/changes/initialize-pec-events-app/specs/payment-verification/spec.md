## ADDED Requirements

### Requirement: Manual Verification & FCFS Promotions
Coordinators assigned to an event can view payment details to verify and approve/reject registrations. When a confirmed student cancels, the system automatically promotes the next waiting list student.

#### Scenario: Assigned Coordinator Approves Valid UPI Registration
- **WHEN** a Coordinator assigned to the event approves a registration in `PENDING_PAYMENT_VERIFICATION` state
- **THEN** the registration status is updated to `CONFIRMED` and a success notification is sent to the student.

#### Scenario: Coordinator Rejects Invalid UPI Registration
- **WHEN** an assigned Coordinator rejects a registration due to transaction verification mismatch
- **THEN** the registration status is updated to `REJECTED` and a push notification containing the rejection reason is scheduled.

#### Scenario: Student Dropout Triggers Free Event Promotion
- **WHEN** a student cancels a `CONFIRMED` registration on a free event with a waiting list
- **THEN** the oldest `WAITING_LIST` registration (by `created_at` ASC) is automatically promoted to `CONFIRMED` and notified.

#### Scenario: Student Dropout Triggers Paid Event Promotion
- **WHEN** a student cancels a `CONFIRMED` registration on a paid event with a waiting list
- **THEN** the oldest `WAITING_LIST` registration is automatically promoted to `PENDING_PAYMENT` and sent a push notification requesting payment details.

#### Scenario: Promoted Student Fails to Submit Payment Within 24 Hours
- **WHEN** a registration remains in `PENDING_PAYMENT` state for more than 24 hours after promotion
- **THEN** the registration status transitions to `EXPIRED` and the system automatically promotes the next student in the FCFS waiting list queue.

#### Scenario: Coordinator Rejects Payment with Re-upload Option
- **WHEN** an assigned Coordinator rejects a payment screenshot/transaction detail
- **THEN** the registration transitions to a status allowing re-upload (e.g. `PAYMENT_REJECTED`), a notification is sent to the student, and they are granted a 12-hour grace period to re-submit details before the registration is marked as `EXPIRED` and the slot is released.
