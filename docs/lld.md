# Low-Level Design (LLD)

## 1. Database Schema & ER Diagram

The PostgreSQL database (Supabase) stores user profiles, event details, registrations, manual payment verification history, and browser push notification endpoints.

```mermaid
erDiagram
    users {
        uuid id PK
        varchar name
        varchar email
        varchar department
        varchar role
        timestamp created_at
    }
    events {
        uuid id PK
        varchar title
        text description
        uuid creator_id FK
        varchar department
        numeric price
        integer capacity
        varchar qr_code_url
        boolean active
        timestamp date
        timestamp created_at
    }
    event_coordinators {
        uuid event_id PK, FK
        uuid user_id PK, FK
        timestamp created_at
    }
    registrations {
        uuid id PK
        uuid student_id FK
        uuid event_id FK
        varchar status
        timestamp created_at
    }
    payment_audit_logs {
        uuid id PK
        uuid registration_id FK
        varchar transaction_id
        varchar screenshot_s3_url
        varchar status
        uuid verified_by FK
        timestamp verified_at
        timestamp created_at
    }
    push_subscriptions {
        uuid id PK
        uuid user_id FK
        varchar endpoint
        text p256dh
        text auth
        timestamp created_at
    }

    users ||--o{ events : "creates"
    users ||--o{ event_coordinators : "assigned as collaborator"
    events ||--o{ event_coordinators : "has collaborator"
    users ||--o{ registrations : "registers"
    events ||--o{ registrations : "has"
    registrations ||--o| payment_audit_logs : "has audit log"
    users ||--o{ payment_audit_logs : "verifies"
    users ||--o{ push_subscriptions : "subscribes to push"
```

### 1.1 Integrity Rules
*   **Users:** User profiles pre-created by System Admin inside Keycloak. On first successful login, they synchronize. Roles are `ADMIN`, `SPOC`, `FACULTY_COORDINATOR`, `STUDENT_COORDINATOR`, `FACULTY`, `STUDENT`.
*   **Registrations:** Status transitions:
    *   *Free events:* Immediate slot available: `CONFIRMED`. No slot: `WAITING_LIST` -> `CONFIRMED` (upon cancellation dropout promotion).
    *   *Paid events:* Immediate slot: `PENDING_PAYMENT_VERIFICATION` -> `CONFIRMED` or `REJECTED`. No slot: `WAITING_LIST` -> `PENDING_PAYMENT` (upon cancellation promotion) -> `PENDING_PAYMENT_VERIFICATION` -> `CONFIRMED` or `REJECTED`.
*   **Capacity Constraint:** Active reservation slots count (registrations in `CONFIRMED` or `PENDING_PAYMENT_VERIFICATION` state) must not exceed the event `capacity`.

---

## 2. High-Concurrency Slot Control Strategy

To prevent overselling of ticket inventories and manage the FCFS waiting list queue under concurrent spikes, the Spring Boot transaction executes a row-level write lock.

### 2.1 Backend Registration Flow (Locking)
```java
@Transactional
public RegistrationResponse registerForEvent(UUID eventId, UUID studentId) {
    // 1. Lock the event row for updates
    Event event = eventRepository.findByIdForUpdate(eventId)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

    // 2. Count active confirmed/pending reservations
    long activeReservations = registrationRepository.countActiveReservations(eventId);

    Registration registration = new Registration();
    registration.setStudentId(studentId);
    registration.setEvent(event);

    if (activeReservations < event.getCapacity()) {
        if (event.getPrice().compareTo(BigDecimal.ZERO) == 0) {
            registration.setStatus(RegistrationStatus.CONFIRMED);
        } else {
            registration.setStatus(RegistrationStatus.PENDING_PAYMENT_VERIFICATION);
        }
    } else {
        registration.setStatus(RegistrationStatus.WAITING_LIST);
    }
    
    return registrationRepository.save(registration);
}
```

