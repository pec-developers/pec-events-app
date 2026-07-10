---
trigger: always_on
description: Enforce the Backend Architecture standards (Ports & Adapters, AOP Role-Based Access Control, Profile-driven Configuration) in app/backend.
---

## backend-architecture

All backend code in `app/backend` must adhere strictly to the following architectural design, package conventions, security protocols, and configuration strategies.

### 1. Architectural Pattern: Decoupled Service Layers (Ports & Adapters)
To ensure isolation and testability of domain logic:
- **Port Interfaces**: Define service contracts in `service/port/` (e.g., `StudentServicePort.java`).
- **Implementations**: Place concrete implementations directly under `service/` (e.g., `StudentService.java`).
- **Separation of Models**:
  - `model/entity/` contains database persistent entity models mapped with JPA/Hibernate.
  - `model/dto/` contains Data Transfer Objects (DTOs) for request/response payloads. Keep entities isolated from controllers.
  - `model/enums/` contains domain-specific enumerations (e.g., `PaymentStatus`).
  - `model/converter/` contains AttributeConverters to deserialize/serialize custom types.

### 2. Controller Segregation
Controllers are structured cleanly into subpackages based on role boundaries or shared usage:
- `controller/admin/`: Admin control endpoints.
- `controller/student/` or `controller/participant/`: Student/Participant endpoints.
- `controller/coordinator/` (Faculty or Student Coordinators): Management and verification endpoints.
- `controller/shared/`: Authentication, health checks, or public shared endpoints.
- `controller/advice/`: Contains the global exception handler (e.g., `GlobalExceptionHandler.java`) to intercept and standardize HTTP error payloads.

### 3. Declarative Role-Based Access Control (AOP Aspect)
Secure REST endpoints using custom declarative annotations rather than hardcoded security checks:
- **Annotation**: `@RequiresRole` can be declared on either a controller class or a specific endpoint method.
- **Aspect Interceptor**: `RoleCheckAspect` intercepts `@RequiresRole` targets:
  - Resolves method-level annotations first, falling back to class-level annotations.
  - Retrieves authenticated user attributes (`userId`) from the HTTP request context.
  - Fetches the user's role from a decoupled `RoleService` lookup.
  - Returns `403 Forbidden` if the user's role does not match the permitted annotation roles.

### 4. Profile-Driven Configuration & Cloud Secrets Manager
Avoid hardcoding database/API credentials or committing files with secrets:
- **Fallback Configuration (Scenario A - Local)**: Multi-document `application.yaml` defines default parameters pointing to local fallback instances (e.g., local PostgreSQL container running on `localhost:54322`).
- **Cloud Configuration (Scenario B - Cloud)**: When the `aws` profile is active, integration with Spring Cloud AWS imports properties dynamically from AWS Secrets Manager using the path `/config/pec-events-api_${spring.profiles.active:dev}`.

### 5. Local Mocking & Tooling
Maintain developer productivity when working offline or in containerized environments:
- **Local S3 / MinIO**: Run a local MinIO bucket emulator and target it using `AWS_S3_ENDPOINT` configurations for local uploads.
- **Email Catcher (Inbucket)**: Route all outgoing local SMTP emails to a local Inbucket catcher (`localhost:54324`) so developers can capture OTPs or magic links without a live provider.
