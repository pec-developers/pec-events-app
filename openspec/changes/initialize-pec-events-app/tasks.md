## 1. Initial Documentation & STLC QA Planning

- [x] 1.1 Create Business Requirements Document (BRD) under `docs/brd.md` defining core workflows, roles, and V1 UPI scoping.
- [ ] 1.2 Create Product Requirements Document (PRD) under `docs/prd.md` specifying details for events list, registration forms, and manual approvals.
- [ ] 1.3 Create High-Level Design (HLD) under `docs/hld.md` containing network topology and auth flow diagrams using Mermaid syntax.
- [ ] 1.4 Create Low-Level Design (LLD) under `docs/lld.md` detailing PostgreSQL database schemas, entity relationship (ER) diagrams, and Spring Boot API schemas with JSON examples.
- [ ] 1.5 Write Test Case Specification documentation under `docs/testing_spec.md` listing Unit and Integration scenarios following the STLC process.

## 2. Infrastructure & Environment Setup

- [ ] 2.1 Write Terraform scripts to provision AWS EKS cluster, VPC, networking subnet, security groups, and Route 53 DNS records.
- [ ] 2.2 Write Terraform scripts to provision a dedicated AWS S3 bucket for screenshot storage with private access policies.
- [ ] 2.3 Write Terraform scripts to provision Supabase PostgreSQL databases for dev and prod environments.
- [ ] 2.4 Structure Kubernetes Helm charts inside the repository (`infra/helm/`) for Spring Boot, Keycloak, and Kong services, separating `values-dev.yaml` and `values-prod.yaml` configurations.
- [ ] 2.5 Initialize Supabase database migrations tracking scripts in the repository (`infra/supabase/migrations/`) with the initial profiles, events, registrations, and logs tables.
- [ ] 2.6 Setup GitHub Actions pipelines (`.github/workflows/`) for building Docker images, linting Helm charts, running test suites, and deploying manifests.

## 3. Frontend Workspace & Architecture Setup

- [ ] 3.1 Setup HeroUI v3 (NextUI) component library and Tailwind CSS v4 in the `frontend` package.
- [ ] 3.2 Configure React Router v7 inside `frontend/src/main.tsx` and structure routing configurations.
- [ ] 3.3 Create frontend directory structures for layer separation: `src/api/` (API layer), `src/stores/` (Zustand stores data layer), `src/components/` (view layout components), and `src/pages/` (view pages).
- [ ] 3.4 Initialize baseline CSS styling in `frontend/src/index.css` incorporating PEC brand color `#a80000` custom accents, typography, and default light mode.

## 4. Keycloak & Kong Gateway Integration

- [ ] 4.1 Setup Keycloak Realm, client configuration for PKCE OAuth2 flow, and define the 5 user roles (`ADMIN`, `SPOC`, `FACULTY_COORDINATOR`, `STUDENT_COORDINATOR`, `STUDENT`).
- [ ] 4.2 Configure Kong API Gateway routing rules, exposing Keycloak endpoints under `/auth/*` and proxying API endpoints under `/api/*` to EKS backend pods.
- [ ] 4.3 Implement PKCE login flow in React frontend, saving retrieved JWT access and refresh tokens inside Zustand store `src/stores/authStore.ts`.
- [ ] 4.4 Set up Kong Gateway rate-limiting and CORS policy plugins for uniform security.
- [ ] 4.5 Configure Keycloak user self-registration settings mapping registration number, email, and phone number. Setup SMTP settings with Resend.com for Email OTP and deploy custom SMS Authenticator SPI for Twilio for SMS OTP.

## 5. Backend Base Setup & User Synchronization

- [ ] 5.1 Initialize Spring Boot Web project, configuring build dependencies (Spring Security, Spring Web, OAuth2 Resource Server, PostgreSQL Driver).
- [ ] 5.2 Configure Spring Security context to decode and validate Keycloak JWT access tokens forwarded by Kong.
- [ ] 5.3 Implement user profile synchronization handler: on successful user authentication, extract Keycloak claims and write user info (ID, name, email, phone number, registration number, department, role) to the Supabase PostgreSQL database.
- [ ] 5.4 Implement Admin SPOC management endpoints: `POST /api/admin/spocs` (assign a user as SPOC for a department).
- [ ] 5.5 Implement SPOC Coordinator management endpoints: `POST /api/spoc/coordinators` (promote department users to coordinators).
- [ ] 5.6 Implement database profile sync validations in Spring Boot (checking that registration number exists in eligible_enrollments list, rejecting if not).
- [ ] 5.7 Build React Admin and SPOC views using HeroUI showing user lists, department assignments, and promotion buttons.
- [ ] 5.8 Integrate forgot password flows redirecting user to Keycloak's OTP-based recovery pages.
- [ ] 5.9 Write Vitest tests for `src/stores/authStore.ts` and JUnit tests for backend security token decode filters.

