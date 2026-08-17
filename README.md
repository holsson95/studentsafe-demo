# StudentSafe (Portfolio Demo)

**Live demo:** [studentsafe-demo-1.onrender.com](https://studentsafe-demo-1.onrender.com)
(hosted on Render's free tier — the first request after a period of inactivity can take
30–60s to wake the server up, so give it a moment on first load)

A **portfolio demo** of a real-world school case-management system originally built to help
guidance counselors and coordinators track student welfare cases. This copy has had all real
organization branding, student data, and external integrations removed or replaced with
fictional equivalents — it is safe to click around and explore.

**No real students, staff, or schools are represented anywhere in this demo.** All data is
seeded from a small fictional dataset, and the live student-information-system integration
(Alma) has been replaced with a mock that reads from the seeded database instead of making
any external network call.

## Tech stack

- **Frontend:** Vue 3 + Vite + TypeScript, Pinia, Vue Router, Chart.js
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Auth:** Email/password (bcrypt + JWT) and optional Google Sign-In

## Demo login credentials

The login page has a **"try a demo account" row of buttons** — one per role below — that
fills the email/password fields for you, so you don't need to type or copy anything. Click
a button, then click Sign In.

If you'd rather log in manually (or you're hitting the API directly), the password for
every account below is `DemoPass123!`.

| Access level | Role | Email |
|---|---|---|
| 0 | App Admin | `appadmin@demo.local` |
| 1 | Guidance Counselor | `counselor@demo.local` |
| 2 | Child Protection Officer | `coordinator@demo.local` |
| 3 | EHS Director | `district@demo.local` |
| 4 | Teacher | `teacher@demo.local` |

## Running locally

### 1. Database

Start Postgres however you like — Docker Compose is provided for local Postgres, or point
at a hosted instance (this demo runs on [Neon](https://neon.tech)'s free tier). Either way,
run every file in `server/migrations/` **in order, starting with `000_init_schema.sql`**
(the base schema), then `001` → `006`:

```sh
docker compose up -d postgres
psql "$DATABASE_URL" -f server/migrations/000_init_schema.sql
for f in server/migrations/00[1-6]_*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

### 2. Server

```sh
cd server
cp .env.example .env
# For local Postgres: fill in DB_*. For hosted Postgres (Neon/Render/etc.): set
# DATABASE_URL instead (it takes priority — see server/db.js). Either way, set a
# random JWT_SECRET.
npm install
node seed/demoData.js   # wipes and repopulates the DB with fictional demo data
npm run dev
```

`DEMO_MODE=true` in `.env.example` is required — it makes the Alma integration and invite
emails no-op against the seeded data instead of trying to reach real external services.

### 3. Client

```sh
cd client
npm install
npm run dev
```

Visit the client's local URL (printed by Vite, typically `http://localhost:5173`) and sign
in with any of the demo accounts above.

## What's different from the original app

- All real student/staff data has been removed. `server/seed/demoData.js` seeds a small set
  of fictional schools, buildings, cohorts, students, and cases instead.
- The Alma (SIS) integration (`server/services/almaService.js`) never makes a real network
  call in `DEMO_MODE` — it reads counts/rows from the already-seeded `alma_students` table.
- Invite emails (`server/services/emailService.js`) are logged, not sent, in `DEMO_MODE`.
- The scheduled case-reminder job only ever writes in-app notification rows — it never sends
  email or calls an external webhook.
- Git history from the original private repository has been discarded; this is a fresh,
  standalone history.
