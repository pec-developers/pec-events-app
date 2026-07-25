## Context

In the current database schema, the `users` table has both a flat `role` string column and a `role_id` column referencing the `roles` table. The `role` string is critical for simple checks and is also referenced in database trigger constraint validations (e.g., `check_department_role_limits` checking SPOC and coordinator quotas). Keeping them synchronized in application code is manual and error-prone.

## Goals / Non-Goals

**Goals:**
- Automatically synchronize the flat `role` string field on the `User` entity with `roleEntity.getName()` whenever it is saved or updated.
- Prevent data inconsistency between the two database columns.
- Retain the performance benefits of a flat `role` check without DB joins.

**Non-Goals:**
- Altering the database schema or dropping columns (keeping the database triggers unchanged).
- Re-architecting security check filters or JWT token logic.

## Decisions

### Decision 1: Use JPA Lifecycle Callbacks for Synchronization
We will implement `@PrePersist` and `@PreUpdate` callback annotations inside `User.java` to update `role` automatically:
```java
@PrePersist
@PreUpdate
private void syncRoleFromEntity() {
    if (this.roleEntity != null) {
        this.role = this.roleEntity.getName();
    }
}
```
**Alternatives Considered:**
- **Manual Sync in AuthService**: High developer burden; easily forgotten when new registration endpoints are added.
- **Full Normalization (Dropping `role`)**: Rejected because it requires rewriting database triggers, custom JPQL/HQL queries, and incurs outer join penalties.

## Risks / Trade-offs

- **[Risk] JPA Entity Builder State Mismatch**: 
  - If a developer builds a `User` using Lombok's builder and reads `user.getRole()` before saving it to the database, it will return null because the JPA lifecycle callback only runs before persisting.
  - *Mitigation*: The codebase already builds users and saves them immediately. We will document this pattern, and we can also add a convenience builder or custom setter if necessary.
