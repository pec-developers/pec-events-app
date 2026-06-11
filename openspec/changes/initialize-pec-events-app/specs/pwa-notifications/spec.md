## ADDED Requirements

### Requirement: Real-Time Web Push Alerts
Users will receive OS-level push notifications for event status changes and registration status updates.

#### Scenario: User Subscribes to Push Alerts
- **WHEN** an authenticated user grants notification permissions in the PWA
- **THEN** the browser Service Worker retrieves a push subscription object using the server's public VAPID key and posts it to the Spring Boot backend to store in the database.

#### Scenario: Dispatch Push Alert via Service Worker
- **WHEN** the backend changes registration status or publishes a new event
- **THEN** it sends a cryptographically signed payload using VAPID keys to the browser's web push service, which wakes up the Service Worker to display an OS-level notification.
