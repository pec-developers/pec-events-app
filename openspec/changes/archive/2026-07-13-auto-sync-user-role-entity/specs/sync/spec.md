## ADDED Requirements

### Requirement: Auto-sync Role
The system SHALL ensure that when a User profile's roleEntity is saved, the User's flat role string field is synchronized with the roleEntity's name.

#### Scenario: Sync on Persist
- **WHEN** a User profile is persisted with a non-null roleEntity
- **THEN** the role field value matches the roleEntity's name
