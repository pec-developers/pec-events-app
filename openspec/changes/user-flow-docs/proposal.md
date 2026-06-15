## Why

When AI agents work on UI development for the PEC Events application, they need complete context regarding UI structure, design rules, state flow handling, and specific validation logic. While high-level requirements are defined in the BRD and PRD, a dedicated reference document for user flows and frontend integration constraints will prevent assumptions, styling inconsistencies, and incorrect routing or validation logic.

## What Changes

This change introduces a new specification for User Flow and UI Development Documentation, and a corresponding document `docs/user-flow-docs.md`. This document will explicitly detail:
1. Design & Aesthetic Guidelines (HeroUI, Maroon Red, typography, skeleton screens)
2. State Management & 3-Layer Frontend Architecture (api/stores/components)
3. Self-Registration & Dual OTP flows
4. Event Creation & Collaborator UX
5. Payment Modal & Upload limits (V1 Manual UPI vs V2 Razorpay)
6. Coordinator Verification Dashboard actions
7. FCFS Waiting List, Expiry timers, and dropout UX
8. PWA Notification Opt-in UI

## Capabilities

### New Capabilities
- `user-flow-docs`: Detailed UI and user flow reference specifications to guide frontend implementation, routing, layout structure, and validations.

### Modified Capabilities
- `project-documentation`: Update documentation requirements to include `docs/user-flow-docs.md` as a core project reference that must remain synchronized.

## Impact

- **Documentation**: A new file `docs/user-flow-docs.md` is added.
- **Specs**: A new capability spec is added to `openspec/specs/user-flow-docs/spec.md` (or within the delta specs).
- **Project Structure**: Development workflows will reference `docs/user-flow-docs.md` to ensure design consistency and robust user interaction logic.