## 6. Event Creation & High-Concurrency Capacity Control

- [ ] 6.1 Create test documentation for event management endpoints under STLC specs.
- [ ] 6.2 Implement backend Spring Boot endpoints for event creation: CRUD APIs. Enforce that only Faculty Coordinators can call `POST /api/events` to post events.
- [ ] 6.3 Implement `event_coordinators` many-to-many relationship and endpoints to assign/remove collaborators on events.
- [ ] 6.4 Implement database transaction logic utilizing `SELECT ... FOR UPDATE` (row-level locking) when reserving seats to ensure FCFS order and prevent ticket overselling.
- [ ] 6.5 Write integration tests (Spring Boot Test + Testcontainers/PostgreSQL) validating that concurrent requests for event slots respect capacity constraints.
- [ ] 6.6 Configure Redis cache inside Spring Boot using `@Cacheable` for event discovery listings and `@CacheEvict` for event write/status updates.
- [ ] 6.7 Build React dashboard pages for coordinators to create events, manage collaborator lists, and edit assigned events using HeroUI components.

## 7. Registrations & FCFS Waiting List (V1)

- [ ] 7.1 Create test case specifications for free/paid registration and waiting list workflows.
- [ ] 7.2 Implement Spring Boot endpoint `POST /api/events/{eventId}/register` to process registrations. Validate that the user is a student; if capacity limit is reached, place the registration in the `WAITING_LIST` state (deferring payment for paid events).
- [ ] 7.3 Implement cancellation/dropout endpoint: `POST /api/registrations/{registrationId}/cancel` that triggers a database transaction to cancel the reservation and automatically promote the oldest waiting list entry.
- [ ] 7.4 Implement payment upload endpoint for promoted waiting list students: `POST /api/registrations/{registrationId}/submit-payment` which takes screenshots and uploads them to AWS S3, transitioning status to `PENDING_PAYMENT_VERIFICATION`.
- [ ] 7.5 Build React registration views for students showcasing waiting list placement notifications, cancel registration actions, and delayed UPI payment modals.
- [ ] 7.6 Write JUnit unit tests for the FCFS promotion logic and Vitest integration tests for Zustand registration stores.

## 8. Coordinator Verification Dashboard

- [ ] 8.1 Create test case specifications for manual UPI validation and coordinator audits.
- [ ] 8.2 Implement backend endpoints for coordinators to fetch registrations by state (including waiting list and pending payment) and verify/approve/reject them.
- [ ] 8.3 Build React dashboard components using HeroUI showing lists of pending payments, screenshot modals, and actions to approve/reject registrations.
- [ ] 8.4 Write JUnit validation tests verifying state transition safety.

## 9. Web Push Notifications

- [ ] 9.1 Design push notification subscription and service worker test specifications.
- [ ] 9.2 Implement backend endpoints for registering Web Push subscriptions.
- [ ] 9.3 Setup RabbitMQ exchanges and queues for event publishing and registration status updates.
- [ ] 9.4 Implement RabbitMQ message publishers and listeners in Spring Boot to decouple notification dispatches.
- [ ] 9.5 Implement backend push notification service utilizing VAPID keys to sign and dispatch payloads (triggered by RabbitMQ listeners).
- [ ] 9.6 Register and script PWA service worker in React frontend to listen for background push messages and trigger OS-level notification boxes.
- [ ] 9.7 Integrate push alert triggers: publish RabbitMQ messages automatically when a waiting list student is promoted (`CONFIRMED` or `PENDING_PAYMENT`).
- [ ] 9.8 Write integration tests for RabbitMQ event queuing and push notification dispatches.

## 10. End-to-End Verification & Deployments

- [ ] 10.1 Run all Vitest frontend unit and store integration tests, ensuring 100% test coverage target.
- [ ] 10.2 Run all Spring Boot JUnit and integration tests, ensuring database locking and auth configurations are verified.
- [ ] 10.3 Execute dry-run deployments of Terraform and Helm charts to verify dev environment manifests.
- [ ] 10.4 Run full automated CI/CD pipeline on GitHub Actions to deploy to AWS EKS dev and prod environments.