### 2.2 Backend Dropout Promotion Flow (Locking)
```java
@Transactional
public void cancelRegistration(UUID registrationId, UUID requestingUserId) {
    // 1. Lock registration being cancelled
    Registration registration = registrationRepository.findByIdForUpdate(registrationId)
        .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
    
    // Authorization check: student owner or assigned event collaborator
    validateCancellationAuthority(registration, requestingUserId);

    UUID eventId = registration.getEvent().getId();
    Event event = eventRepository.findByIdForUpdate(eventId)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

    // 2. Cancel the registration
    registration.setStatus(RegistrationStatus.CANCELLED);
    registrationRepository.save(registration);

    // 3. Look for the oldest WAITING_LIST student
    Optional<Registration> oldestWaiting = registrationRepository
        .findFirstByEventIdAndStatusOrderByCreatedAtAsc(eventId, RegistrationStatus.WAITING_LIST);

    if (oldestWaiting.isPresent()) {
        Registration waiting = oldestWaiting.get();
        if (event.getPrice().compareTo(BigDecimal.ZERO) == 0) {
            waiting.setStatus(RegistrationStatus.CONFIRMED);
            // Trigger Service Worker push alert for confirmation
        } else {
            waiting.setStatus(RegistrationStatus.PENDING_PAYMENT);
            // Trigger Service Worker push alert prompting payment upload
        }
        registrationRepository.save(waiting);
    }
}
```
*   **SQL query triggered:** `SELECT * FROM events WHERE id = ? FOR UPDATE;`
*   **Isolation level:** Spring Boot default `READ_COMMITTED` isolation level, which ensures row write locks serialize updates.

---

## 3. React Frontend 3-Layer Architecture

The frontend workspace separates concerns into strict decoupled folders:

```
frontend/src/
├── api/          # Layer 1: Raw fetch/HTTP API operations
├── stores/       # Layer 2: Zustand stores and data logic
└── pages/        # Layer 3: View components and routing views
```

1.  **API Layer (`src/api/`):** Contains raw network fetch calls. A custom fetch helper appends authentication headers dynamically:
    ```typescript
    export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
      const token = useAuthStore.getState().token;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      return fetch(`/api${endpoint}`, { ...options, headers });
    };
    ```
2.  **Data Layer (`src/stores/`):** Manages local state. Stores handle transformations and update views (e.g., `useEventsStore.ts`, `useAuthStore.ts`, `useRegistrationStore.ts`).
3.  **View Layer (`src/pages/`, `src/components/`):** Component views styled with Tailwind CSS v4 and HeroUI elements. Employs maroon red branding (`#a80000`) and uses HeroUI's skeleton components for asynchronous loading states.

---

## 4. API Schema Specifications

### 4.1 Create Event (Faculty Coordinators only)
*   **Path:** `POST /api/events`
*   **Headers:** `Authorization: Bearer <jwt-token>`
*   **Request JSON:**
    ```json
    {
      "title": "Hackathon 2026",
      "description": "Annual college coding contest.",
      "price": 250.00,
      "capacity": 150,
      "date": "2026-10-15T09:00:00Z"
    }
    ```
*   **Response JSON (201 Created):**
    ```json
    {
      "id": "e4b2d8c3-12ab-4bcd-8ef0-1234567890ab",
      "title": "Hackathon 2026",
      "price": 250.00,
      "capacity": 150,
      "active": true
    }
    ```

### 4.2 Assign Event Collaborator (Assigned Coordinators only)
*   **Path:** `POST /api/events/{eventId}/coordinators`
*   **Headers:** `Authorization: Bearer <jwt-token>`
*   **Request JSON:**
    ```json
    {
      "userId": "d7b2d8c3-12ab-4bcd-8ef0-1234567890cd"
    }
    ```
*   **Response JSON (200 OK):**
    ```json
    {
      "eventId": "e4b2d8c3-12ab-4bcd-8ef0-1234567890ab",
      "userId": "d7b2d8c3-12ab-4bcd-8ef0-1234567890cd",
      "status": "COLLABORATOR_ASSIGNED"
    }
    ```

