## 1. Entity Implementation

- [x] 1.1 Add `@PrePersist` and `@PreUpdate` lifecycle methods in the `User` entity to copy `roleEntity.name` to `role`
- [x] 1.2 Import `PrePersist` and `PreUpdate` annotations in `User.java`

## 2. Testing and Verification

- [x] 2.1 Add or update a backend unit/integration test to verify that persisting/updating a `User` entity with `roleEntity` automatically populates the `role` string column
- [x] 2.2 Run maven tests (`mvn clean test`) to verify all tests pass without errors
