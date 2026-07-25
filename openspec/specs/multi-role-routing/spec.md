# Multi-Role Routing Specification

## Purpose
Specification for managing multi-role routing and access control in the PEC Events application.

## Requirements

### Requirement: Direct Backend Flow
All authentication, configuration queries, department queries, event moderation, registrations, and cancellations must route through the Axios live HTTP client, without local storage mock fallbacks.

#### Scenario: User Sign-in
- **WHEN** user inputs registration credentials
- **THEN** client posts details directly to the Spring Boot auth endpoint.
