## Why

Currently, Prathyusha Engineering College (PEC) lacks a centralized, modern system for students to discover and register for campus events, and for coordinators (students and faculty) to seamlessly publish events, manage capacities, and verify registrations. 

Building a Progressive Web App (PWA) with a structured backend (Spring Boot, Keycloak, Kong, Supabase) will:
1. Provide a single source of truth for all college events.
2. Automate registration workflows and enforce strict seat limitations using database locking to avoid overselling.
3. Establish clear authorization boundaries across students, student coordinators, faculty, and system admins.
4. Support manual UPI payment verification in V1, laying the architectural groundwork for a smooth transition to Razorpay API integration in V2.

## What Changes

This change initializes the PEC Events Notification and Management application layout, setting up:
- Core React 19 / TypeScript frontend skeleton utilizing HeroUI v3, Tailwind CSS v4, React Router v7, and Zustand.
- Clean architectural layers in the frontend (API -> Data -> View layers).
- Spring Boot backend structure integrating with Keycloak for authentication and Kong as the API gateway.
- Managed Supabase Cloud (PostgreSQL) configuration with row-level locking.
- Environment-specific deployment manifests (Terraform + Helm charts for `dev` and `prod` targets).
- Comprehensive documentation suite under `docs/` (BRD, PRD, HLD, LLD).
- Standardized testing guidelines (Vitest, React Testing Library, JUnit, Spring Boot Test) following a docs-first STLC process.

## Capabilities

### New Capabilities
- `user-authentication`: Multi-role login and self-registration using registration number, email, and phone number via Keycloak behind Kong. Enforces sequential dual-channel OTP verification (Email OTP via Resend.com and Phone OTP via Twilio custom SMS Authenticator SPI) prior to user creation, redirects existing registration numbers to the login screen, and supports password recovery via Keycloak OTP.
- `event-management`: Interfaces for Faculty Coordinators to post events and assign collaborators (other Faculty/Student Coordinators). Collaborators have edit rights over assigned events.
- `event-registration`: Browse events list and register. Restricts registration eligibility to students, and automatically places users on a First-Come, First-Served (FCFS) Waiting List once capacity limit is reached.
- `waiting-list-promotion`: Database transaction logic that, upon user cancellation, promotes the oldest waiting list student (immediately confirmed for free events, or placed in `PENDING_PAYMENT` requesting payment upload for paid events).
- `payment-verification`: Management dashboard allowing assigned event coordinators to view, audit, and verify/approve UPI payment screenshots and registrations.
- `pwa-notifications`: Web Push API implementation using Service Workers and VAPID keys to send real-time OS-level push notifications to participants when promoted, registration status updates, or new events are published.

### Modified Capabilities
*None (Initial application bootstrap).*

## Impact

- **Frontend:** Adds directories/routes for SPOC dashboard (coordinator management) and collaborator management under `src/pages/`, plus updates to registration forms for FCFS Waiting List visual indicators and delayed payment submission.
- **Backend:** Introduces many-to-many `event_coordinators` mapping, SPOC management APIs, registration cancellation endpoints, and high-concurrency FCFS waiting list promotion transactional services.
- **Database & Storage:** Updates schemas for `users` roles, adds `event_coordinators` table, and expands registration states in Supabase.
- **Infrastructure:** Adds Terraform definitions for AWS resources (EKS, S3, CloudFront, Route 53) and deployment Helm charts including Redis (caching) and RabbitMQ (messaging queue) cluster deployments.
- **Documentation:** Initializes BRD, PRD, HLD, LLD, and STLC Test Specs under the `docs/` folder, aligned with the hierarchical flow, waiting list, messaging, and caching designs.
