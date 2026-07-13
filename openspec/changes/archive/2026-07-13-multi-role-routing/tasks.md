## 1. Setup & Infrastructure

- [x] 1.1 Add database migrations under `supabase/migrations` to create the `departments` and `system_configurations` tables, seed default limits, and create the department role limit validation function/trigger.
- [x] 1.2 Add `springdoc-openapi-starter-webmvc-ui` dependency to the backend `pom.xml` to auto-generate Swagger specs on compile.
- [x] 1.3 Add a frontend script in `app/frontend/scripts/generate-api.js` using `@openapitools/openapi-generator-cli` to fetch backend OpenAPI specs and generate TypeScript client types and client services.
- [x] 1.4 Install `react-router` and `react-router-dom` (React Router v7) dependencies in `app/frontend/package.json`.

## 2. STLC Lifecycle: Test Design & Documentation First

- [x] 2.1 Create the backend test specifications under `docs/testing_spec.md` detailing the test scenarios for dynamic department limits validation, custom logins (registration number & email), department CRUD, and profile update locks.
- [x] 2.2 Create the frontend test scenarios for route guards, nested dashboards navigation, custom-field CSV exporter, department CRUD screens, and profile forms.
- [x] 2.3 Update the main repository documents (`docs/brd.md`, `docs/prd.md`, `docs/hld.md`, `docs/lld.md`) with the new department CRUD capability, dynamic limits, routing details, database structures, and Swagger generation workflows.

## 3. Backend API Implementation

- [x] 3.1 Create `SystemConfigKey` enum to track config key-value constraints and descriptions in code.
- [x] 3.2 Create system configurations entity, repository, and service interfaces/implementations.
- [x] 3.3 Create `AdminConfigController` under `controller/admin/` to allow CRUD operations on config settings by authenticated Admins.
- [x] 3.4 Create `Department` entity, repository, service interfaces/implementations, and `AdminDepartmentController` under `controller/admin/` to support CRUD on departments.
- [x] 3.5 Modify `AuthController` to support student/faculty registration number checks for corresponding roles, and email for Admin logins.
- [x] 3.6 Create `ProfileController` under `controller/shared/` to support profile updates, applying validation/locks on department, registration number, and role fields.
- [x] 3.7 Register endpoints in Swagger annotations to output complete OpenAPI documentation.

## 4. Frontend Router & Layer Implementation

- [x] 4.1 Setup nested layout route configurations inside `App.tsx` matching each role group.
- [x] 4.2 Set up `ProtectedRoute` and `PublicOnlyRoute` route guards.
- [x] 4.3 Configure and run the API generation script to create typescript clients, integrating them under the API & Service Layer.
- [x] 4.4 Build the profile editor component in the View layer using custom hooks in the Data & State layer to enforce read-only status on role/department.
- [x] 4.5 Build the department CRUD management screen and configuration settings editor on the Admin dashboard.
- [x] 4.6 Build the custom-field CSV exporter component on the coordinator dashboard, allowing dynamic selection of fields to export.

## 5. Verification & Testing

- [x] 5.1 Implement backend unit and integration tests (JUnit 5 + Mockito) verifying:
  - Dynamic limits validation in services and triggers.
  - Multi-credentials login flows.
  - Department CRUD operations and constraint validations.
  - Profile update field locks.
- [x] 5.2 Implement frontend unit tests (Vitest + MSW) verifying:
  - Role-based route guard redirects.
  - CSV export filtering logic.
  - Department CRUD UI workflows.
  - Theme switching synchronization.
