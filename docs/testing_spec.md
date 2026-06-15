# Test Case Specification (STLC Plan)

## 1. Software Testing Life Cycle (STLC) Process

This project follows a **docs-first testing lifecycle**. Testing specifications and scenarios must be mapped out before coding begins.

```mermaid
flowchart LR
    Req[Requirement Analysis] --> Plan[Test Planning]
    Plan --> Design[Test Case Design]
    Design --> Setup[Test Environment Setup]
    Setup --> Exec[Test Execution]
    Exec --> Close[Test Closure / Verification]
```

---

## 2. Test Strategy

### 2.1 Frontend Testing (Vitest & React Testing Library)
*   **Unit Tests:** Verify store actions, token management, and data formatting inside Zustand stores (`authStore.ts`, `eventsStore.ts`).
*   **Integration/UI Tests:** Verify React component updates, skeleton loader displays, routing security boundaries, and HeroUI component behavior.

### 2.2 Backend Testing (JUnit 5 & Spring Boot Test)
*   **Mock Verification:** Keycloak authentication filters verified with mock JWT signatures.
*   **Integration Tests:** Database transactions and row-level locking logic validated using Testcontainers (embedded/docker PostgreSQL instances).
*   **API Tests:** Endpoint validation with MockMvc checks.

---

## 3. Test Case Specifications

### 3.1 Authentication & Profile Sync (TC-AUTH)

#### TC-AUTH-01: First Successful Login Syncs User Profile
*   **Description:** Validate that when a user logs in for the first time, their claims are written to the database.
*   **Preconditions:** Keycloak is online. The target user ID does not exist in the database `users` table.
*   **Test Steps:**
    1.  Post login payload with valid Keycloak JWT containing name, email, department, and student role.
    2.  Check that the REST filter intercepts the JWT.
    3.  Query the local database `users` table for the matching user ID.
*   **Expected Result:** A new row is successfully created in the database containing the matching profile metadata.

#### TC-AUTH-02: SPOC Assignment and Coordinator Promotion Flow
*   **Description:** Verify Admin can assign a SPOC and SPOC can promote/demote department users.
*   **Preconditions:** System Admin account exists. Target Student and Faculty profiles exist in the database.
*   **Test Steps:**
    1.  Admin requests `POST /api/admin/spocs` to make the Faculty user a SPOC for "CSE". Verify role in DB.
    2.  As SPOC, request `POST /api/spoc/coordinators` to promote CSE Student to `STUDENT_COORDINATOR`.
    3.  Verify the Student's role in the DB becomes `STUDENT_COORDINATOR`.
    4.  Attempt demotion from SPOC. Verify role reverts to `STUDENT`.
*   **Expected Result:** Roles update successfully, and auth context updates. SPOC from CSE cannot promote ECE students (enforces department boundary).

---

### 3.2 High-Concurrency Slot Control (TC-CONCUR)

#### TC-CONCUR-01: Concurrent Bookings Row-Level Lock
*   **Description:** Validate that concurrent registration requests for the last remaining seat in an event are queued and prevent overbooking.
*   **Preconditions:** An event exists with `remaining_slots = 1`.
*   **Test Steps:**
    1.  Sprout 5 concurrent threads/requests attempting registration for this event simultaneously.
    2.  Each request executes a Spring transaction acquiring row lock (`SELECT ... FOR UPDATE`).
    3.  Monitor the response statuses and database slot count.
*   **Expected Result:** Exactly 1 registration changes to `CONFIRMED`. The remaining 4 requests fail with a `409 Conflict` or sold-out error status. The database `remaining_slots` stays at exactly `0`.

---

### 3.3 Event Registration & Payment Verification (TC-REG)

#### TC-REG-01: Free Event Immediate Confirmation
*   **Description:** Verify that registering for a free event bypasses verification screens.
*   **Preconditions:** Event is marked free (`price = 0.00`) and has seats available.
*   **Test Steps:**
    1.  Authenticated Student submits registration request.
    2.  Assert database actions and response.
*   **Expected Result:** Registration status is immediately set to `CONFIRMED`.

#### TC-REG-02: Paid Event Registration Phasing
*   **Description:** Ensure paid registrations go to a pending state until verified.
*   **Preconditions:** Event is paid (`price = 250.00`) and has slots available.
*   **Test Steps:**
    1.  Student uploads screenshot and enters a 12-digit transaction Reference ID.
    2.  Assert status immediately.
    3.  Coordinator logs in, accesses dashboard queue, and approves registration.
*   **Expected Result:** Upon submission, the registration status is set to `PENDING_PAYMENT_VERIFICATION`. After Coordinator approval, the status transitions to `CONFIRMED`.

#### TC-REG-03: FCFS Waiting List Free Event Promotion
*   **Description:** Verify that when a free event is full, registrations go to the waiting list and promote on cancellation.
*   **Preconditions:** A free event has capacity = 2, with 2 confirmed registrations.
*   **Test Steps:**
    1.  Student A registers. Assert response status is `WAITING_LIST`.
    2.  One of the confirmed students cancels registration (`POST /api/registrations/{id}/cancel`).
    3.  Check Student A's registration status.
*   **Expected Result:** Student A's status is automatically updated to `CONFIRMED`, and a push notification is triggered for them.

#### TC-REG-04: FCFS Waiting List Paid Event Promotion & Payment Flow
*   **Description:** Verify that when a paid event is full, registrations go to the waiting list, promote to PENDING_PAYMENT, and transition to verification on screenshot upload.
*   **Preconditions:** A paid event has capacity = 2, with 2 confirmed registrations.
*   **Test Steps:**
    1.  Student B registers. Assert status is `WAITING_LIST` (no payment requested).
    2.  One confirmed student cancels.
    3.  Verify Student B's registration status becomes `PENDING_PAYMENT`.
    4.  Student B calls `POST /api/registrations/{id}/submit-payment` uploading screenshot and txn ID.
*   **Expected Result:** Student B's status becomes `PENDING_PAYMENT_VERIFICATION` for the coordinator to approve.

---

### 3.4 Web Push Alerts (TC-PUSH)

#### TC-PUSH-01: User Subscribes and Receives Push Notifications
*   **Description:** Verify service worker registration and notification dispatch.
*   **Preconditions:** Browser grants notification permission.
*   **Test Steps:**
    1.  Frontend captures registration token using the server's VAPID key.
    2.  Send subscription details to backend endpoint.
    3.  Trigger status update from backend to `CONFIRMED`.
*   **Expected Result:** Service worker intercepts signed VAPID payload and raises OS-level notification.
