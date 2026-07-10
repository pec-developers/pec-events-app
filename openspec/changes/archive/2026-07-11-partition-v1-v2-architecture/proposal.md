## Why

To support a phased rollout of the PEC Events application, the system architecture must be divided into two distinct evolutionary phases:
- **Version 1 (Current Scope)**: Direct client-server communication using React and Spring Boot. Authentication is handled by Supabase Auth (GoTrue), database storage by Supabase PostgreSQL, and file uploads by AWS S3. This simplifies development, reduces infrastructure costs, and eliminates initial operational overhead (EKS, Kong, Keycloak, Redis, and RabbitMQ are deferred).
- **Version 2 (Future Scope)**: A high-concurrency enterprise architecture deployed on AWS EKS with Kong API Gateway routing, Keycloak IAM, Redis caching, and RabbitMQ message brokering.

Documenting this division ensures that development teams build the correct simplified architecture for Phase 1 while maintaining clear paths and designs for scaling to Phase 2.

## What Changes

This change details the updates to all requirements and design documentation to reflect the two phases:
1. Divide HLD system topology, network security boundaries, and authentication flows into V1 and V2 subsections.
2. Update PRD feature descriptions (e.g., Auth, Caching, Messaging) to clearly demarcate V1 vs V2 scope.
3. Update LLD database details, authentication filters (SupabaseJwtFilter vs. Keycloak Token filter), role aspect implementation, and notification dispatches.
4. Update BRD phase boundaries and user role mappings.
5. Update User Flow docs to outline Supabase Auth registration (V1) and Keycloak dual-OTP registration (V2).
6. Update Testing Spec to separate V1 and V2 test cases.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `project-documentation`: Update requirements to enforce documenting both V1 and V2 system architectures in the design files.
- `user-flow-docs`: Update registration and routing requirements to account for both V1 (Supabase Auth) and V2 (Keycloak IdP) authentication systems.

## Impact

- **Configuration**: `openspec/config.yaml` context will be updated to define V1 and V2 tech stacks and authentication policies.
- **Documentation**: All Markdown files in `docs/` (`brd.md`, `prd.md`, `hld.md`, `lld.md`, `user-flow-docs.md`, `testing_spec.md`) will be modified to support both architectures.
