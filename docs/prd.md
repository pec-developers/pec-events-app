# Product Requirements Document (PRD)

## 1. Scope of Features

### 1.1 User Registration & Profile Synchronization
*   **Authentication & Self-Registration Portal:** Keycloak coordinates authentication. Users self-register inside the app by providing:
    1. `registration_number` (unique institutional ID)
    2. `email`
    3. `phone_number`
    4. `password`
*   **Registration Verification:** If the `registration_number` is already registered, the application immediately redirects the user to the login screen with a message stating that the registration number is already in use.
*   **Password Recovery (OTP):** In case of a forgotten password, the login screen redirects to Keycloak's recovery portal. Keycloak dispatches a reset One-Time Password (OTP) or reset link directly using **Resend.com** (for email channels) and **Twilio** (via a custom SMS authenticator SPI for phone channels).
*   **Automatic Profile Sync:** On successful login, the frontend sends the JWT bearer token. If the user does not exist in the database, the backend creates a user profile mapping `id`, `name`, `email`, `phone_number`, `registration_number`, `department`, and `role`.
*   **Redis Cache System:** High-concurrency event discovery requests (listing and detail queries) are cached in Redis to decrease response times and prevent PostgreSQL database connection limits from being saturated during peaks.
*   **RabbitMQ Message Queue:** Decouples the main transactional thread from I/O heavy notification dispatches. Status changes publish events to RabbitMQ, where a consumer consumes and executes Web Push alerts asynchronously.

### 1.2 Event Listing & Discovery
*   **Discovery Board:** Authenticated students and faculty can browse and view active/upcoming events.
*   **Metadata Display:** Events display title, banner image, date, description, coordinator details, price, remaining seats, and registration deadline.

### 1.3 Event Creation (Coordinators)
*   **Publishing Interface:** Only Faculty Coordinators can create and publish new events.
*   **Collaborative Management:** When creating an event, the Faculty Coordinator is marked as the creator. The creator (or their department SPOC) can assign other Faculty or Student Coordinators of their department as collaborators on the event. Student Coordinators do NOT have permissions to manage (add or remove) collaborators on the event.
*   **Event Modification:** Any coordinator assigned to an event has full modification permissions to edit details, manage registrations, and verify payments.
*   **Parameters:** Configurable capacity limits, price, active flags, and UPI payment details.
*   **Overbooking Control:** Enforce strict capacity caps using Postgres row-level locks when seat allocations or registrations occur.

### 1.4 Ticket Booking & Payment Submission (V1)
*   **Eligibility Boundary:** Only student roles (`STUDENT` and `STUDENT_COORDINATOR`) are eligible to register and participate in events. Faculty roles (`FACULTY`, `FACULTY_COORDINATOR`, and `SPOC`) can browse and view events but are blocked from registering/participating.
*   **Capacity Checks:** The system counts active reservations as registrations in `CONFIRMED` or `PENDING_PAYMENT_VERIFICATION` states. If this count is equal to or greater than the event's capacity, new registrations are placed in the `WAITING_LIST` state.
*   **Free Events:**

    *   *Slots Available:* Immediate registration. Status is set to `CONFIRMED`.
    *   *Slots Full:* Registration is placed in `WAITING_LIST`.
*   **Paid Events:**
    *   *Slots Available:* Clicking register opens a modal showing a static UPI QR code. The student must:
        1. Scan and pay external to the app.
        2. Input the 12-digit UPI Reference Transaction ID.
        3. Upload a file of the payment screenshot.
        4. Submit registration, placing it in a `PENDING_PAYMENT_VERIFICATION` status.
    *   *Slots Full:* Clicking register places the student on the `WAITING_LIST` immediately. No payment details are requested or collected upfront to avoid refund overhead.
*   **Image Storage:** Frontend sends screenshot files directly to the Spring Boot backend, which puts it into AWS S3 and records the S3 URL in the database.

### 1.5 Verification Dashboard
*   **Review Queue:** Assigned coordinators see registrations filtered by status (`PENDING_PAYMENT_VERIFICATION`, `CONFIRMED`, `REJECTED`, `PENDING_PAYMENT`, `WAITING_LIST`).
*   **Validation Modal:** Clicking a registration in `PENDING_PAYMENT_VERIFICATION` opens a modal showing the student details, transaction ID, and the uploaded S3 payment screenshot.
*   **Actions:**
    *   **Approve:** Updates status to `CONFIRMED`, and pushes a confirmation notification to the student.
    *   **Reject:** Updates status to `REJECTED`, prompts for a reason, and pushes a rejection notification to the student.

