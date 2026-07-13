## ADDED Requirements

### Requirement: Custom field registration export
Coordinators (Faculty & Student) must be able to export event registrations as a CSV file, selecting which fields to include.

#### Scenario: Export registrations with selected custom fields
- **WHEN** A coordinator selects specific columns (e.g. `registrationNumber`, `name`, `email`, `department`, `status`) and triggers CSV export.
- **THEN** The client-side utility filters registration fields accordingly and downloads a CSV containing only those custom-selected fields.
