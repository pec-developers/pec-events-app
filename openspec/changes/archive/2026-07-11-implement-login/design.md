## Context

The PEC Events App requires a secure login and user management system. In Phase 1 (V1), authentication is based on username/password via a server-side proxy to Supabase Auth (GoTrue API), and OTP is reserved exclusively for password reset/recovery operations. Upon successful login, user profiles are synchronized to the local PostgreSQL database, and authorization is enforced via declarative `@RequiresRole` checks. In Phase 2 (V2), the system will migrate to Keycloak (IdP) and Kong API Gateway.

## Goals / Non-Goals

**Goals:**
- Implement a server-side authentication proxy to Supabase Auth using email/password login.
- Provide a role-based status check endpoint (`GET /api/auth/me`) returning profile and roles to verify active sessions.
- Provide user self-registration API checking against pre-seeded enrollment list data.
- Integrate single-use OTP dispatches solely for password recovery and reset options.
- Create a custom `SupabaseJwtFilter` to decode and validate JWT signatures.
- Build the 3-tier architecture in the React frontend (API, Data & State, View layers).
- Establish the database schema for users, roles, events, registrations, and payment audit logs.
- Design database concurrency control (row-level locking) for ticket registration.
- Detail the future V2 migration path with Keycloak and Kong Gateway.

**Non-Goals:**
- Integrating live payment gateway APIs (manual UPI screenshot uploads will be used for V1).
- Deploying the full V2 infrastructure (EKS, Keycloak, Kong) during the current V1 implementation phase.

## Decisions

### Decision 1: React 19 Frontend 3-Tier Architecture
We will organize the React 19 frontend into three distinct layers to ensure high testability (using Vitest and MSW) and separation of concerns:
1. **View Layer (`src/components/`, `src/pages/`)**: UI components configured with HeroUI v3 and Tailwind CSS v4. No direct Axios or business logic.
2. **Data & State Layer (`src/hooks/`, `src/stores/`)**: Custom state hooks and Zustand stores for session state persistence (`authToken`).
3. **API & Service Layer (`src/api/`, `src/services/`)**: Raw Axios REST endpoints and response/error mapping logic.

### Decision 2: Authentication Proxy & Supabase / Keycloak / Kong Integration
Authentication will transition from a V1 Supabase-based proxy to a V2 Keycloak-based IdP:
- **V1 (Current)**:
  - React frontend sends registration (`POST /api/auth/register`) and login (`POST /api/auth/login`) requests containing password and credentials to Spring Boot backend.
  - Spring Boot backend validates self-registration parameters against pre-seeded enrollments. It then interacts with Supabase Auth to register or authenticate (via GoTrue password grant).
  - The status check (`GET /api/auth/me`) intercepts requests via `SupabaseJwtFilter`, retrieves the authenticated user details from the database `users` table based on the JWT `sub` ID, and returns the profile along with their database-assigned role.
  - Password resets are requested via `/api/auth/password/forgot` and completed via `/api/auth/password/reset` using an OTP (sent via email/SMTP or SMS).
  - On successful login, the backend issues an HTTP-only cookie (`authToken`) containing the JWT.
- **V2 (Future)**:
  - Keycloak is introduced as the Identity Provider, and Kong acts as the API Gateway.
  - React frontend authenticates directly against Keycloak via Authorization Code Flow + PKCE.
  - Kong Gateway intercepts incoming requests, validates Keycloak JWTs, and forwards request context to the backend.

### Decision 3: Database Schema Design
We will introduce the following tables in PostgreSQL to track users, events, and registrations:
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions TEXT[]
);

CREATE TABLE users (
    id UUID PRIMARY KEY, -- Matches Supabase auth.users.id
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role_id INT REFERENCES roles(id),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    max_slots INT NOT NULL,
    filled_slots INT DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0.00,
    coordinator_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT', -- PENDING_PAYMENT, VERIFYING, APPROVED, CANCELLED
    transaction_id VARCHAR(100), -- For manual UPI payment verification
    payment_screenshot_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_audit_logs (
    id SERIAL PRIMARY KEY,
    registration_id INT REFERENCES registrations(id),
    verified_by UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- APPROVED, REJECTED
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Decision 4: Concurrency & Database Row-Level Locking
To prevent ticket overbooking under high traffic (1,000 - 6,000 concurrent devices):
- Booking operations MUST check slot availability inside a database transaction.
- We will execute a pessimistic write lock: `SELECT max_slots, filled_slots FROM events WHERE id = ? FOR UPDATE`.
- If `filled_slots < max_slots`, the backend increments `filled_slots` and saves the registration. Otherwise, the transaction is rolled back, returning an error payload.

### Decision 5: File Storage & S3 Upload Workflows
Manual payment verification requires students to upload transaction screenshots:
- **V1 (Current)**:
  - Frontend requests a pre-signed S3 upload URL from Spring Boot.
  - Frontend uploads the file directly to the S3 bucket (or local MinIO emulator at port 9000).
  - S3 path template: `payments/{eventId}/{userId}_{timestamp}.png`.
  - Frontend then sends the file URL and `transaction_id` to Spring Boot to create a registration.

### Decision 6: Documentation Synchronization
The following documentation files under `docs/` MUST be updated and kept synchronized with these designs using Mermaid diagrams:
- [BRD](file:///c:/Users/grand/codespace/pec-events-app/docs/brd.md)
- [PRD](file:///c:/Users/grand/codespace/pec-events-app/docs/prd.md)
- [HLD](file:///c:/Users/grand/codespace/pec-events-app/docs/hld.md)
- [LLD](file:///c:/Users/grand/codespace/pec-events-app/docs/lld.md)

## Risks / Trade-offs

- **[Risk: S3 Upload Orphans]** → User uploads a screenshot but fails to submit the registration form.
  - *Mitigation*: Run a background scheduler/cron job that compares S3 objects with database `payment_screenshot_url` and purges orphaned objects after 24 hours.
- **[Risk: Database lock contention]** → High contention on popular events causing database timeouts.
  - *Mitigation*: Set a lock wait timeout of 3 seconds on the `FOR UPDATE` query, falling back gracefully to a 429 Too Many Requests response if lock acquisition fails.
