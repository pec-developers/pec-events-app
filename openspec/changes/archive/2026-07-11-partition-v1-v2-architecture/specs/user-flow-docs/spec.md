## ADDED Requirements

### Requirement: Phased Authentication UI Flows
The user flow specifications MUST detail the distinct registration and authentication workflows for both Version 1 (Supabase Auth direct integration) and Version 2 (Keycloak federated dual-OTP integration).

#### Scenario: User Authentication Options
- **WHEN** designing the user registration or login flows
- **THEN** the documentation MUST specify the V1 flow (Spring Boot `/auth/register` and `/auth/login` proxy endpoints, profile sync on first login, password reset OTPs via Supabase SMTP/SMS) and the V2 flow (Keycloak dual-OTP via Resend.com and Twilio SPI).
