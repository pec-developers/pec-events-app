## Why

Currently, the frontend contains mock data logic (using `localStorage` state simulation, fake user registration, simulated events, and mock configuration values) that bypasses the live Spring Boot REST backend endpoints. To prepare the application for real deployment environments, the frontend must integrate directly with the Spring Boot backend REST API layer, removing all mock client fallbacks. Initial dummy data will be seeded directly from the backend rather than using frontend arrays.

## What Changes

*   **Remove Mock Client Files**: Deprecate and remove `auth.mock.ts` and `event.mock.ts` from the frontend source tree.
*   **Remove Mock Conditional Bypasses**: Remove all conditional logic (`USE_MOCK` checks) from the API layer entry points (`auth.ts`, `event.ts`), forcing all requests to route through the Axios real network client.
*   **Align AuthStore Session Checking**: Update `authStore.ts` to retrieve user context from the live session verification endpoints of the backend.
*   **Backend Data Seeding**: Enable and run backend DB seed data scripts or endpoints to populate initial configurations, departments, and events.

## Capabilities

### Modified Capabilities
- `multi-role-routing`: Align the client router guard execution and dashboards API calls directly to the real Spring Boot REST backend.

## Impact

*   **Frontend**: Complete integration of `auth.ts` and `event.ts` with Axios, cleaning up mock dependencies in dashboard views, and routing session checks dynamically against the REST auth endpoints.
*   **Backend**: Populate initial academic departments, default settings configurations, and sample events via backend database seeds.
