## Context

Prathyusha Engineering College (PEC) requires a Progressive Web App (PWA) to serve as a notification and registration portal for campus events. Due to anticipated high traffic peaks of up to 6,000 concurrent devices during registration periods, the architecture must separate frontend routing/state from backend workloads, and protect resources against overselling. This document designs the initial foundation including local folder schemas, authentication routing, database isolation, and manual payment storage.

## Goals / Non-Goals

**Goals:**
- **Frontend Architecture:** Enforce a strict three-layer architecture (API Layer -> Zustand Data Layer -> HeroUI View Layer) using React 19, Tailwind CSS v4, and React Router v7.
- **Access Control:** Integrate Keycloak mapped under Kong Gateway to enforce boundaries across 5 user roles (Admin -> SPOC -> Coordinators -> Students).
- **Data Integrity & Queue Management:** Enforce FCFS waiting list registration and prevent event overselling under high concurrency using PostgreSQL row-level locks.
- **Manual Payments (V1):** Facilitate manual UPI verification by displaying QR codes to confirmed or promoted waiting list students, allowing them to upload transaction confirmation screenshots to S3 and Supabase.
- **Progressive Delivery:** Establish Web Push notifications using service worker subscriptions and VAPID key pairs.
- **Deployments:** Provide Helm charts and Terraform configurations targeting separate `dev` and `prod` environments on AWS.
- **Documentation:** Maintain BRD, PRD, HLD, LLD, and STLC Specs under `docs/` folder kept fully synchronized.

**Non-Goals:**
- Direct payment gateway API integration (Razorpay is reserved for V2).
- Advanced analytics dashboards for event coordinators (reserved for V2).
- Pre-registration validation against external college directories (Keycloak logins are pre-created by the Admin).

## Decisions

### 1. Frontend Layer Separation & Component Library
- **Decision:** Separate the code into `src/api/` (native fetch helper), `src/stores/` (Zustand state management), and `src/components/` & `src/pages/` (HeroUI view rendering).
- **Rationale:** Separating state and API logic from views makes testing easier and components simpler. Using native `fetch` reduces external bundle dependencies, and HeroUI v3 with Tailwind CSS v4 provides rich, premium styling natively.

### 2. Keycloak Placement Under Kong API Gateway
- **Decision:** Route all Keycloak traffic through the Kong Gateway (mapping paths like `/auth/*` to Keycloak).
- **Rationale:** Exposes a single public IP/domain, allowing Kong to handle TLS termination, CORS headers, and rate-limiting uniformly for both Keycloak and backend REST APIs.

### 3. Supabase Cloud PostgreSQL with Row-Level Locking
- **Decision:** Deploy database schemas to managed Supabase Cloud, executing `SELECT ... FOR UPDATE` inside Spring Boot transactional registration and dropout flows.
- **Rationale:** Supabase Cloud removes connection management and Postgres maintenance overhead. Row-level locks prevent overselling tickets and guarantee FCFS order when multiple requests register or cancel concurrently.

### 4. Waiting List Payment Deferral (V1)
- **Decision:** For paid events, do not prompt students for payment screenshot uploads when registering for a full event. They are placed in `WAITING_LIST` state. Upon confirmed dropout promotion, their status updates to `PENDING_PAYMENT` and they are prompted to pay and upload screenshot.
- **Rationale:** Reduces manual verification overhead and refunds by ensuring students only pay when they have active reservations.

### 5. Creator-Collaborator Event Permissions
- **Decision:** Only Faculty Coordinators can create and post events. Both Faculty Coordinators and Student Coordinators can edit events only if they are added as collaborators to the event in the `event_coordinators` mapping.
- **Rationale:** Guarantees department faculty oversight over newly posted events while enabling collaborative student/faculty coordinator management of assigned events.

### 6. AWS S3 Uploads for Manual Verification
- **Decision:** Provision an AWS S3 bucket via Terraform. Have the Spring Boot backend receive screenshot uploads, put them in S3, and save the public S3 URL in Supabase.
- **Rationale:** Prevents database bloat from binary Base64 screenshots and isolates static uploads from transactional data.

### 7. Web Push Notification Architecture
- **Decision:** Implement native Web Push API using Service Workers and VAPID key signing.
- **Rationale:** Fits PWA criteria, allowing OS-level alerts when the browser is closed, without needing third-party FCM dependencies.

### 8. Helm and Terraform Environment Split
- **Decision:** Structure the infrastructure using Terraform for AWS infrastructure and Helm charts for K8s service deployments, separating values for `dev` and `prod` environments.
- **Rationale:** Keeps configuration values isolated, making deployment to EKS reproducible and safe.

## Risks / Trade-offs

- **[Risk] High Database Connection Count under Concurrency Peak** → **[Mitigation]** Use Supabase PgBouncer/connection pool configurations, and restrict maximum EKS pod horizontal scaling to protect the database connection limits.
- **[Risk] Browser Push Permission Blockages** → **[Mitigation]** Fall back to a local in-app notification center that polls or pulls alerts on initial login.
- **[Risk] Manual UPI Verification Bottleneck** → **[Mitigation]** Enlist both Faculty and Student Coordinators assigned as collaborators to share payment verification workloads.

