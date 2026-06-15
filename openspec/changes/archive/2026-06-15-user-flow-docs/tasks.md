## 1. Document Creation

- [x] 1.1 Create `docs/user-flow-docs.md` with structure for design system, layout routing, registration flow, payment modals, verification console, waitlist timers, collaborator assignment, and push notifications.

## 2. Content Drafting

- [x] 2.1 Document Design System details (HeroUI v3, Tailwind v4 setup on React 19, brand color #a80000, dark mode deep charcoal background #121212, and React Aria integration).
- [x] 2.2 Document Navigation and Layout Routing details (unified `/dashboard` route, role-based conditional components, and Keycloak claims checks).
- [x] 2.3 Document Self-Registration flow UI requirements (sequential Email and Phone OTP screens, error states, and registration ID uniqueness checks).
- [x] 2.4 Document Payment Submission Modal rules (UPI static QR component, 12-digit numeric transaction ID validation, 5MB file upload limit, and live upload thumbnail preview).
- [x] 2.5 Document Verification Dashboard split-screen specifications (left student metadata cards, right image pan/zoom/rotate viewer, and primary Approve/Reject actions).
- [x] 2.6 Document Waiting List promotion timers (dashboard countdown banner, color states, 24-hour expiration, and 12-hour grace period).
- [x] 2.7 Document Soft-Prompt Push Notification banner logic (value-proposition banner, service worker sub registration, and browser permission triggers).
- [x] 2.8 Document Collaborator Autocomplete Search flow (creator department filter, autocomplete chip inputs, and SPOC promoting capabilities).

## 3. User Flow Diagrams (Mermaid)

- [x] 3.1 Embed Mermaid diagram illustrating the step-by-step UI state transition for the Sequential Dual-OTP Self-Registration process.
- [x] 3.2 Embed Mermaid diagram showing the interaction flow between the Student's Payment Modal, Coordinator's Verification Split-Screen, and Waiting List countdown expiry.

## 4. Project Spec Integration

- [x] 4.1 Update project docs (`docs/brd.md`, `docs/prd.md`, `docs/hld.md`, `docs/lld.md`) to explicitly reference the newly created `docs/user-flow-docs.md` as the source of truth for frontend UI flows.
