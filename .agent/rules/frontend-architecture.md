---
trigger: always_on
description: Enforce the 3-Tier Frontend Architecture standards (View Layer, Data & State Layer, API & Service Layer) in app/frontend.
---

## frontend-architecture

All frontend code in `app/frontend` must adhere strictly to the **3-Tier Architecture** model. This ensures separation of concerns, high testability, and clean decoupling of visual, logic, and integration layers.

### 1. View Layer (`src/components/`, `src/components/ui/`, `src/pages/`)
- **Purpose**: Visual presentation and UI rendering.
- **Technologies**: React 19, HeroUI components, Tailwind CSS.
- **Rules**:
  - **No Direct API Calls**: Component files MUST NOT import or invoke raw API clients, `axios`, or files from `src/api/` directly.
  - **No Complex Business Logic**: Keep components presentational. UI state and action dispatching must be handled via custom hooks or stores.
  - **Reusability**: Use focused, single-responsibility components with strict TypeScript props interfaces.

### 2. Data & State Layer (`src/hooks/`, `src/store/` / `src/stores/`, `src/data/`)
- **Purpose**: Local form states, input validation, UI calculations, and global application state.
- **Technologies**: React Custom Hooks, Zustand stores, static configuration.
- **Rules**:
  - **Custom Hooks for Features**: Encapsulate complex UI form state, event handlers, and page-specific workflows in custom hooks.
  - **Zustand for Global State**: Store persistent application-wide state (e.g., authenticated sessions, theme preferences) in Zustand stores.
  - **Decoupling**: Keep business calculations and UI mapping helpers separate from UI components.

### 3. API & Service Layer (`src/services/`, `src/api/`)
- **Purpose**: Decoupled network communication, REST clients, API strategy orchestration, and error normalization.
- **Technologies**: Axios client, Strategy Pattern registries.
- **Rules**:
  - **Strategy Pattern**: Operations branching based on user role, action type, or provider protocol must use strategy registries. Adding a strategy must not modify core control flows.
  - **Axios Isolation**: Raw network requests and endpoint definitions reside exclusively in `src/api/`.
  - **No UI Imports**: Service files must never import React, custom hooks, or visual components.

### 4. Testing & Verification (`src/**/__tests__/`)
- **Framework**: Vitest (using `happy-dom`).
- **Rules**:
  - Test suites must reside in a `__tests__/` directory local to each layer (e.g., `src/api/__tests__/`, `src/components/__tests__/`).
  - Follow the docs-first testing lifecycle (STLC) before implementing functionality.
