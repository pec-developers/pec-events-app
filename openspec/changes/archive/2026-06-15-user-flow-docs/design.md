## Context

The PEC Events application requires a structured, clear specification detailing the user interface flows, component design patterns, and front-to-back architecture. Currently, high-level business goals are set in the BRD and general product scopes in the PRD, but there is a gap in detail regarding frontend design tokens, routing architectures, validation boundaries, and manual verification interfaces. This document designs the documentation structure, directory boundaries, and schema requirements for `docs/user-flow-docs.md`.

## Goals / Non-Goals

**Goals:**
- Define the layout structure, typography, theme variables, and component tokens for the React + HeroUI v3 + Tailwind CSS v4 stack.
- Formalize the frontend 3-layer architecture (API Layer, Zustand Stores, Views/Components).
- Design user flow pathways (self-registration dual OTP, manual UPI pay modal, verification dashboard, and FCFS waitlist expiry banners).
- Detail database schema design and backend service orchestration (Spring Boot, Keycloak, Kong API Gateway, Supabase).
- Plan the synchronization strategy between project documentation files (BRD, PRD, HLD, LLD, User Flow Docs) and active schemas.

**Non-Goals:**
- Writing actual React component code files.
- Provisioning Keycloak realms or Twilio/Resend services in this change.
- Integrating Razorpay API (Phase 2).

## Decisions

### 1. Unified 3-Layer Frontend Architecture (React v19 + React Router v7)
To keep the codebase maintainable, the frontend directory layout enforces a strict separation of concerns:
- **API Layer (`src/api/`)**: Pure Axios or Fetch functions wrapping HTTP requests to the Kong gateway (e.g., event fetching, registration submissions, upload calls). No component-level side-effects or state updates.
- **State/Data Layer (`src/stores/`)**: Zustand store definitions that hold global states (JWT, user profile, notifications, events list). Handles asynchronous data fetching logic, error parsing, and local formatting.
- **View Layer (`src/components/`, `src/pages/`)**: Pure UI rendering using HeroUI v3 components. Subscribes to Zustand store states and dispatches user actions.

### 2. Design System and Styling Tokens (Tailwind CSS v4 + HeroUI v3)
- **Primary Color Accent**: Maroon Red (`#a80000`) mapped to Tailwind's `primary` color utility.
- **Dark Mode Palette**: Deep charcoal background (`#121212`) and slate/gray surfaces (`#1e1e1e`), avoiding generic pure-black pages.
- **Typography**: Import Google Font "Outfit" or "Inter" as the default font family via Tailwind config.
- **Accessibility (WCAG)**: Use HeroUI's native React Aria-powered controls for tab controls, focus rings, keyboard navigability, and screen-reader tags.

### 3. Integrated Tech Stack Orchestration
- **Authentication**: Keycloak Authorization Code Flow + PKCE. Front-end intercepts unauthorized requests, redirects to Keycloak, retrieves the authorization code, exchanges it for JWT via the Kong Gateway `/auth/` path, and saves the token in memory/Zustand store.
- **User Profile Synchronization**: Upon first successful login, the frontend presents the token. The backend intercepts, extracts Keycloak profile attributes (ID, Email, Name, Reg No, Department, Role), and writes them to the local `user_profiles` PostgreSQL table.
- **Concurrency Control**: Use Postgres row-level locking (`SELECT ... FOR UPDATE` inside Spring Boot JPA transactional methods) during capacity allocation updates on the `events` table to prevent ticket overbooking.
- **AWS S3 File Uploads**: Manual payment screenshots are sent by the React UI as `multipart/form-data` to `/api/v1/registrations/upload` on Spring Boot. The backend uploads to AWS S3, returns the secure S3 URL, which the frontend saves in the registration payload.

### 4. Database Schema Design (Supabase Cloud PostgreSQL)
To enable clean joins, the following tables are defined:
- **`user_profiles`**: `id` (UUID), `name`, `email`, `phone_number`, `registration_number`, `department`, `role` (Enum), `created_at`.
- **`events`**: `id` (UUID), `title`, `description`, `banner_url`, `start_time`, `end_time`, `capacity`, `price`, `status` (Enum), `created_by` (UUID), `department`, `created_at`.
- **`event_collaborators`**: `event_id` (UUID), `user_id` (UUID), primary key(`event_id`, `user_id`).
- **`registrations`**: `id` (UUID), `event_id` (UUID), `user_id` (UUID), `status` (Enum: WAITING_LIST, PENDING_PAYMENT, PENDING_PAYMENT_VERIFICATION, CONFIRMED, REJECTED, EXPIRED), `upi_transaction_id` (VARCHAR(12)), `screenshot_url` (VARCHAR), `promotion_timestamp` (TIMESTAMP), `created_at`.
- **`payment_audit_logs`**: `id` (UUID), `registration_id` (UUID), `action` (Enum: UPLOAD, APPROVE, REJECT), `performed_by` (UUID), `rejection_reason` (TEXT), `timestamp`.

### 5. UI/UX Flow Visualizations
The new `docs/user-flow-docs.md` will contain step-by-step UI wireflows using Mermaid diagrams for the following key user journeys:
1. **Self-Registration Sequential Verification UI**: Steps to enter registration details -> screen requesting Email OTP (with timer & resend link) -> screen requesting Phone OTP -> dashboard redirect.
2. **Paid Event UPI Pay Modal**: QR container, transaction text input field (with dynamic regex helper), file drop zone with image thumbnail/size indicator, and submit buttons.
3. **Split-Screen Verification Console**: Left details grid with "Copy" shortcuts; right side image frame with drag-and-pan, zoom level, and rotate tools.
4. **Dashboard Deadline Banner**: Timer banner anchored at the top of the student dashboard showing exact hours/minutes/seconds left.

## Risks / Trade-offs

- **Risk**: Local countdown timers in React might drift or become out of sync with backend Server Time.
  - **Mitigation**: Fetch server current timestamp on load and calculate the absolute offset, updating the local countdown logic based on the relative offset rather than native browser time.
- **Risk**: Storing JWT in Zustand in-memory state will be lost on page reload.
  - **Mitigation**: Implement Keycloak silent-refresh or token checks on reload to prevent users from being logged out unexpectedly.
