# PEC Events Web App

A Progressive Web App (PWA) for managing and notifying events at **Prathyusha Engineering College (PEC)**. It facilitates event registration for students and event coordination and publication for faculty/student coordinators.

---

## 🚀 Project Overview

The PEC Events Notification/Management Web App is designed to streamline how college events (both free and paid) are published, discovered, registered for, and audited. 
- **Application Type:** Progressive Web App (PWA) with push notifications.
- **Estimated Scale:** Designed to handle peak concurrency of 1,000 - 6,000 concurrent devices.
- **Current Phase (V1):** Manual UPI QR code payment and screenshot uploads.
- **Future Phase (V2):** Razorpay API gateway integration and analytical coordinator dashboards.

---

## 🛠️ Technology Stack & Architecture

### Frontend
- **Framework & Language:** React (v19), TypeScript.
- **Component Library:** HeroUI v3 (formerly NextUI) with Tailwind CSS v4 and React Aria (WCAG compliant).
- **State Management:** Zustand.
- **Routing:** React Router v7.
- **Architectural Layers:**
  - **API Layer (`src/api/`):** Directly manages network interaction and backend payloads.
  - **Data Layer (`src/stores/`):** Manages local state formatting, business logic, and caching using Zustand.
  - **View Layer (`src/components/` & `src/pages/`):** Renders accessible, responsive UI pages.

### Backend & API
- **Framework:** Spring Boot.
- **API Gateway:** Kong Gateway (exposes Keycloak routes under `/auth/*` and proxy requests to Spring Boot services).
- **Identity Provider:** Keycloak (OAuth2 Authorization Code Flow + PKCE).
- **User Sync:** Basic profile details (names, emails, roles, department) are synchronized into the PostgreSQL database on first successful login to enable fast SQL joins.

### Database & Storage
- **Database:** Managed Supabase Cloud (PostgreSQL).
- **Concurrency Control:** Database row-level locking (`SELECT ... FOR UPDATE` inside Spring Boot transactions) to prevent overbooking of event slots.
- **File Storage:** AWS S3 (for manual payment screenshot uploads) provisioned via Terraform, managed directly by the backend.

### DevOps & Infrastructure
- **Infrastructure as Code (IaC):** Terraform managing AWS resources (EKS, S3, CloudFront, Route 53) and Supabase settings.
- **Containerization & Ingress:** Kubernetes (AWS EKS) with Helm charts managed inside the repository for service deployment.
- **CDNs & DNS:** AWS S3 + CloudFront + Route 53 for frontend static hosting and DNS.
- **Pipelines:** GitHub Actions for building, testing, containerizing, Helm packaging, and deploying to target environments.
- **Environments:** `dev` (development) and `prod` (production).

---

## 👥 User Roles & Permissions

1. **Student / Participant**
   - Discover events, register for free and paid sessions.
   - Upload UPI payment screenshots and transaction IDs for manual payment registration verification.
   - Receive real-time push notifications.
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
- **Test Scenarios:** Test specifications and test cases must be designed and documented prior to writing functional code.
- **Testing Focus:** Concentrated on:
  - **Unit Testing:** Ensuring business logic functions correctly in isolation (Vitest on frontend; JUnit & Mockito on backend).
  - **Integration Testing:** Ensuring controllers, repositories, databases, and gateways integrate seamlessly (React Testing Library on frontend; Spring Boot Test on backend).

---

## 📂 Repository Structure

- `docs/` — Business and technical requirements (BRD, PRD, HLD, LLD).
- `frontend/` — React frontend codebase (API, stores, components).
- `backend/` — Spring Boot backend codebase. (To be initialized)
- `infra/` — Terraform configurations and Helm charts. (To be initialized)
- `openspec/` — OpenSpec configuration and specs.