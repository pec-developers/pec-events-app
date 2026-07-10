# PEC Events Web App

A Progressive Web App (PWA) for managing and notifying events at **Prathyusha Engineering College (PEC)**. It facilitates event registration for students and event coordination and publication for faculty and student coordinators.

---

## 🚀 Project Overview

The PEC Events Notification/Management Web App is designed to streamline how college events (both free and paid) are published, discovered, registered for, and audited.

The project is structured into two main phases to ensure a fast, robust rollout followed by a transition to a highly scalable enterprise architecture:
- **Version 1 (V1 - Lightweight Stack)**: Focuses on quick deployment using a simplified architecture. Direct client-server endpoints, Supabase Auth/Database, and manual payment verification (UPI screenshots + transaction IDs).
- **Version 2 (V2 - Enterprise Stack)**: Scales the platform to handle up to 6,000 concurrent devices using Kubernetes (AWS EKS), Kong API Gateway, Keycloak, Redis caching, and RabbitMQ messaging.

---

## 🛠️ Technology Stack & Architecture

### Phase 1 (V1): Lightweight Stack (Current Scope)
- **Frontend SPA**: React (v19), Zustand state management, TypeScript, React Router v7.
  - **Styling**: HeroUI v3 (formerly NextUI) with Tailwind CSS v4 and React Aria (WCAG compliant).
  - **Aesthetics**: Sleek academic-tech theme utilizing maroon red accents matching PEC's institutional brand (primary: `#a80000`), micro-animations, and skeleton loaders.
  - **3-Tier Architecture**:
    - **View Layer ([app/frontend/src/components/](app/frontend/src/components/), [app/frontend/src/pages/](app/frontend/src/pages/))**: Visual UI representation. No raw API imports or business logic.
    - **Data & State Layer ([app/frontend/src/hooks/](app/frontend/src/hooks/), [app/frontend/src/stores/](app/frontend/src/stores/))**: Local state, custom hooks, global Zustand stores, and static configs.
    - **API & Service Layer ([app/frontend/src/services/](app/frontend/src/services/), [app/frontend/src/api/](app/frontend/src/api/))**: API client configuration (Axios) and orchestration (Strategy registry patterns).
- **Backend & REST API**: Spring Boot.
  - **Architecture**: Decoupled service layers implementing the **Ports & Adapters (Hexagonal)** pattern.
    - Service contracts are defined in `service/port/` and implemented directly under `service/`.
    - Separated model subpackages: `model/entity/` (JPA models), `model/dto/` (API transfer objects), `model/enums/`, and `model/converter/`.
    - Segregated controller packages: `controller/admin/`, `controller/student/` or `controller/participant/`, `controller/coordinator/`, `controller/shared/`, and global exception handler in `controller/advice/`.
  - **JWT Authorization**: Custom `SupabaseJwtFilter` intercepting and verifying Supabase-issued JWT signatures symmetrically (via shared client secret) or asymmetrically (via Supabase JWKS endpoint).
  - **Declarative Security**: Spring AOP aspect interceptor `@RequiresRole` resolves role requirements at class/method level and checks request context against the local database using a decoupled `RoleService`.
- **Identity & Authentication**: Supabase Auth (GoTrue).
  - **User Registration Policy**: Direct sign-ups with any email domain (no domain restriction in V1, relying on manual validation).
  - **SMS/OTP Delivery**: Custom Deno-based Send SMS Auth Hook ([deployments/supabase/functions/send-sms/index.ts](deployments/supabase/functions/send-sms/index.ts)) that intercepts Supabase OTP dispatches and forwards them to the **MSG91 v5 OTP API** (removing the leading `+` for TRAI DLT compliance), replacing native Twilio configuration.
  - **Email Delivery**: Outgoing password resets and OTP verification emails routed via Supabase-configured SMTP (e.g., Resend).
  - **User Synchronization**: Basic user profile attributes (name, email, role, department) are written to the local PostgreSQL database on first successful login.
- **Database & Storage**:
  - **Database**: Managed Supabase Cloud (PostgreSQL).
  - **Ticket Overbooking Control**: Row-level locking (`SELECT ... FOR UPDATE` inside Spring Boot transactions) to handle peak concurrent registrations without overselling slots.
  - **File Storage**: AWS S3 bucket (or local MinIO emulator) for user profile photos, event assets (banners/posters), and manual payment screenshots.
- **Local Tooling & Mocking**:
  - **Local PostgreSQL Container** running on port `54322`.
  - **S3 Storage Emulator (MinIO)** running on port `9000` (`AWS_S3_ENDPOINT`).
  - **Email Catcher (Inbucket)** running on port `54324` to capture OTP and magic link emails offline.
- **Notifications & Caching**: Synchronous/Asynchronous handling using standard Spring `@Async` threads. ConcurrentMapCacheManager for basic in-memory caching.
- **Infrastructure**: Standalone VM / container hosting (bypassing EKS, Keycloak, and Kong in V1).

