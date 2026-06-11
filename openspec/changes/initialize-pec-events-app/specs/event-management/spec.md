## ADDED Requirements

### Requirement: Event Creation & Seat Allocations
Coordinators can create and publish events with specific capacity limits, enforcing database-level concurrency checks to prevent overselling of ticket inventory.

#### Scenario: Event Creation by Coordinator
- **WHEN** a Student Coordinator or Faculty Coordinator publishes a new event
- **THEN** the event record is saved in PostgreSQL with custom metadata, capacity limits, price (if paid), and active registration flags.

#### Scenario: High Concurrency Slot Allocation (Ticket Overbooking Control)
- **WHEN** multiple concurrent students attempt to register for the last remaining seat in an event
- **THEN** the backend applies database row-level locking (`SELECT ... FOR UPDATE` inside a transaction) to evaluate the remaining count, allowing exactly one transaction to commit and rejecting others as sold out.
