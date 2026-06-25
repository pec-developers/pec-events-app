# High-Level Design (HLD)

## 1. Cross-System Architecture & Topology

The application utilizes a decoupled client-server architecture. The frontend is hosted as a static Single Page Application (SPA), while the APIs and Identity Management are managed inside an AWS Elastic Kubernetes Service (EKS) cluster. 

```mermaid
graph TD
    User([User Device]) -->|DNS / CDN| CF[AWS CloudFront / Route 53]
    CF -->|Serves Web Assets| Frontend[React SPA Frontend]
    Frontend -->|HTTPS API Requests| Kong[Kong API Gateway]
    
    subgraph EKS [AWS EKS Cluster]
        Kong -->|Proxy /auth/*| Keycloak[Keycloak IAM]
        Kong -->|Proxy /api/*| SpringBoot[Spring Boot Backend]
        SpringBoot -->|Read/Write Cache| Redis[(Redis Cache)]
        SpringBoot -->|Publish Events| RabbitMQ{RabbitMQ Broker}
        RabbitMQ -->|Consume Events| NotificationWorker[Notification Service / Spring Boot Worker]
    end
    
    Keycloak -->|Send Email OTP| Resend[Resend.com SMTP]
    Keycloak -->|Send SMS OTP| Twilio[Twilio SMS API]
    
    SpringBoot -->|Store/Query| Supabase[(Supabase Cloud PostgreSQL)]
    SpringBoot -->|Upload screenshots| S3[(AWS S3 Bucket)]
    NotificationWorker -->|Push Notifications| User
```

### 1.1 Infrastructure Components
*   **DNS & CDN Hosting:** Frontend assets (compiled React package) are hosted in AWS S3 and served through AWS CloudFront to reduce latency. Route 53 routes domains to the CloudFront distribution and the Kong API Gateway entry point.
*   **Infrastructure as Code (IaC):** Terraform scripts provision the network subnets (VPC), Route 53 DNS records, the S3 bucket for screenshots, and the EKS clusters.
*   **EKS Kubernetes Deployments:** Deployed via Helm charts using isolated deployment configurations (`values-dev.yaml` and `values-prod.yaml`).
*   **Managed Database:** PostgreSQL schemas are provisioned and hosted on managed Supabase Cloud.
*   **Asynchronous Message Broker (RabbitMQ):** Deployed inside the EKS cluster (via Helm/Operator) to handle event-driven decoupling and queuing of notification dispatches.
*   **In-Memory Caching (Redis):** Deployed inside EKS to cache frequent queries (like event listings) and handle temporary rate-limiting.

---

## 2. Authentication Flow (OAuth 2.0 + PKCE)

To secure user access, the application implements the **Authorization Code Flow with Proof Key for Code Exchange (PKCE)**. 

### 2.1 Role Creation & Assignment Flow
1.  **Account Self-Registration:** Students and Faculty register themselves within the application using their registration number, email, and phone number. Keycloak handles the registration flow, validating credentials against a pre-seeded enrollment list. No OTP is required during registration. If the registration number already exists, Keycloak redirects the user back to the login screen.
2.  **Forgot Password / Password Change (Single OTP):** Users can recover or change their passwords via Keycloak's portal, prompting a single OTP dispatch to either their registered Email (via Resend.com SMTP relay) or Phone Number (SMS via Twilio).
3.  **SPOC Assignment:** The Admin assigns the `SPOC` role to specific faculty members in Keycloak and binds them to a specific department in the database. During SPOC creation, the admin sets a dummy password (changeable by the SPOC later).
4.  **Coordinator Promotion:** Department SPOCs use a dashboard to promote/create coordinator roles within their department (min 1, max 4 Faculty Coordinators, and min 1, max 4 Student Coordinators per department). The SPOC sets a dummy password for new coordinators that they can change later.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User (Student/Faculty)"
    participant App as React Frontend
    participant Kong as Kong API Gateway
    participant Keycloak as Keycloak
    participant Resend as Resend.com
    participant Twilio as Twilio
    participant Backend as Spring Boot Backend
    participant DB as Supabase DB

    User->>App: Clicks Login / Register
    App->>Keycloak: Redirect to Keycloak with Code Challenge (via Kong /auth/*)
    Keycloak->>User: Present Login / Registration Form
    alt User is Registering
        User->>Keycloak: Submits registration info
        Keycloak->>Keycloak: Validate against pre-seeded enrollment list
        Keycloak->>Keycloak: Create User Account
    else User is Logging In
        User->>Keycloak: Submits credentials
    end
    alt Forgot / Change Password Request
        User->>Keycloak: Requests Password Reset OTP
        alt Choose Email Channel
            Keycloak->>Resend: Request SMTP Dispatch
            Resend->>User: Deliver Reset OTP Email
        else Choose Phone Channel
            Keycloak->>Twilio: Request SMS API Dispatch
            Twilio->>User: Deliver Reset OTP SMS
        end
        User->>Keycloak: Submits OTP & Resets Password
    end
    Keycloak->>App: Redirect back with Authorization Code
    App->>Keycloak: Request Token with Auth Code + Code Verifier
    Keycloak->>App: Return JWT Access & Refresh Tokens
    App->>App: Save JWT inside Zustand State Store
    App->>Kong: API Request (Authorization: Bearer <token>)
    Kong->>Backend: Forward Request with verified JWT
    
    rect rgb(230, 245, 255)
        note over Backend, DB: First-time Login Profile Sync
        Backend->>DB: Check if User ID exists
        alt User profile missing
            Backend->>DB: Synchronize user info (ID, name, email, phone_number, registration_number, department, role)
        end
    end
    
    Backend->>App: Return REST API Response
    App->>User: Render View based on Role
```

### 2.2 Networking & Security Boundaries
1.  **Kong Gateway Integration:** All API calls target Kong. It intercepts `/auth/*` and forwards requests to Keycloak, and routes `/api/*` to the Spring Boot cluster.
2.  **JWT Verification:** Spring Boot serves as an OAuth2 Resource Server. It validates the signature of incoming JWTs against Keycloak's public keys.

---

## 3. Web Push Notification Architecture

PWA notifications are native and run independently of external notification engines (like Firebase Cloud Messaging) using Service Workers.

*   **VAPID Key Pair:** A cryptographic signature pair. The public key is exposed on the frontend, and the private key is held securely by the Spring Boot backend.
*   **Subscription Flow:**
    1.  The user authorizes notification prompts in the browser.
    2.  The Service Worker registers a push subscription using the public VAPID key.
    3.  The subscription object (containing endpoint and keys) is saved in Supabase via Spring Boot backend APIs.
*   **Dispatch Flow:**
    1.  When a waiting list student is promoted (either to `CONFIRMED` or `PENDING_PAYMENT`), or a coordinator publishes a new event, Spring Boot fetches the targeted user's subscription record.
    2.  The backend signs a payload with the private VAPID key and sends it to the browser's web push service.
    3.  The push service wakes up the client Service Worker, displaying an OS-level notification popup.

---

## 4. Reference Documents
For detailed user interaction flows, styling tokens, and frontend architecture constraints, see the [User Flow and UI Development Documentation](user-flow-docs.md).

