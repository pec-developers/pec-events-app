# Business Requirements Document (BRD)

## 1. Project Overview
Prathyusha Engineering College (PEC) requires a Progressive Web App (PWA) to serve as a central hub for student event notifications, discovery, registration, and payment. The goal is to digitize event coordination, automate notifications, and streamline payment verification.

## 2. Business Goals
*   **Centralized Discovery:** Enable students to browse all active college events (academic, cultural, technical) in one application.
*   **Simple Registration:** Allow instant registration for free events and streamlined payment details upload for paid events.
*   **Effortless Coordination:** Empower Faculty and Student Coordinators to publish events and track registration analytics.
*   **Real-time Alerts:** Notify students of new events or registration status updates via PWA push notifications.

## 3. User Roles & Access Control Policy
The application supports four user roles. The registration policy allows users to sign up with any email domain; event coordinators will manually verify identities and registrations if necessary.

| Role | Description / Permissions |
| :--- | :--- |
| **Student / Participant** | - Browse events, view schedules, and register.<br>- Submit UPI payment screenshots and transaction IDs for paid events.<br>- Receive OS-level and in-app notifications. |
| **Student Coordinator** | - Create and publish new college events.<br>- View event registrations and participant details.<br>- Approve or reject registrations and verify UPI screenshots. |
| **Faculty Coordinator** | - Create, publish, edit, or delete college events.<br>- View registrations and audit logs.<br>- Verify/approve payments and registrations.<br>- Manage Student Coordinators (promote/demote/assign). |
| **System Admin** | - Configure Keycloak authentication, client scopes, and API routes.<br>- Manage user accounts, role mappings, and system settings.<br>- Monitor system infrastructure logs and database connection pools. |

## 4. Phase Boundaries (V1 vs. V2)

### Phase 1 (V1) - Current Scope
*   **Manual UPI Payments:** System displays a static UPI QR code. The student makes the transfer using an external UPI application, inputs the Transaction ID (UPI Reference Number), and uploads a screenshot of the confirmation page.
*   **Manual Coordinator Verification:** Coordinators review transaction screenshots and Reference IDs from a dashboard, manually clicking Approve/Reject.
*   **Core Event & Slot Management:** Event creation, capacity caps, and row-level locking to prevent overselling.
*   **PWA Web Push Notifications:** Basic setup using Service Workers and VAPID keys.

### Phase 2 (V2) - Future Enhancements
*   **Razorpay Gateway Integration:** Direct online checkout without screenshot uploads or manual validation.
*   **Analytics Dashboards:** Automated charts showing registration rate trends, department-wise participation, and financial reconciliations.
*   **Automatic Reminders:** Scheduled push alerts for upcoming events.
