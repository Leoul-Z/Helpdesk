# HelpDesk

A role-based IT/facilities ticketing system that lets employees report issues, technical staff resolve them, and managers coordinate assignments and track team workload.

The app enforces a structured ticket lifecycle — **Open → Assigned → In Progress → Resolved → Closed** — with each transition restricted to the role responsible for it: employees create tickets and confirm final resolution, technical staff move their assigned tickets through active work, and managers assign tickets and oversee the full queue.

---

## Architecture

Two independently deployed apps communicating over HTTP:

- **`/server`** — Express REST API, Prisma ORM, PostgreSQL (hosted on Neon), JWT authentication (via `Authorization: Bearer <token>` header)
- **`/client`** — React (Vite), React Router, React Hook Form + Zod
- **`/shared`** — Zod validation schemas and the status-transition matrix, imported by both apps so validation and workflow rules stay in sync rather than duplicated

**Deployed at:**
- API: `https://helpdesk-eclu.onrender.com`
- Client: `https://helpdesk-one-rho.vercel.app`

For full schema, API route table, and design details, see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Express.js, Node.js |
| Database | PostgreSQL (Neon), Prisma ORM |
| Frontend | React, Vite, React Router |
| Validation | Zod (shared client/server) |
| Forms | React Hook Form |
| Auth | JWT (access + refresh tokens) |
| Deployment | Render (API), Vercel (client) |

---

## Features

- Role-based dashboards:
  - **Manager** — full ticket breakdown by status and priority, team-wide visibility
  - **Technical** — assigned workload, open-ticket count
  - **Employee** — personal tickets, tickets awaiting their confirmation
- Filterable, searchable, sortable ticket list (status, priority, category, assigned technician, title search)
- Ticket detail view with a unified activity timeline (status changes, assignments, comments)
- Server-enforced role and status-transition rules — a role can only move a ticket through the transitions it's actually permitted, independent of frontend UI state

---

## Project Structure

```
HelpDesk/
├── client/          # React frontend (Vite)
├── server/          # Express backend
│   ├── prisma/      # schema.prisma, migrations, seed.js
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── app.js
├── shared/
│   ├── validations/ # Zod schemas
│   └── transitions.js
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 20+
- A PostgreSQL database (this project uses [Neon](https://neon.tech))

### 1. Clone the repo
```bash
git clone https://github.com/Leoul-Z/Helpdesk
cd Helpdesk
```

### 2. Backend setup
```bash
cd server
npm install
```

Copy `.env.example` to `.env` and fill in your own values:
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
PORT=3000
CLIENT_URL=http://localhost:5173
```

Install `shared/`'s dependencies separately (needed since `shared/` isn't installed automatically via the server's `npm install`):
```bash
cd ../shared
npm install
cd ../server
```

Run migrations and seed the database:
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Start the server:
```bash
npm run dev
```
API runs at `http://localhost:3000`.

### 3. Frontend setup
```bash
cd ../client
npm install
```

Copy `.env.example` to `.env`:
```
VITE_API_URL=http://localhost:3000/api
```

Start the dev server:
```bash
npm run dev
```
Client runs at `http://localhost:5173`.

---

## Seeded Login Credentials

All seeded users share the password `password123`.

| Role | Email |
|---|---|
| Manager | manager1@company.com |
| Manager | manager2@company.com |
| Technical | tech1@company.com |
| Technical | tech2@company.com |
| Technical | tech3@company.com |
| Employee | emp1@company.com |
| Employee | emp2@company.com |
| Employee | emp3@company.com |

---

## API Overview

All routes are prefixed with `/api`.

| Method | Route | Role(s) |
|---|---|---|
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| POST | `/auth/logout` | authenticated |
| POST | `/tickets` | EMPLOYEE |
| GET | `/tickets` | all (role-scoped) |
| GET | `/tickets/:id` | all |
| GET | `/tickets/stats` | all (role-scoped) |
| PATCH | `/tickets/:id/assign` | MANAGER |
| PATCH | `/tickets/:id/status` | TECHNICAL, MANAGER |
| POST | `/tickets/:id/comments` | all (participant) |
| PATCH | `/tickets/:id/confirm` | EMPLOYEE |

Full details, including request/response shapes and the status-transition matrix, are in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Known Limitations

- Ticket number generation (`TKT-001`, etc.) uses a simple count-based approach rather than an atomic counter — under simultaneous ticket creation, this could theoretically produce a collision. Acceptable at this project's scale.
- `shared/` requires its own separate `npm install` (both locally and in deployment build steps) rather than being hoisted via npm workspaces — a known tradeoff for keeping setup simple at this project's size.
- Logout does not perform server-side token invalidation (JWTs remain valid until natural expiry); this is a stateless-JWT tradeoff reasonable at this scope, though a production system would track and revoke refresh tokens.

---

## Deployment Notes

- **Render (API):** Root Directory set to `server`. Build command installs both `server/` and `shared/` dependencies and runs migrations:
  ```
  npm install && npx prisma generate && npx prisma migrate deploy && cd ../shared && npm install
  ```
  Start command: `node src/app.js`
- **Vercel (Client):** `VITE_API_URL` must be set in Vercel's Production environment **before** the build runs, since Vite bakes it into the bundle at build time — a fresh deploy is required after changing it. A `vercel.json` rewrite rule is included to support client-side routing on refresh:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
