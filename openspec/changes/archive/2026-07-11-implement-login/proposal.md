## Why

To support the deployment and operations of the Prathyusha Engineering College (PEC) Events App, we require a secure authentication and authorization foundation. This change implements the user registration and login flows, role-based access control (RBAC), and user profile database synchronization for V1, utilizing a server-side proxy to Supabase Auth.

## What Changes

- **Backend Auth Endpoints & Proxy**: Create `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/password/forgot`, `/api/auth/password/reset`, and a role-based status check `/api/auth/me` endpoint in the Spring Boot backend that proxies or validates requests with Supabase Auth.
- **JWT Verification & Security**: Implement `SupabaseJwtFilter` to intercept incoming API requests, validate Supabase JWT signatures, and populate Spring Security context.
- **Role-Based Access Control Aspect**: Introduce `@RequiresRole` annotation and an AOP aspect `RoleCheckAspect` to restrict controller endpoints based on user roles retrieved from the local database.
- **User Profile Synchronization**: Build a listener/handler to synchronize basic user profile information (email, name, role, department) from Supabase JWT details to the local PostgreSQL database on first successful login.
- **Frontend Authentication Layer**: Develop the React View, State, and API layers to manage login states, form inputs, session tokens in HTTP-only cookies, and client-side route protection.
- **Visual Presentation**: Render premium login and signup interfaces featuring PEC's maroon brand accents (#a80000), responsive screens, and loading skeletons.

## Capabilities

### New Capabilities
- `user-auth`: Direct user authentication and authorization using a server-side Supabase Auth proxy, managing session lifecycles, and checking database-mapped user roles for system-wide access control.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->

## Impact

- **Backend API (`app/backend`)**: New controller endpoints, custom filter configurations, AOP aspects for `@RequiresRole`, and domain service interfaces.
- **Frontend SPA (`app/frontend`)**: Zustand auth stores, protected route wrappers, Axios interceptors, page components (`Login.tsx`, `Register.tsx`), and Gravity UI Icons.
- **Database Schema**: Tables for users and roles to support role-based authentication check.
