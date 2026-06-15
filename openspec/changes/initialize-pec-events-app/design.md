## Context

Prathyusha Engineering College (PEC) requires a Progressive Web App (PWA) to serve as a notification and registration portal for campus events. Due to anticipated high traffic peaks of up to 6,000 concurrent devices during registration periods, the architecture must separate frontend routing/state from backend workloads, and protect resources against overselling. This document designs the initial foundation including local folder schemas, authentication routing, database isolation, and manual payment storage.

## Goals / Non-Goals

**Goals:**
- **Frontend Architecture:** Enforce a strict three-layer architecture (API Layer -> Zustand Data Layer -> HeroUI View Layer) using React 19, Tailwind CSS v4, and React Router v7.
- **Access Control:** Integrate Keycloak mapped under Kong Gateway to enforce boundaries across 6 user roles (Admin -> SPOC -> Coordinators -> regular Student and Faculty).
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

### 3. Keycloak Self-Registration & Keycloak OTP Password Recovery
- **Decision:** Enable user self-registration inside the app. The backend verifies registration details against a pre-seeded `eligible_enrollments` database (Name, Department, and Role are auto-populated from it). In case of a forgot password, Keycloak handles password recovery and OTP verification directly. It dispatches reset link emails via **Resend.com** SMTP relay and sends phone verification OTPs via **Twilio** (using a custom SMS authenticator SPI jar deployed to Keycloak).
- **Rationale:** Ensures only authorized students and faculty can register. Direct Keycloak dispatch removes OTP validation/generation responsibilities from Spring Boot backend APIs and centralizes user credential management within the IAM layer.

### 4. Supabase Cloud PostgreSQL with Row-Level Locking
- **Decision:** Deploy database schemas to managed Supabase Cloud, executing `SELECT ... FOR UPDATE` inside Spring Boot transactional registration and dropout flows.
- **Rationale:** Supabase Cloud removes connection management and Postgres maintenance overhead. Row-level locks prevent overselling tickets and guarantee FCFS order when multiple requests register or cancel concurrently.

### 5. Waiting List Payment Deferral, Expiry, & Re-upload (V1)
- **Decision:** For paid events, do not prompt students for payment screenshot uploads when registering for a full event. They are placed in the `WAITING_LIST` state. Upon promotion, they have a **24-hour expiry window** to upload payment screenshots. If their payment is rejected by a coordinator, they are transitioned to `PAYMENT_REJECTED` and given a **12-hour grace period** to re-upload valid details before their reservation is cancelled/expired and released to the next student.
- **Rationale:** Minimizes refund transaction overheads while ensuring waiting list slots do not remain blocked indefinitely. Allowing re-uploads prevents students from immediately losing their slot due to minor verification errors.

### 6. Creator-Collaborator Event & Collaborator Management Permissions
- **Decision:** Only Faculty Coordinators can create and post events. Both Faculty and Student Coordinators can modify event details when assigned as collaborators on the event. However, managing collaborators (adding or removing coordinators from an event) is strictly restricted to the original event creator (Faculty Coordinator) and the department SPOC. Student Coordinators are blocked from managing collaborators.
- **Rationale:** Guarantees department faculty oversight over newly posted events and maintains clear boundaries of administrative control, while enabling student/faculty collaborators to assist with event edits and registrations.

### 7. AWS S3 Uploads for Manual Verification
- **Decision:** Provision an AWS S3 bucket via Terraform. Have the Spring Boot backend receive screenshot uploads, put them in S3, and save the public S3 URL in Supabase.
- **Rationale:** Prevents database bloat from binary Base64 screenshots and isolates static uploads from transactional data.

### 8. Web Push Notification Architecture
- **Decision:** Implement native Web Push API using Service Workers and VAPID key signing.
- **Rationale:** Fits PWA criteria, allowing OS-level alerts when the browser is closed, without needing third-party FCM dependencies.

### 9. Helm and Terraform Environment Split
- **Decision:** Structure the infrastructure using Terraform for AWS infrastructure and Helm charts for K8s service deployments, separating values for `dev` and `prod` environments.
- **Rationale:** Keeps configuration values isolated, making deployment to EKS reproducible and safe.

### 10. RabbitMQ Asynchronous Notification Queuing
- **Decision:** Deploy RabbitMQ inside the EKS cluster. Transition all notification triggers (event creation, waiting list promotion, payment rejections) to publish lightweight event messages to a RabbitMQ exchange, which are consumed asynchronously by worker processes to send push notifications or external alerts.
- **Rationale:** Prevents slow downstream I/O requests (like browser push updates or SMTP dispatches) from holding transactional db connections, mitigating bottleneck risks under concurrent load.

### 11. Redis Caching for Event Listings
- **Decision:** Deploy a Redis caching layer in EKS and cache event listing results (`events::list`) and specific event detail lookups. Invalidate the cache upon any write actions (creating, updating events, or changing registration booking numbers).
- **Rationale:** Mitigates the risk of database read exhaustion when thousands of students concurrently query event listings.

## Risks / Trade-offs

- **[Risk] High Database Connection Count under Concurrency Peak** → **[Mitigation]** Use Supabase PgBouncer/connection pool configurations, and restrict maximum EKS pod horizontal scaling to protect the database connection limits.
- **[Risk] Browser Push Permission Blockages** → **[Mitigation]** Fall back to a local in-app notification center that polls or pulls alerts on initial login.
- **[Risk] Manual UPI Verification Bottleneck** → **[Mitigation]** Enlist both Faculty and Student Coordinators assigned as collaborators to share payment verification workloads.