### Phase 2 (V2): Enterprise Stack (Future Scope)
- **Identity & Gateway**: Keycloak (IdP) + Kong API Gateway.
  - **Auth Flow**: React SPA authenticates directly against Keycloak via Authorization Code Flow + PKCE. Front-end sends JWT to Kong, which proxies to Spring Boot backend services.
  - **Keycloak OTP Flow**: Sequential dual-channel verification (Email OTP via Resend.com, followed by SMS OTP via MSG91 Custom SPI) required during self-registration.
  - **User Sync**: Basic user profile details synchronized to local database on first login.
- **Caching & Messaging**:
  - **Redis Cache**: Deployed in EKS to cache event query listings.
  - **RabbitMQ Broker**: Deployed in EKS to asynchronously process push notification dispatches.
- **DevOps & Infrastructure**:
  - **Kubernetes (AWS EKS)**: Services deployed via Helm charts.
  - **CDNs & Routing**: CloudFront + Route 53 for static frontend hosting, asset delivery, and DNS.
  - **Infrastructure as Code (IaC)**: Terraform managing AWS resources (EKS, S3, CloudFront, Route 53) and Supabase settings.

---

## 👥 User Roles & Permissions

1. **Student / Participant**
   - Discover events, register for free and paid sessions.
   - Upload UPI payment screenshots and transaction IDs for manual payment registration verification.
   - Receive real-time push notifications (Web Push API with Service Workers).
2. **Student Coordinator**
   - Publish college events.
   - View, verify, and approve registration requests and payment screenshots.
3. **Faculty Coordinator**
   - Publish college events, edit event details.
   - Full authority to approve payment registrations, manage student coordinators, and audit transactions.
4. **System Admin**
   - Overall system parameters, Keycloak realm settings, user role mapping, audit logs, and infrastructure monitoring.

---

## 🧪 Testing & Quality Assurance

This project follows the **STLC (Software Testing Life Cycle)** with a strict **docs-first testing process**:
- **Test Scenarios**: Test specifications and test cases must be designed and documented prior to writing functional code (located in [testing_spec.md](docs/testing_spec.md)).
- **Testing Focus**: Concentrated on:
  - **Unit Testing**: Ensuring business logic functions correctly in isolation (Vitest on frontend; JUnit & Mockito on backend).
  - **Integration Testing**: Ensuring controllers, repositories, databases, and gateways integrate.

---

## 📂 Repository Structure

- `docs/` — Business and technical requirements:
  - [BRD (Business Requirements Document)](docs/brd.md)
  - [PRD (Product Requirements Document)](docs/prd.md)
  - [HLD (High-Level Design)](docs/hld.md)
  - [LLD (Low-Level Design)](docs/lld.md)
  - [User Flow Docs](docs/user-flow-docs.md)
  - [Testing Spec](docs/testing_spec.md)
- `app/frontend/` — React frontend SPA codebase.
- `app/backend/` — Spring Boot backend codebase.
- `deployments/` — Deployments and local dev infrastructure configuration:
  - `ansible/` — Configuration management scripts.
  - `supabase/` — Supabase migrations, Deno Edge functions (`send-sms`), and config.
  - `terraform/` — IaC configurations.
- `openspec/` — OpenSpec configuration and specs.

---

## 🛠️ Tooling & Workflow Integration

### 1. OpenSpec Change Management
This repository utilizes OpenSpec for spec-driven change management. Design proposals, requirements, and checklists are managed under the `openspec/` folder.

- **Propose a new change:**
  Scaffold a new design proposal and checklist:
  ```bash
  /opsx-propose "<change-name>"
  ```
- **Implement changes:**
  Start executing the checklist tasks:
  ```bash
  /opsx-apply
  ```
- **Sync delta specifications:**
  Synchronize completed specifications back to the main specifications folder:
  ```bash
  /opsx-sync
  ```
- **Archive completed change:**
  Finalize and clean up completed specs:
  ```bash
  /opsx-archive
  ```

### 2. Graphify Knowledge Graph
This project maintains a navigable codebase knowledge graph under `graphify-out/` to streamline architecture and concept research.

- **Query the codebase topology:**
  Search for specific components or functions:
  ```bash
  graphify query "<your-question>"
  ```
- **Find paths / relationships:**
  Trace connection paths between distinct files or components:
  ```bash
  graphify path "<Component-A>" "<Component-B>"
  ```
- **Explain a concept:**
  Get focused explanations of specific classes or modules:
  ```bash
  graphify explain "<concept>"
  ```
- **Update the graph:**
  Synchronize the graph after modifying files (run locally, AST-only extraction):
  ```bash
  graphify update .
  ```

---

## 📄 License

This project is licensed under the **[Apache License, Version 2.0](LICENSE)**.

Copyright 2025 **PEC Developers**

### Source File Header Requirement

Every new `.java` source file added to `app/backend/` **must** include the following Apache 2.0 license header as the very first lines of the file, before the `package` declaration:

```java
/*
 * Copyright 2025 PEC Developers
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
```

This applies to all files under `src/main/` and `src/test/`.