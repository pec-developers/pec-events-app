# Business Requirements Document (BRD)

## 1. Project Overview
Prathyusha Engineering College (PEC) requires a Progressive Web App (PWA) to serve as a central hub for student event notifications, discovery, registration, and payment. The goal is to digitize event coordination, automate notifications, and streamline payment verification.

## 2. Business Goals
*   **Centralized Discovery:** Enable students to browse all active college events (academic, cultural, technical) in one application.
*   **Simple Registration:** Allow instant registration for free events and streamlined payment details upload for paid events.
*   **Effortless Coordination:** Empower Faculty and Student Coordinators to publish events and track registration analytics.
*   **Real-time Alerts:** Notify students of new events or registration status updates via PWA push notifications.

## 3. User Roles & Access Control Policy
The application supports five distinct user roles with hierarchical authority. Students and Faculty utilize existing accounts pre-created by the System Admin.

| Role | Description / Permissions |
| :--- | :--- |
| **Student / Participant** | - Logs in using pre-created student accounts.<br>- Browse events, view schedules, and register.<br>- Joins the First-Come, First-Served (FCFS) Waiting List if the event is at full capacity.<br>- For paid events, submits UPI transaction screenshots and IDs after promotion.<br>- Receives push notifications. |
| **Student Coordinator** | - Promoted from Student by the department SPOC.<br>- Assigned as event collaborator by Faculty or other assigned coordinators.<br>- Modify details and manage registrations (verify payments/approve) *only* for assigned events. |
| **Faculty Coordinator** | - Promoted from Faculty by the department SPOC.<br>- Post/create new department events.<br>- Assigned as event collaborator; can modify details, manage registrations, and add/remove other collaborators on assigned events. |
| **SPOC (Single Point of Contact)** | - Created and marked by the System Admin (one SPOC per academic department).<br>- Promote/demote department Faculty and Students to Coordinator status.<br>- View audit logs and active events within their department. |
| **System Admin** | - Pre-creates and manages user logins (Keycloak accounts) for students and faculty.<br>- Assigns and configures the department SPOC users.<br>- Configures system authentication, Kong API Gateway configurations, and infrastructure monitoring. |

## 4. Phase Boundaries (V1 vs. V2)

### Phase 1 (V1) - Current Scope
*   **FCFS Waiting List & Dropout Flow:** If event capacity is full, registrations are placed in a `WAITING_LIST` state. When a `CONFIRMED` student cancels registration, the oldest waiting list student (by `created_at` ASC) is automatically promoted:
    *   *Free Event:* Promoted directly to `CONFIRMED`.
    *   *Paid Event:* Promoted to `PENDING_PAYMENT` (notified to submit payment).
*   **Manual UPI Payments:** System displays a static UPI QR code to students with `CONFIRMED` slots (or promoted waiting list students). The student submits the 12-digit transaction ID and uploads a payment verification screenshot.
*   **Manual Coordinator Verification:** Coordinators assigned to an event review transaction screenshots and Reference IDs from a dashboard, manually clicking Approve/Reject.
*   **Hierarchical User Management:** Admin creates SPOCs; SPOCs promote/demote Coordinators.
*   **Core Event & Slot Management:** Event creation (Faculty Coordinator only), collaborator assignments, capacity caps, and row-level locking to prevent overselling.
*   **PWA Web Push Notifications:** Notification registration via Service Workers to alert users upon promotion and registration status updates.

### Phase 2 (V2) - Future Enhancements
*   **Razorpay Gateway Integration:** Direct online checkout without screenshot uploads or manual validation.
*   **Analytics Dashboards:** Automated charts showing registration rate trends, department-wise participation, and financial reconciliations.
*   **Automatic Reminders:** Scheduled push alerts for upcoming events.
