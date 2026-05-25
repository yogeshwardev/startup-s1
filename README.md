# CampusArena

CampusArena is a college-exclusive competitive coding and career preparation platform with student, teacher, and admin portals. This MVP uses React, Tailwind CSS, Monaco Editor, Express, MongoDB, Redis, Socket.IO, and Docker-isolated code execution.

## Structure

- `client` React frontend with role-aware dashboards
- `server` Express API, JWT auth, RBAC, leaderboards, analytics, and queue-backed evaluation
- `docker` container configs for the app and secure code runner

## Core capabilities

- College-email registration and JWT login
- Docker-only code execution for Python, C, C++, and Java
- Hidden test evaluation and submission history
- Global and department leaderboards with live WebSocket updates
- Department war aggregation
- Teacher analytics and admin messaging
- Admin problem management, user management, and analytics
- Fitness and nutrition suggestion engine

## Local setup

1. Copy `server/.env.example` to `server/.env`.
2. Replace `JWT_SECRET` and `ADMIN_SEED_PASSWORD` with strong unique values before a production deployment.
3. Copy `client/.env.example` to `client/.env` only for host-based development overrides.
4. For Docker deployment, add `VITE_RAZORPAY_KEY_ID=<public-key-id>` to a root `.env` file so it is injected during the frontend build.
5. Start Docker Desktop or another Docker engine.
6. Run `docker compose up --build` to start the production web app, API, MongoDB, Redis, and isolated runner image.

Infrastructure services:

- MongoDB: `mongodb://localhost:27017`
- Redis: `redis://localhost:6379`

Application services when deployed through Docker:

- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api`

## Direct development without Compose

Backend:

```powershell
cd server
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

Frontend:

```powershell
cd client
npm.cmd install
npm.cmd run dev
```

The development frontend runs at `http://localhost:3000` and proxies `/api` to the host backend.

You still need MongoDB, Redis, and Docker running locally because submissions are evaluated in isolated containers and never on the host.

## Execution sandbox

Every execution is designed to:

- run in a Docker container
- use `--network none`
- enforce CPU and memory limits
- use a 3 second timeout
- mount isolated temp files only

Language commands:

- Python: `python3 main.py`
- C: `gcc main.c -o main && ./main`
- C++: `g++ main.cpp -o main && ./main`
- Java: `javac Main.java && java Main`

## Seed data

```powershell
cd server
npm.cmd install
npm.cmd run seed
```

This creates an admin account and sample problem data. In production, `ADMIN_SEED_PASSWORD` must be set before seeding.

## Default admin seed

- Email: `admin@campusarena.edu`
- Password: `Admin@123` in development only; production uses `ADMIN_SEED_PASSWORD`.

## Notes

- The backend expects the host machine to have both the Docker CLI and Docker engine available.
- Redis powers the BullMQ queue for parallel execution handling.
- Socket.IO broadcasts leaderboard refreshes after successful evaluation jobs.
