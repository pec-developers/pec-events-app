# PEC Events App (Backend + Expo Frontend)

A full-stack events application with:
- Backend: Node.js + Express (TypeScript), JWT auth, Supabase data access, AWS S3 for images, optional CloudFront signed URLs
- Frontend: React Native (Expo Router), targeting web and mobile
- Dev tooling: Docker Compose, Jest test suites, optional Cloudflare tunnel

This repository is a monorepo with both backend and frontend.

## Repository Structure

- backend/ — Express API (TypeScript)
- frontend/ — Expo app (React Native + Expo Router)
- nginx/ — Example reverse-proxy config (not used by default in compose)
- docker-compose.yml — Dev stack (backend, frontend, optional backend tunnel)

## Prerequisites

- Node.js 18+
- npm 10+
- Docker + Docker Compose (recommended for dev)
- Expo Go (if testing on a physical device)

## Quick Start (Docker Compose)

From repository root:

```bash
# 1) Start backend + frontend (Expo dev server) services
docker compose up -d backend frontend

# Optional: start the backend tunnel to get a public HTTPS URL
# (useful for testing the Expo app from a device off your LAN)
docker compose up -d backend_tunnel

# 2) Tail logs
docker compose logs -f --tail=200
```

Endpoints and URLs in dev:
- Backend API: http://localhost:5000/api
- Expo dev tools / Metro: available on http://localhost:19006 (web) and ports 19000-19002 for native flows

Note: The compose file sets EXPO_PUBLIC_API_URL for the frontend to http://backend:5000 so the web build inside the container can reach the API by service name. If you access from a host browser, set a matching .env in frontend to point to your host (see Frontend env below).

## Environment Variables

### Backend (.env)
Create backend/.env (see backend/.env.example for all keys):

```
# Express
PORT=5000
NODE_ENV=development
TRUST_PROXY=2

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_secure_jwt_secret

# AWS (S3 uploads for event images)
AWS_PEC_ACCESS_KEY_ID=...
AWS_PEC_SECRET_ACCESS_KEY=...
AWS_S3_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your_bucket

# CloudFront (optional, for signed URLs)
CLOUDFRONT_DOMAIN=your_distribution_domain
CLOUDFRONT_KEY_PAIR_ID=...
CLOUDFRONT_SECRET_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Important:
- JWT_SECRET is mandatory; the app exits on startup if missing.
- Supabase URL/key are required (the app throws if missing).
- If AWS vars are not fully set, S3 operations will warn/fail.
- If CloudFront vars are provided, URLs can be signed via utils/event.utils.ts.

### Frontend (.env)
Create frontend/.env and point it to your API host:

```
# For web and local emulators
EXPO_PUBLIC_API_URL=http://localhost:5000

# If running on a physical device on your LAN, use your host LAN IP
# EXPO_PUBLIC_API_URL=http://192.168.1.100:5000

# If using a public tunnel (e.g., backend_tunnel)
# EXPO_PUBLIC_API_URL=https://<random>.trycloudflare.com
```

The frontend resolves the API base URL as follows:
1) expoConfig.extra.apiUrl (if provided during build)
2) EXPO_PUBLIC_API_BASE_URL or EXPO_PUBLIC_API_URL (env)
3) Fallback in code: a default AWS API Gateway URL stub — change or override via env for development

Code reference: frontend/src/config/api.ts

## Running Locally (without Docker)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill values
npm run dev            # ts-node-dev
```
- API available at http://localhost:5000/api
- Health checks: GET / and GET /healthz

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # (if present) or create .env and set EXPO_PUBLIC_API_URL
npm run web            # or: npm start / npm run android / npm run ios
```

## API Overview

Routers are mounted in backend/src/index.ts as:
- /api/student — public (no auth)
- /api/publisher — protected (JWT + role=publisher)
- /api — auth endpoints

### Auth
- POST /api/login — body: { username, password } → { success, token, userRole }
- POST /api/register — body: { username, password, user_role, department, fullname, mailid } → 201 on success

### Student
- GET /api/student/events?dept=&type=&name=
- GET /api/student/events/:eventId — UUID required

### Publisher (requires Authorization: Bearer <JWT> with role=publisher)
- GET /api/publisher/events?dept=&type=&name=
- GET /api/publisher/events/:eventId
- POST /api/publisher/events — multipart/form-data
  - fields: data (JSON string with event payload), image (file, optional)
- PUT /api/publisher/events/:eventId — multipart/form-data
  - At least one of data or image is required
- DELETE /api/publisher/events/:eventId
- GET /api/publisher/profile — based on req.user.userId

Validation:
- Zod schema validates create payload in publisher POST
- UUID format is checked for :eventId routes

Errors:
- Consistent 400 for invalid inputs
- 401 for unauthenticated, 403 for bad/expired token or insufficient role
- 404 for not found
- 500 for service/storage errors (e.g., S3 upload error)

## Security & Middleware
- helmet for secure headers
- express-rate-limit (100 req / 15 min / IP)
- CORS
  - Dev: open
  - Prod: restricted to FRONTEND_URL
- Trust proxy configurable via TRUST_PROXY
- JWT auth middleware in backend/src/middleware/auth.middleware.ts

## Storage
- Images are uploaded to S3 via backend/src/aws-s3.ts
- Optional CloudFront signed URLs via backend/src/utils/event.utils.ts

## Testing

### Backend
```bash
cd backend
npm test
```
What’s covered:
- Route tests for student, auth, publisher (unit-style with mocks)
- Integration tests for publisher routes behind authenticateToken + authorizeRoles using real JWTs
- Multipart image upload paths in POST/PUT

### Frontend
```bash
cd frontend
npm test
```
- Basic render tests via jest-expo

## Dev Tunnels (optional)

A Cloudflare Quick Tunnel container is included in compose for the backend:
```bash
docker compose up -d backend backend_tunnel
docker compose logs -f backend_tunnel | cat
```
Copy the https://<random>.trycloudflare.com URL from logs and set EXPO_PUBLIC_API_URL to it in frontend/.env when needed.

## Nginx (optional)

See nginx/nginx.conf for an example reverse-proxy (frontend on /, backend on /api/). Not enabled in docker-compose by default; adapt as needed for your deployment.

## CI

- .github/workflows/backend-ci.yml runs backend tests in CI

## Troubleshooting
- JWT_SECRET missing → backend exits on start
- Supabase URL/key missing → startup throws; set variables
- S3/CloudFront operations failing → verify AWS and CloudFront envs and permissions
- CORS blocked in prod → set FRONTEND_URL accordingly
- Device cannot reach backend → set EXPO_PUBLIC_API_URL to a reachable host or start backend_tunnel

## License
MIT
