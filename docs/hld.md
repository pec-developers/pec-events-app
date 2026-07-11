# High-Level Design (HLD)

## 1. Cross-System Architecture & Topology

The application utilizes a decoupled client-server architecture. To support a phased deployment, the topology evolves from a direct client-server model in Version 1 to a fully managed Kubernetes cluster in Version 2.

### 1.1 Version 1 Lightweight Architecture (Current Scope)

In Version 1, the infrastructure architecture is simplified to reduce complexity, while the underlying code writing styles are fully structured. The React SPA (built on a strict **3-Tier Architecture**) communicates directly with the Spring Boot backend (organized via a decoupled **Ports & Adapters** architecture). Authentication is delegated to Supabase Auth, while user profile data and relations are stored in Supabase PostgreSQL. User profile images, event assets (posters, banners, event photos), and payment transaction screenshots are uploaded directly from Spring Boot to AWS S3.

```mermaid
graph TD
    User([User Device]) -->|"Access SPA"| Frontend[React SPA Frontend]
    Frontend -->|"1. HTTPS API & Auth Requests"| SpringBoot[Spring Boot Backend]
    SpringBoot -->|"2. Proxy Auth Calls (GoTrue)"| SupabaseAuth[Supabase Auth GoTrue]
    SupabaseAuth -->|"3. Return Auth Session/JWT"| SpringBoot
    SpringBoot -->|"4. Return Response & Auth Cookie"| Frontend
    SpringBoot -->|"5. Store/Query Event & Profile Data"| SupabaseDB[(Supabase PostgreSQL)]
    SpringBoot -->|"6. Upload profile, event, & payment images"| S3[(AWS S3 Bucket)]
    SpringBoot -->|"7. Send Web Push Notifications"| User
```

#### V1 Infrastructure Components:
*   **Hosting:** Frontend assets (compiled React package) are hosted in a basic static file hosting service (e.g. AWS S3 + CloudFront).
*   **Backend Server:** The Spring Boot backend runs on a standard virtual server (e.g. AWS EC2, Elastic Beanstalk, or a simple container runner).
*   **Identity & Database:** Supabase Cloud hosts both the GoTrue Authentication provider and the PostgreSQL Database.
*   **Object Storage:** A dedicated AWS S3 bucket stores user profile images, event assets (banners, posters, event photos), and UPI verification screenshots.
*   **Notifications:** Delivered asynchronously using Java thread pools (`@Async` task executors) within the Spring Boot application (no RabbitMQ broker).

---

### 1.2 Version 2 Enterprise Architecture (Future Scope)

Version 2 introduces enterprise scaling and high availability. Services are hosted within an AWS Elastic Kubernetes Service (EKS) cluster. The Kong API Gateway handles routing, Keycloak acts as the Identity Provider, Redis caches high-frequency queries, and RabbitMQ processes asynchronous notifications.

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
    Keycloak -->|Send SMS OTP| MSG91[MSG91 SMS API]
    
    SpringBoot -->|Store/Query| Supabase[(Supabase Cloud PostgreSQL)]
    SpringBoot -->|"Upload profile, event, & payment images"| S3[(AWS S3 Bucket)]
    NotificationWorker -->|Push Notifications| User
```

#### V2 Infrastructure Components:
*   **EKS Kubernetes Deployments:** Deployed via Helm charts using isolated deployment configurations (`values-dev.yaml` and `values-prod.yaml`).
*   **Kong Gateway Entry Point:** Routes external traffic, intercepts `/auth/*` paths to Keycloak, and routes `/api/*` to Spring Boot backend services.
*   **Message Broker (RabbitMQ):** Handles event-driven decoupling and queuing of notification dispatches.
*   **In-Memory Caching (Redis):** Caches frequent queries (like event listings) and handles temporary rate-limiting.
*   **Federated Identity (Keycloak):** Performs OAuth 2.0 PKCE authentication with SMTP/SMS OTP dispatches.

---

## 2. Authentication Flow

### 2.1 Version 1 Authentication Flow (Supabase Auth)

In V1, authentication is managed directly by the frontend and Supabase Auth. The Spring Boot backend acts as a Resource Server validating incoming Supabase JWT tokens.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User (Student/Faculty)"
    participant App as React Frontend
    participant Backend as Spring Boot Backend
    participant Supabase as "Supabase Auth (GoTrue)"
    participant DB as Supabase DB

    User->>App: Submits Registration / Login Form
    App->>Backend: HTTPS API Call (Sign Up / Sign In via `/api/auth/*`)
    Backend->>Supabase: Forward Auth Request (GoTrue API)
    Supabase->>Supabase: Validate credentials / pre-seeded list
    Supabase-->>Backend: Returns Session with JWT Access Token
    Backend->>Supabase: Fetches JWKS Public Keys (Cached locally)
    Backend->>Backend: Validates JWT signature (ES256 JWKS or HS256 secret)
    
    rect rgb(230, 245, 255)
        note over Backend, DB: First-time Login Profile Sync
        Backend->>DB: Check if User ID exists
        alt User profile missing
            Backend->>DB: Sync user info (ID, name, email, phone_number, registration_number, department, role)
        end
    end
    
    Backend-->>App: Set HTTP-Only Cookie (`authToken`) & Return User Info
    App->>App: Store User Info in Zustand State Store
    App->>User: Render View based on Role
```

1.  **Proxied Login/Registration:** Frontend routes auth calls directly to the Spring Boot `/api/auth` proxy controllers. The backend invokes Supabase GoTrue REST endpoints on behalf of the client and retrieves the JWT session token.
2.  **JWT Cookie Injection & Verification:** Spring Boot sets the token inside an HTTP-only security cookie (`authToken`) on the response. For subsequent requests, the `SupabaseJwtFilter` extracts the JWT from the cookie (or the `Authorization` header), validates the signature symmetrically (using the local secret key) or asymmetrically (using Supabase JWKS endpoints), and sets the security context.
3.  **Profile Sync:** On first login, Spring Boot checks the local DB and creates a user profile row containing attributes derived from JWT claims.

---

### 2.2 Version 2 Authentication Flow (OAuth 2.0 + PKCE via Keycloak)

In V2, Keycloak manages authentication via Authorization Code Flow with PKCE behind the Kong Gateway.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User (Student/Faculty)"
    participant App as React Frontend
    participant Kong as Kong API Gateway
    participant Keycloak as Keycloak
    participant Resend as Resend.com
    participant MSG91 as MSG91
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
            Keycloak->>MSG91: Request SMS API Dispatch
            MSG91->>User: Deliver Reset OTP SMS
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
    2.  In V1, Spring Boot signs the payload and dispatches it directly and asynchronously via standard `@Async` methods. In V2, the dispatch event is put on a RabbitMQ queue, and a separate worker service processes the queues to send web push notifications via the browser's push service.
    3.  The push service wakes up the client Service Worker, displaying an OS-level notification popup.

---

## 4. Reference Documents
For detailed user interaction flows, styling tokens, and frontend architecture constraints, see the [User Flow and UI Development Documentation](user-flow-docs.md).
