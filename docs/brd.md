# Business Requirements Document (BRD)

## 1. Project Overview
Prathyusha Engineering College (PEC) requires a Progressive Web App (PWA) to serve as a central hub for student event notifications, discovery, registration, and payment. The goal is to digitize event coordination, automate notifications, and streamline payment verification.

## 2. Business Goals
*   **Centralized Discovery:** Enable students to browse all active college events (academic, cultural, technical) in one application.
*   **Simple Registration:** Allow instant registration for free events and streamlined payment details upload for paid events.
*   **Effortless Coordination:** Empower Faculty and Student Coordinators to publish events and track registration analytics.
*   **Real-time Alerts:** Notify students of new events or registration status updates via PWA push notifications.

## 3. User Roles & Access Control Policy
The application supports six distinct user roles with hierarchical authority. Students and Faculty self-register by providing their registration number, email, and phone number, which is matched against a pre-loaded enrollment database.

| Role | Description / Permissions |
| :--- | :--- |
| **Student / Participant** | - Registers by matching registration number against the enrollment database.<br>- Browse events, view schedules, and register.<br>- Joins the First-Come, First-Served (FCFS) Waiting List if the event is at full capacity.<br>- For paid events, submits UPI transaction details within 24 hours of promotion.<br>- Receives push notifications. |
| **Faculty (Non-Coordinator)** | - Registers by matching registration number against the enrollment database.<br>- Browse all events and view schedules.<br>- No registration option.<br>- Receives push notifications for new events. |
| **Student Coordinator** | - Promoted from Student by the department SPOC.<br>- Assigned as event collaborator by Faculty Coordinators or SPOC.<br>- Modify event details and manage registrations *only* for assigned events.<br>- Cannot manage (add/remove) other event collaborators. |
| **Faculty Coordinator** | - Promoted from Faculty by the department SPOC.<br>- Post/create new department events.<br>- Assigned as event collaborator; can modify details, manage registrations, and manage (add/remove) other collaborators on assigned events. |
| **SPOC (Single Point of Contact)** | - Created and marked by the System Admin (one SPOC per academic department).<br>- Promote/demote department Faculty and Students to Coordinator status (min 1, max 4 each for Faculty and Student Coordinators).<br>- Manage (add/remove) collaborators on any active department event.<br>- View audit logs and active events within their department. |
| **System Admin** | - Uploads pre-seeded enrollment lists (CSV) of valid registration numbers.<br>- Manages user accounts and configures Keycloak realm.<br>- Assigns and configures the department SPOC users.<br>- Configures gateway routes, rate-limits, and infrastructure monitoring. |

## 4. Phase Boundaries (V1 vs. V2)

### Phase 1 (V1) - Current Scope
*   **Self-Registration with Unique ID Check:** Verification of self-registering users against a pre-seeded enrollment list. If the registration number is already in use, they are redirected to the login screen.
*   **Single OTP for Password Operations:** A single OTP (either email-based via Resend.com or SMS-based via Twilio) is used exclusively for password change and forgot password recovery.
*   **FCFS Waiting List & Promotion Limit:** If event capacity is full, registrations are placed in a `WAITING_LIST` state. When a confirmed registration cancels, the oldest waiting list registration is automatically promoted:
    *   *Free Event:* Promoted directly to `CONFIRMED`.
    *   *Paid Event:* Promoted to `PENDING_PAYMENT`. The student has a **24-hour time limit** to submit payment details, after which they are automatically cancelled and the next waiting list student is promoted.
*   **Manual UPI Payments:** QR code payment submission modal for active or promoted students.
*   **Manual Coordinator Verification:** Assigned collaborators (or SPOC) verify transaction details.
*   **Hierarchical User Management:** System Admin creates SPOC users. During creation, the admin sets a dummy password, which SPOCs can change later. A department SPOC can promote/create a minimum of 1 and maximum of 4 Faculty Coordinators, and the same (min 1, max 4) for Student Coordinators. For new coordinators, the SPOC sets a dummy password that they can change later.
*   **Core Event & Slot Management:** Event creation (Faculty Coordinator only), collaborator assignments (Faculty Coordinators & SPOC only), capacity caps, and row-level locking.
*   **PWA Web Push Notifications:** OS-level notifications for waiting list promotions and status updates.

### Phase 2 (V2) - Future Enhancements
*   **Razorpay Gateway Integration:** Direct online checkout without screenshot uploads or manual validation.
*   **Analytics Dashboards:** Automated charts showing registration rate trends, department-wise participation, and financial reconciliations.
*   **Automatic Reminders:** Scheduled push alerts for upcoming events.

---

## 5. Reference Documents
For detailed user interaction flows, styling tokens, and frontend architecture constraints, see the [User Flow and UI Development Documentation](user-flow-docs.md).
