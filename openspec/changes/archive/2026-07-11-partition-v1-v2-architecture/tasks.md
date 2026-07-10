## 1. Specification Configuration Updates

- [x] 1.1 Update `openspec/config.yaml` context to define both Version 1 and Version 2 tech stacks and authentication policies

## 2. Business & Product Requirement Updates

- [x] 2.1 Update `docs/brd.md` Section 3 and Section 4 to clearly document the V1 vs V2 architectural evolution and boundaries
- [x] 2.2 Update `docs/prd.md` to specify V1 vs V2 scope for user registration, Redis caching, RabbitMQ message queues, and PWA notification dispatches

## 3. High-Level & Low-Level Architectural Design Updates

- [x] 3.1 Update `docs/hld.md` to introduce the V1 architecture (including a custom V1 Mermaid diagram) and label the EKS cluster setup as V2
- [x] 3.2 Update `docs/lld.md` to specify the V1 `SupabaseJwtFilter` validation strategy, `@RequiresRole` AOP database lookup aspect, and fallback `@Async` notifications vs V2 specifications

## 4. User Flows & Testing Specification Updates

- [x] 4.1 Update `docs/user-flow-docs.md` to document the V1 Supabase Auth self-registration / sync sequence diagram alongside V2's Keycloak dual-OTP flow
- [x] 4.2 Update `docs/testing_spec.md` to split validation tests between V1 test environments (Supabase Auth, local MinIO, Inbucket) and V2 (Keycloak, EKS, Kong, Redis, RabbitMQ)
