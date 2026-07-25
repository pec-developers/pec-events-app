## Context

Currently, the React 19 frontend uses a hybrid mock-real strategy in `auth.ts` and `event.ts` using conditional flags like `USE_MOCK`. To ensure correct network logic flows directly from the Spring Boot REST backend, we will remove the mock adapters (`auth.mock.ts`, `event.mock.ts`), delete conditional branches, and make raw HTTP calls using Axios clients.

## Goals / Non-Goals

**Goals:**
*   Delete `auth.mock.ts` and `event.mock.ts` files from the frontend codebase.
*   Update `auth.ts` and `event.ts` to expose only live Axios client methods.
*   Implement backend database seeding (`DatabaseSeeder.java`) to populate academic departments, limit configuration defaults, and sample events.

**Non-Goals:**
*   We will not change the visual layout dashboard views or forms.
*   We will not modify the `@RequiresRole` security checks on the backend controllers.

## Decisions

*   **Remove Mock Clients**: Delete all simulated `localStorage` databases.
*   **Backend Seeding**: Add a standard Spring Boot `CommandLineRunner` implementation to seed static departments (CSE, ECE, ME, CE, EEE), configurations (max SPOCs = 1, max coordinators = 3), and sample published/draft events for testing.

## Risks / Trade-offs

*   **Risk**: Removing frontend mock means developers will need a running backend database and server to interact with the application.
    *   *Mitigation*: Running the Spring Boot local profile against the local H2 or PostgreSQL instance will run the backend seed runner automatically, ensuring a complete set of mock records is instantly populated.
