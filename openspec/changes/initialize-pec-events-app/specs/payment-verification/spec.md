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
