# Capability: user-flow-docs

## Purpose
Establishes clear, consistent user flows, routing, and design guidelines for PEC Events Web Application UI development.

## ADDED Requirements

### Requirement: Design System and Accent Theme
The frontend user interface must strictly conform to PEC's official institutional brand identity using HeroUI v3, Tailwind CSS v4, and React Aria.

#### Scenario: Theme Configuration
- **WHEN** the application is loaded
- **THEN** the active layout defaults to light mode with support for dark mode, using Maroon Red (#a80000) as the primary brand accent for buttons, active state indicators, focus borders, and links, while using deep charcoal (#121212) for dark mode containers.

---

### Requirement: Unified Routing Layout
The application must present a single unified `/dashboard` route that adapts dynamically based on Keycloak token role claims.

#### Scenario: Role-Based Dashboard Elements
- **WHEN** a user logs in and accesses the `/dashboard` route
- **THEN** the layout renders a sidebar and navigation links tailored to their role (Student, Student Coordinator, Faculty Coordinator, SPOC, Admin) with corresponding access control checks.

---

### Requirement: Payment Submission Modal Validation
For paid events, the registration modal must enforce strict validations and provide real-time validation feedback to the student before submission.

#### Scenario: Payment Upload Validation
- **WHEN** a student scans the static UPI QR code and attempts to submit transaction details
- **THEN** the modal enforces:
  1. Exactly 12-digit numeric input for the UPI Transaction Reference ID.
  2. Maximum file size of 5MB for the payment screenshot.
  3. File extension limited strictly to `.png`, `.jpg`, or `.jpeg`.
  4. Real-time rendering of a thumbnail preview of the uploaded screenshot.

---

### Requirement: Verification Dashboard Split-Screen
The Coordinator dashboard must provide a split-screen layout in the Verification Modal to simplify transaction validation.

#### Scenario: Payment Review Interface
- **WHEN** a coordinator clicks on a registration in the `PENDING_PAYMENT_VERIFICATION` review queue
- **THEN** the Verification Modal displays:
  1. A left pane with copyable student details (Name, Reg No, Department, Email, Event Name) and the 12-digit Transaction ID.
  2. A right pane containing an interactive screenshot viewer with zoom, rotate, and full-screen controls.
  3. Action buttons (Approve/Reject) visible at the bottom of the modal.

---

### Requirement: Countdown Timer for Waiting List Expiry
The Student dashboard must display active countdown timers for registrations promoted from the waiting list.

#### Scenario: Visualizing Expiry and Grace Periods
- **WHEN** a student's registration is promoted to `PENDING_PAYMENT` (24-hour limit) or rejected with a `PAYMENT_REJECTED` state (12-hour grace period)
- **THEN** a prominent banner is rendered on their dashboard containing a ticking live countdown timer that changes color based on severity (green for >12h, orange for 2h-12h, and flashing red for <2h remaining) with a direct action button to pay or re-upload.

---

### Requirement: Autocomplete Collaborator Search
Faculty Coordinators must be able to search and assign collaborators within their department when publishing or modifying events.

#### Scenario: Collaborator Assignment
- **WHEN** a Faculty Coordinator or SPOC creates or modifies an event and clicks "Add Collaborators"
- **THEN** the UI provides an autocomplete search field that filters only active Faculty/Student coordinators of their department, rendering selected collaborators as removable badge chips with avatar pictures.

---

### Requirement: Soft Prompt Push Notifications
The application must use a soft-prompt UI to request Web Push Notification permissions from the user.

#### Scenario: Requesting Push Permission
- **WHEN** a user navigates to their dashboard after login and notification permission is ungranted
- **THEN** the UI displays an in-app banner explaining the utility of notifications (such as FCFS waiting list promotions) with a button that triggers the browser's native permission request dialog.
