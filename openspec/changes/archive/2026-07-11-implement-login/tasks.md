## 1. Documentation & Test Design (STLC Docs-First)

- [x] 1.1 Create and synchronize the Business Requirements Document (BRD) at docs/brd.md detailing user roles, UPI validations, and V1/V2 phasing
- [x] 1.2 Create and synchronize the Product Requirements Document (PRD) at docs/prd.md with login user flows and UI requirements
- [x] 1.3 Create and synchronize the High-Level Design (HLD) at docs/hld.md including architecture diagrams for V1 proxy and V2 Keycloak/Kong
- [x] 1.4 Create and synchronize the Low-Level Design (LLD) at docs/lld.md detailing the database schemas and REST API endpoint contract details
- [x] 1.5 Write test case specifications and design scenarios for all user flows before implementing functional code

## 2. Environment & Infrastructure Setup

- [x] 2.1 Set up local Supabase DB migration files for tables: roles, users, events, registrations, and payment_audit_logs
- [x] 2.2 Define Helm charts for deployment configurations mapping to V2 staging and production releases
- [x] 2.3 Set up local MinIO S3 emulator bucket configuration and local Inbucket SMTP catcher options in application.yaml

## 3. Backend API Implementation (Ports & Adapters)

- [x] 3.1 Create JPA database entity and repository models for roles, users, events, registrations, and payment_audit_logs under model/entity/ and repository/
- [x] 3.2 Add DTO request/response payloads for authentication and registration inside model/dto/
- [x] 3.3 Set up SupabaseProperties and configure WebClient to proxy requests to Supabase GoTrue Auth API
- [x] 3.4 Implement AuthServicePort interface and AuthService class for email/password login, register, forgot/reset password, and active status check
- [x] 3.5 Build custom SupabaseJwtFilter to decode and symmetrically validate JWT signatures, setting the security context
- [x] 3.6 Implement user synchronization logic to save/sync profile details (email, name, role, department) on first login
- [x] 3.7 Define the custom @RequiresRole annotation and implement RoleCheckAspect to intercept and restrict access based on roles
- [x] 3.8 Add pessimistic write lock (SELECT ... FOR UPDATE) inside booking transactions to control ticket overbooking concurrency
- [x] 3.9 Create the GET /api/auth/me controller endpoint returning logged-in user profile, role, and department from the local database

## 4. Frontend 3-Tier Architecture & View Implementation

- [x] 4.1 Setup API layer client for auth endpoints under src/api/ using Axios
- [x] 4.2 Develop local Zustand auth stores and custom hooks in src/stores/ and src/hooks/ to manage session token and user profile
- [x] 4.3 Configure HeroUI v3 and Tailwind CSS v4 to establish maroon color (#a80000) primary accents, academic-tech typography, and themes
- [x] 4.4 Build View components for Login and Register pages using HeroUI elements and Gravity UI Icons
- [x] 4.5 Implement protected route guards using React Router v7 to restrict page navigation based on user roles
- [x] 4.6 Implement auto-login session check on React client bootstrap by invoking GET /api/auth/me

## 5. Verification & Testing

- [x] 5.1 Create MSW mock service worker server handlers in src/api/mocks/ for authentication endpoints
- [x] 5.2 Implement Vitest unit and integration tests under src/**/__tests__/ for frontend custom hooks, stores, and components
- [x] 5.3 Write JUnit 5 and Mockito controller tests using WebMvcTest/MockMvc to verify response payloads and role authorization aspect behavior
- [x] 5.4 Write backend integration tests for pessimistic locking concurrent transactions, checking slot capacity limits
