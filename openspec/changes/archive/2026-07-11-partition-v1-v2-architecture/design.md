## Context

The PEC Events application was originally designed with an enterprise architecture (AWS EKS, Kong Gateway, Keycloak, Redis, and RabbitMQ). To support a phased rollout and quick validation of the application, we are partitioning the architecture:
- **Version 1 (V1)**: Lightweight stack using React, Spring Boot, Supabase (Auth and Database), and AWS S3. Bypasses Kong, Keycloak, Redis, and RabbitMQ.
- **Version 2 (V2)**: Full enterprise integration deployed on EKS, utilizing Kong for proxying, Keycloak for federated authentication, Redis for low-latency queries caching, and RabbitMQ for message queue buffering.

This design document outlines the decisions required to support V1's simplified direct authentication, roles, tasks, and data synchronization while preserving V2's target design.

## Goals / Non-Goals

**Goals:**
- Formulate the architecture specification for Version 1 and Version 2 in parallel.
- Specify how Spring Boot authenticates Supabase JWTs using standard JWT filters (`SupabaseJwtFilter`) dynamically validating signatures.
- Specify the role access control strategy in V1 using database lookups in Spring Boot's custom AOP aspect (`@RequiresRole`).
- Specify V1's simplified notification handling (using Spring `@Async` thread pools) and caching (direct PostgreSQL queries or simple memory cache).
- Provide a clear blueprint for updating all documentation files (`brd.md`, `prd.md`, `hld.md`, `lld.md`, `user-flow-docs.md`, `testing_spec.md`) and configuration (`openspec/config.yaml`).

**Non-Goals:**
- Implementing backend or frontend code changes in this change.
- Altering the core business logic of the ticket booking or waiting list algorithms.

## Decisions

### 1. V1 Client-Server Communication & Auth Flow
- **Decision**: In V1, the React frontend connects directly to the Spring Boot backend API. Keycloak and Kong Gateway are removed.
- **Implementation**: The React client uses the Supabase JS SDK to log in and sign up. On success, the client sends the Supabase JWT in the `Authorization: Bearer <token>` header (or standard `authToken` cookie) to Spring Boot. Spring Boot runs a custom `SupabaseJwtFilter` on each request to validate the token.

### 2. V1 JWT Signature Verification
- **Decision**: Validate Supabase JWTs on the backend either symmetrically using the shared client JWT secret or asymmetrically using Supabase's JWKS endpoint.
- **Symmetric**: Jwts are verified against `supabase.jwt-secret` using HMAC-SHA.
- **Asymmetric**: Fetch public keys from `<supabase-url>/auth/v1/.well-known/jwks.json`, caching the keys by `kid` header claim, and verifying via ES256 signature verification.

### 3. V1 Role-Based Access Control (RBAC)
- **Decision**: Roles are queried from the local database in V1.
- **Implementation**: We use Spring AOP aspect interceptors (`@RequiresRole`) on Controller classes/methods. The aspect reads the authenticated user's ID, invokes `RoleService.getRoleForUser(userId)` to fetch their active role from the PostgreSQL database, and validates it against the annotation values.

### 4. V1 Asynchronous Notifications & Caching
- **Decision**: Remove Redis and RabbitMQ dependencies in V1.
- **Notifications**: Trigger push alerts using a standard task executor or `@Async` in Spring Boot.
- **Caching**: Retrieve data directly from Supabase PostgreSQL (or use Spring's basic ConcurrentMapCacheManager).

## Risks / Trade-offs

- **CORS and Endpoint Protection**: Bypassing Kong API Gateway means Spring Boot must manage CORS origins and route authorization constraints directly via `SecurityConfig`.
- **Concurrency Bottlenecks**: Without Redis caching and RabbitMQ decoupling, database connection pools may saturate during ticket sales. We mitigate this in V1 using PostgreSQL row-level locks (`SELECT ... FOR UPDATE`), which will serialize registrations. Scaling out will happen in V2 with EKS, Kong, Redis, and RabbitMQ.