### 4.3 Register for Event (Free or Paid)
*   **Path:** `POST /api/events/{eventId}/register`
*   **Headers:** `Authorization: Bearer <jwt-token>`
*   **Response JSON (201 Created - Slot Available, Free Event):**
    ```json
    {
      "registrationId": "r9a8c7b6-54de-4f32-ba98-76543210fedc",
      "status": "CONFIRMED"
    }
    ```
*   **Response JSON (201 Created - Slot Full, joins Waiting List):**
    ```json
    {
      "registrationId": "r9a8c7b6-54de-4f32-ba98-76543210fedc",
      "status": "WAITING_LIST"
    }
    ```
*   **Response JSON (201 Created - Slot Available, Paid Event):**
    ```json
    {
      "registrationId": "r9a8c7b6-54de-4f32-ba98-76543210fedc",
      "status": "PENDING_PAYMENT_SUBMISSION"
    }
    ```

### 4.4 Submit Payment Details (For initial booking or waiting list promotions)
*   **Path:** `POST /api/registrations/{registrationId}/submit-payment`
*   **Headers:** `Authorization: Bearer <jwt-token>`
*   **Content-Type:** `multipart/form-data`
*   **Request Parts:**
    *   `transactionId` (text): `123456789012`
    *   `screenshot` (file): Binary image file (JPEG/PNG, max 5MB)
*   **Response JSON (202 Accepted):**
    ```json
    {
      "registrationId": "r9a8c7b6-54de-4f32-ba98-76543210fedc",
      "status": "PENDING_PAYMENT_VERIFICATION",
      "screenshotUrl": "https://pec-events-screenshots.s3.amazonaws.com/r9a8c7b6.png"
    }
    ```

### 4.5 Cancel Registration / Dropout
*   **Path:** `POST /api/registrations/{registrationId}/cancel`
*   **Headers:** `Authorization: Bearer <jwt-token>`
*   **Response JSON (200 OK):**
    ```json
    {
      "registrationId": "r9a8c7b6-54de-4f32-ba98-76543210fedc",
      "status": "CANCELLED",
      "message": "Registration cancelled. Queue processed."
    }
    ```

### 4.6 Verify Payment (Coordinators)
*   **Path:** `POST /api/registrations/{registrationId}/verify`
*   **Headers:** `Authorization: Bearer <jwt-token>`
*   **Request JSON:**
    ```json
    {
      "approved": true,
      "rejectionReason": ""
    }
    ```
*   **Response JSON (200 OK):**
    ```json
    {
      "registrationId": "r9a8c7b6-54de-4f32-ba98-76543210fedc",
      "status": "CONFIRMED",
      "message": "Payment verified successfully. Registration is confirmed."
    }
    ```

### 4.7 Create SPOC (Admin only)
*   **Path:** `POST /api/admin/spocs`
*   **Headers:** `Authorization: Bearer <jwt-token>`
*   **Request JSON:**
    ```json
    {
      "userId": "u1a2b3c4-56de-78fa-9012-34567890abcd",
      "department": "CSE"
    }
    ```
*   **Response JSON (201 Created):**
    ```json
    {
      "userId": "u1a2b3c4-56de-78fa-9012-34567890abcd",
      "department": "CSE",
      "role": "SPOC"
    }
    ```

### 4.8 Promote Coordinator (SPOC only)
*   **Path:** `POST /api/spoc/coordinators`
*   **Headers:** `Authorization: Bearer <jwt-token>`
*   **Request JSON:**
    ```json
    {
      "userId": "u5f6g7h8-90ij-klmn-opqr-stuvwxyz1234",
      "action": "PROMOTE"
    }
    ```
*   **Response JSON (200 OK):**
    ```json
    {
      "userId": "u5f6g7h8-90ij-klmn-opqr-stuvwxyz1234",
      "role": "STUDENT_COORDINATOR",
      "status": "PROMOTED"
    }
    ```
