## Context

To support Prathyusha Engineering College's (PEC) PWA development and ensure full alignment of the engineering team, we are initializing a set of core documentation: BRD, PRD, HLD, and LLD under the `docs/` folder. This design document establishes the baseline architecture, schemas, and configurations that these files will specify, and outlines the plan to keep them fully synchronized with the codebase.

## Goals / Non-Goals

**Goals:**
- Plan the precise outline and contents of BRD, PRD, HLD, and LLD to cover the frontend, backend, infrastructure, database, and payment processing rules.
- Define a 3-layer architecture for the React frontend (API, Zustand state/formatting, and View layers).
- Specify the integration details of Spring Boot, Keycloak, Kong API Gateway, and PostgreSQL/Supabase.
- Lay out database schema details, S3 upload logic, and ticketing lock strategies.
- Mandate Mermaid diagrams for all flows, entities, and architectures.
- Ensure BRD, PRD, HLD, and LLD documents (with Mermaid diagrams) are planned in detail and kept fully synchronized.

**Non-Goals:**
- Designing Razorpay payment flows (V2 feature, V1 will focus on UPI screenshots).

## Decisions

### 1. Document Structure & Sync Rule
- **Decision:** Generate four separate files under `docs/`: `BRD.md`, `PRD.md`, `HLD.md`, `LLD.md`.
- **Rationale:** Separating documentation by abstraction level keeps files readable for different stakeholders (coordinators, product owners, architects, developers).

### 2. Frontend 3-Layer Design (to be detailed in HLD/LLD)
- **Decision:** Enforce the following layer division:
  1. **API Layer (`src/api/`):** Houses raw API client requests (e.g., fetch, axios) and HTTP header injections.
  2. **Data Layer (`src/stores/`):** Manages Zustand stores, formats/transforms raw server responses into frontend UI models, and maintains cache state.
  3. **View Layer (`src/components/`, `src/pages/`):** Renders UI using HeroUI v3, styled strictly with Tailwind CSS v4 on React 19, relying on React Aria for accessibility compliance.
- **Rationale:** Simplifies component code, promotes testability, and standardizes state management.

### 3. Component & Styling Library Setup
- **Decision:** Configure HeroUI v3 and Tailwind CSS v4 on React 19, setting the primary color theme accent to maroon red (`#a80000`) to match PEC's institutional brand.
- **Rationale:** HeroUI offers accessible (React Aria based) primitives with premium styles, and Tailwind CSS v4 provides fast build times and a modern styling engine.

### 4. Cross-System Backend Integration
- **Decision:** Detail the networking and security boundary where the React app communicates through Kong API Gateway. Keycloak sits behind Kong (`/auth/*`) to handle OAuth2 Auth Code flow with PKCE. The Spring Boot backend receives authorization context from Kong via forward-verified JWTs.
- **Rationale:** Exposes a unified endpoint, securing all backend endpoints behind a single entry point.

### 5. Database Schema & Ticket Locks
- **Decision:** Define tables for:
  - `users`: ID, name, email, department, role (synced from Keycloak on login).
  - `events`: ID, title, description, coordinator_id, price, capacity, remaining_slots, qr_code_url, etc.
  - `registrations`: ID, student_id, event_id, status, payment_id.
  - `payment_audit_logs`: ID, registration_id, transaction_id, status (pending/verified/failed), screenshot_s3_url, verified_by, verified_at.
  
  Prevent overselling via `SELECT remaining_slots, capacity FROM events WHERE id = ? FOR UPDATE` row-level locks in Spring Boot transactional registration paths.
- **Rationale:** Guarantees absolute safety under concurrent registration bursts.

### 6. Media Storage Workflows
- **Decision:** AWS S3 bucket provisioned via Terraform. Frontend uploads screenshots to the Spring Boot REST endpoint. Spring Boot processes the file, writes it to S3, and persists the resulting S3 URL in Supabase.
- **Rationale:** Avoids heavy file storage inside the transaction database and maintains standard cloud architecture.

## Risks / Trade-offs

- **[Risk] Out of Sync Documentation** → **[Mitigation]** The documentation must be audited against OpenSpec config changes during PR reviews.
- **[Risk] Complex keycloak integration debugging** → **[Mitigation]** Fully specify Keycloak scopes and roles in the HLD.
