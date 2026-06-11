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
- `user-authentication`: Multi-role login and registration using Keycloak (OAuth2 Authorization Code + PKCE) mapped behind the Kong Gateway, with basic profile sync to Supabase PostgreSQL on successful login.
- `event-management`: Interfaces for Faculty and Student Coordinators to create, publish, and update free and paid events.
- `event-registration`: Browse events list and register. For paid events, allows students to submit UPI transaction details and upload payment confirmation screenshots.
- `payment-verification`: Management dashboard allowing both Student and Faculty Coordinators to view, audit, and verify/approve UPI payment screenshots and registrations.
- `pwa-notifications`: Web Push API implementation using Service Workers and VAPID keys to send real-time OS-level push notifications to participants when registrations are approved or new events are published.

### Modified Capabilities
*None (Initial application bootstrap).*

## Impact

- **Frontend:** Introduces new structures under `frontend/src/api/`, `frontend/src/stores/`, `frontend/src/components/`, and `frontend/src/pages/`.
- **Backend:** Initial Spring Boot API modules, database schemas, and integration points with Kong API Gateway.
- **Database & Storage:** Configures local PostgreSQL schemas in Supabase and provisioned AWS S3 buckets for transaction screenshots.
- **Infrastructure:** Adds Terraform definitions for AWS resources (EKS, S3, CloudFront, Route 53) and deployment Helm charts.
- **Documentation:** Initializes BRD, PRD, HLD, and LLD in the `docs/` folder.
