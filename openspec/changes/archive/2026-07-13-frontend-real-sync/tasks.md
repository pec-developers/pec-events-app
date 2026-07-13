## 1. Backend Database Seeding

- [x] 1.1 Create `DatabaseSeeder.java` implementing `CommandLineRunner` to seed default academic departments (CSE, ECE, ME, CE, EEE), default system configurations (max SPOCs/coordinators), and initial test events.

## 2. Frontend Mock Removal

- [x] 2.1 Delete mock adapter files `auth.mock.ts` and `event.mock.ts` from the codebase.
- [x] 2.2 Refactor API entry points `auth.ts` and `event.ts` to export only real client methods routing to live REST endpoints.

## 3. AuthStore and Views Integration

- [x] 3.1 Refactor session check inside `authStore.ts` to use only live backend verification.
- [x] 3.2 Verify that visual page components render data flows cleanly.

## 4. Verification

- [x] 4.1 Run Maven JUnit tests to confirm compilation and schema validity.
- [x] 4.2 Validate browser dashboard flows offline.
