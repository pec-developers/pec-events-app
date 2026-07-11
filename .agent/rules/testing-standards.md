---
trigger: always_on
description: Enforce testing standards, frameworks, and directory mapping for both frontend (Vitest, MSW) and backend (JUnit 5, Mockito, MockMvc).
---

## testing-standards

All frontend and backend test suites in the repository must adhere strictly to the following frameworks, layouts, and mocking standards.

### 1. Frontend Testing Architecture (Vitest & MSW)

- **Framework**: Vitest (configured with `happy-dom` for simulated browser API environments).
- **Test Organization**: Co-locate test files inside `__tests__/` subdirectories within their respective layer:
  - `src/api/__tests__/` - API client and endpoint contract unit/integration tests.
  - `src/services/__tests__/` - Domain logic and strategy registry tests.
  - `src/hooks/__tests__/` - Custom React hook state machines, validation logic, and input formatters.
  - `src/stores/__tests__` (or `store/__tests__/`) - Zustand store action triggers and state mutations.
  - `src/components/**/__tests__/` - Component presentation and layout tests.
- **Network Interception**:
  - **No Live API Calls**: Tests must never request live backend resources.
  - Intercept all network traffic at the Node level using **MSW (Mock Service Worker)** via a mock server (`src/api/setupTests.ts`).
  - Declare fixtures and handlers under `src/api/mocks/` to simulate server responses and error boundaries (e.g., 400 Bad Request, 429 Rate Limited, 500 Server Error).
- **Mocking & Mocks Cleanup**:
  - Mock third-party libraries and local modules using Vitest utilities (`vi.mock`, `vi.fn`).
  - Clear mocks and reset MSW handlers after each test run (e.g., `vi.clearAllMocks()`, `server.resetHandlers()`, and `localStorage.clear()`).

### 2. Backend Testing Architecture (JUnit 5 & Mockito)

- **Frameworks**: JUnit 5, Mockito, AssertJ (fluent assertions), and MockMvc.
- **Unit Testing (Service & Aspect Layers)**:
  - Annotate test classes with `@ExtendWith(MockitoExtension.class)`.
  - Use Mockito annotations (`@Mock`, `@InjectMocks`) to isolate classes under test.
  - For aspects and request filters (like `RoleCheckAspect`), mock `HttpServletRequest` and mount request contexts using:
    ```java
    ServletRequestAttributes attributes = new ServletRequestAttributes(request);
    RequestContextHolder.setRequestAttributes(attributes);
    ```
    *Ensure `RequestContextHolder.resetRequestAttributes()` is called in `@AfterEach` teardown.*
- **API Slices (Controller Layer Testing)**:
  - Annotate target test classes with `@WebMvcTest(YourController.class)` to verify the HTTP web slice exclusively without loading the entire context.
  - Inject `MockMvc` and mock controller dependencies using `@MockitoBean` (or `@MockBean` depending on the active Spring Boot version).
  - Verify route responses, HTTP statuses, and body payloads (e.g., `.andExpect(status().isBadRequest())`, `.andExpect(jsonPath("$.error").value("..."))`).
- **Integration & Application Context Testing**:
  - Verification of database triggers, transaction bounds, and concurrency locking mechanisms can use `@SpringBootTest` alongside Docker Testcontainers or isolated local PostgreSQL instances.
- **Test Properties & Configuration**:
  - Maintain a dedicated test config inside `src/test/resources/application.yaml`.
  - **Offline Executions**: Disable cloud secrets loaders (`spring.cloud.aws.secretsmanager.enabled: false`) to ensure tests compile and execute completely offline and locally.