### 1.6 Web Push Notifications (PWA)
*   **Subscription Opt-in:** Prompt the user to grant push permission. If granted, register a service worker subscription with a public VAPID key and send it to the backend.
*   **Status Alerts:** Push OS-level notifications immediately when:
    *   A coordinator publishes a new event.
    *   A registration status updates to `CONFIRMED`, `REJECTED`, or `PENDING_PAYMENT`.

### 1.7 FCFS Waiting List & Dropout Flow (V1)
*   **Dropout Cancellation:** When a student cancels their registration (or a coordinator cancels it), if the event has a waiting list (one or more registrations in `WAITING_LIST` state), the oldest `WAITING_LIST` registration (based on `created_at` ASC) is automatically promoted:
    *   *Free Event:* Promoted registration status changes to `CONFIRMED`. Send success push notification.
    *   *Paid Event:* Promoted registration status changes to `PENDING_PAYMENT`. Send push notification requesting payment.
    *   *No Waiting List:* Available slots are incremented by 1.
*   **Promoted Payment Submission & Expiry:** A student whose registration transitions to `PENDING_PAYMENT` is prompted to pay. They scan the UPI QR code, pay, and upload their transaction ID and payment screenshot. This transitions their registration status to `PENDING_PAYMENT_VERIFICATION` for coordinator approval.
    *   *24-Hour Expiry Window:* The promoted student has exactly **24 hours** from the promotion timestamp to submit their transaction details and screenshot. If they do not upload payment details within 24 hours, their registration status is updated to `EXPIRED` (or cancelled) and the backend automatically triggers the promotion of the next FCFS waiting list student.
    *   *Payment Rejection & Re-upload Grace Period:* If a coordinator rejects a student's uploaded payment details, the registration status transitions to `PAYMENT_REJECTED` and a push notification is sent to the student. The student is granted a **12-hour grace period** from the rejection timestamp to re-upload valid payment details. If they fail to re-submit details within 12 hours, the registration is updated to `EXPIRED` and the backend automatically promotes the next student in the FCFS waiting list queue.

## 2. Core User Flows

### 2.1 Event Registration Flow
```mermaid
flowchart TD
    A([Browse Event]) --> B[Click Register]
    B --> C{Active Reservations < Capacity?}
    
    C -- Yes --> D{Is Event Paid?}
    D -- No --> E["Status: CONFIRMED<br/>Push Notification"]
    D -- Yes --> F[Display UPI QR Code]
    F --> G[Upload Screenshot & Input Txn ID]
    G --> H[Submit Registration]
    H --> I[Status: PENDING_PAYMENT_VERIFICATION]
    I --> J[Coordinator reviews Queue]
    J --> K{Approve or Reject?}
    K -- Approve --> L["Status: CONFIRMED<br/>Push Notification"]
    K -- Reject --> M["Status: REJECTED<br/>Push Notification with Reason"]

    C -- No --> N["Status: WAITING_LIST<br/>(No payment collected)"]
```

### 2.2 Student Dropout & Promotion Flow
```mermaid
flowchart TD
    A([Student Drops Out / Cancels]) --> B{Is there a Waiting List?}
    B -- No --> C[Increment Available Slots]
    B -- Yes --> D[Retrieve Oldest WAITING_LIST Student FCFS]
    D --> E{Is Event Paid?}
    E -- No --> F["Promote to CONFIRMED<br/>Push Notification"]
    E -- Yes --> G["Promote to PENDING_PAYMENT<br/>Push Notification to Pay"]
    G --> H[Student uploads Screenshot & Txn ID]
    H --> I[Status: PENDING_PAYMENT_VERIFICATION]
    I --> J[Coordinator reviews Queue]
    J --> K{Approve or Reject?}
    K -- Approve --> L["Status: CONFIRMED<br/>Push Notification"]
    K -- Reject --> M["Status: REJECTED<br/>Push Notification with Reason"]
```

## 3. Product Constraints & System Parameters
*   **Max Upload Size:** Screenshots must be constrained to 5MB, limited to `.png`, `.jpg`, and `.jpeg` formats.
*   **UPI Reference Format:** Restrict the transaction ID input to a 12-digit numeric format.
*   **Skeleton Loading:** Use HeroUI skeletons during data fetch delays to enhance user experience.
