# Business Requirements Document (BRD)

## 1. Project Overview
Prathyusha Engineering College (PEC) requires a Progressive Web App (PWA) to serve as a central hub for student event notifications, discovery, registration, and payment. The goal is to digitize event coordination, automate notifications, and streamline payment verification.

## 2. Business Goals
*   **Centralized Discovery:** Enable students to browse all active college events (academic, cultural, technical) in one application.
*   **Simple Registration:** Allow instant registration for free events and streamlined payment details upload for paid events.
*   **Effortless Coordination:** Empower Faculty and Student Coordinators to publish events and track registration analytics.
*   **Real-time Alerts:** Notify students of new events or registration status updates via PWA push notifications.

## 3. User Roles & Access Control Policy
The application supports five distinct user roles with hierarchical authority. Authentication is role-specific using registration numbers or email:
- **Admin**: Logs in using **Email** and password.
- **SPOC & Faculty Coordinator**: Logs in using **Faculty Registration Number** and password.
- **Student & Student Coordinator**: Logs in using **Student Registration Number** and password.

The maximum limits of coordinators permitted per department (initially 1 SPOC, 3 Faculty Coordinators, and 3 Student Coordinators) are stored in the database and dynamically configurable by the Admin.

| Role | Login Identifier | Description / Permissions / Constraints |
| :--- | :--- | :--- |
| **Student / Participant** | Student Reg Num | - Browse events, view schedules, and register.<br>- Joins the FCFS Waiting List if the event is at full capacity.<br>- Submits/updates UPI transaction screenshots for paid registrations.<br>- View all their past registrations.<br>- Edit profile details (name, email, phone number, profile image) only; theme switching. |
| **Student Coordinator** | Student Reg Num | - Read all events.<br>- Create, read, update, and delete **only draft events** within their department. Cannot modify active/published events.<br>- Read, update, and delete registrations for their department.<br>- Export registration details to CSV with custom-selected fields.<br>- Can also perform all standard Student actions. |
| **Faculty Coordinator** | Faculty Reg Num | - CRUD all events (draft and active).<br>- Read, update, and delete event registrations.<br>- Export registration details to CSV with custom-selected fields. |
| **SPOC (Single Point of Contact)** | Faculty Reg Num | - CRUD student coordinators' and faculty coordinators' profiles (subject to Admin-configured department limits).<br>- Seed student profiles in the enrollment database.<br>- Read all events; can delete events of their department. |
| **System Admin** | Email | - CRUD all users (specifically SPOC account setup and management flows).<br>- CRUD academic departments.<br>- CRUD system configuration limits per department dynamically.<br>- Read, update, and delete any event in the system (explicitly **blocked** from accessing participant registration details/lists). |

## 4. Phase Boundaries (V1 vs. V2)

### Phase 1 (V1) - Current Scope
*   **Architecture & Deployment:** Direct React frontend to Spring Boot backend connection (no gateway). Supabase Cloud acts as both the Authentication Provider (GoTrue) and PostgreSQL Database. AWS S3 handles storage of user profile images, event assets (banners, posters, event photos), and payment verification screenshot uploads. Deployed as simple containers/VMs.
*   **Code Architecture Style:** Enforced from the start:
    *   *Frontend*: Strict **3-Tier Architecture** (separating View components, custom hooks/Zustand stores, and API network clients).
    *   *Backend*: **Ports & Adapters (Hexagonal)** layout, decoupling business logic interfaces (`service/port/`) and implementations (`service/`) from data transfer models (`model/dto/`) and database persistence schemas (`model/entity/`). Segregates controller classes by role boundaries.
*   **Authentication & Registration:** Frontend directs all authentication and account management requests (credentials-based sign-up, credentials-based sign-in) through the Spring Boot backend (`/api/auth` proxy routes), which interacts with Supabase Auth on the server-side. Spring Boot validates JWT signatures symmetrically (using the shared secret) or asymmetrically (using Supabase JWKS public keys) via a custom `SupabaseJwtFilter`. User attributes sync on first successful login.
*   **Role-Based Security:** Spring Boot aspect `@RequiresRole` checks request permissions by querying the user role from the local database via `RoleService`.
*   **Profile-Driven Configuration:** Separates local development and cloud integration. Default settings fallback to local postgres instances, and the active `aws` profile imports credentials dynamically from AWS Secrets Manager using Spring Cloud AWS.
*   **Local Test Emulators:** Supports offline development via a local MinIO bucket emulator (port 9000) for S3 profile, event, and payment uploads, and local Inbucket SMTP catcher (port 54324) for email OTP captures.
*   **Notifications & Caching:** Push notifications are triggered asynchronously using simple Spring Boot `@Async` task executors. No Redis caching or RabbitMQ broker.
*   **Self-Registration with Unique ID Check:** Verification of self-registering users against a pre-seeded enrollment list. If the registration number is already in use, they are redirected to the login screen.
*   **Single OTP for Password Operations:** A single OTP (dispatched via Supabase email/SMS configurations) is used exclusively for password change and forgot password recovery.
*   **FCFS Waiting List & Promotion Limit:** If event capacity is full, registrations are placed in a `WAITING_LIST` state. When a confirmed registration cancels, the oldest waiting list registration is automatically promoted:
    *   *Free Event:* Promoted directly to `CONFIRMED`.
    *   *Paid Event:* Promoted to `PENDING_PAYMENT`. The student has a **24-hour time limit** to submit payment details, after which they are automatically cancelled and the next waiting list student is promoted.
*   **Manual UPI Payments:** QR code payment submission modal for active or promoted students.
*   **Manual Coordinator Verification:** Assigned collaborators (or SPOC) verify transaction details.
*   **Hierarchical User Management:** System Admin creates SPOC users. During creation, the admin sets a dummy password, which SPOCs can change later. A department SPOC can promote/create a maximum of 3 Faculty Coordinators, and the same (max 3) for Student Coordinators. For new coordinators, the SPOC sets a dummy password that they can change later.
*   **Core Event & Slot Management:** Event creation (by Student or Faculty Coordinators), event publishing (restricted to Faculty Coordinators & SPOCs to avoid miscommunication and ensure safety), collaborator assignments (Faculty Coordinators & SPOC only), capacity caps, and row-level locking.
*   **PWA Web Push Notifications:** OS-level notifications for waiting list promotions and status updates.

### Phase 2 (V2) - Future Enhancements
*   **Enterprise Scaling (EKS, Kong, Keycloak, Redis, RabbitMQ):** Introduce AWS EKS deployments managed by Helm. Expose APIs behind Kong API Gateway (`/auth/*` proxies to Keycloak, `/api/*` to Spring Boot). Migrate identity management to Keycloak (with dual-channel SMTP/SMS OTP setup). Introduce Redis caching for read queries and RabbitMQ broker for notification buffering.
*   **Razorpay Gateway Integration:** Direct online checkout without screenshot uploads or manual validation.
*   **Analytics Dashboards:** Automated charts showing registration rate trends, department-wise participation, and financial reconciliations.
*   **Automatic Reminders:** Scheduled push alerts for upcoming events.

---

## 5. Reference Documents
For detailed user interaction flows, styling tokens, and frontend architecture constraints, see the [User Flow and UI Development Documentation](user-flow-docs.md).

