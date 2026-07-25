## Why

In the current database schema, the `users` table contains both a flat `role` string column and a foreign key `role_id` column referencing the `roles` table. This creates a data redundancy risk where `user.role` (String) and `user.roleEntity` (Role) can become inconsistent if a developer forgets to set both fields in the application layer.

## What Changes

- **Automatic Role Sync**: Implement JPA lifecycle callbacks (`@PrePersist` and `@PreUpdate`) in the `User` entity to automatically synchronize the `role` string column with the name of the `roleEntity` before persistence.
- **Service Layer Guardrail**: Developers will now only need to set `roleEntity` on the `User` entity, and the flat string `role` will be updated and synchronized automatically.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->

## Impact

- **Affected Files**: `com.pecdevelopers.events.model.entity.User`
- **APIs & Controllers**: No impact on external REST APIs or controller interfaces.
- **Database/Triggers**: No database schema change or trigger modification required; the existing database trigger `trigger_check_department_role_limits` remains intact and receives synchronized data.
