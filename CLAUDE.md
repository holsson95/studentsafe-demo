# CLAUDE.md — Portfolio Demo Conversion

This repo is a **duplicate of a private production app** (AEG-StudentSafe, a school
guidance-office case management system) that is being turned into a **public,
read-only-safe portfolio demo**. Anyone with the link may click around it. Your job is to
strip everything that identifies the original organization, any real people, or the
original project's history, and replace real data/integrations with safe fakes — without
breaking the ability for a visitor to actually use the app.

Treat this as a one-way conversion. Do not try to preserve compatibility with the
original private repo — this copy will never be merged back.

## 1. Remove all traces of git/project history

- Delete the `.git` directory entirely and run `git init` fresh, so no commit history,
  branch names, authors, or old commit messages (which may reference real students,
  staff, schools, or internal ticket numbers) survive.
- Search the working tree for and delete any of the following if present: `.git/`,
  `.next/`, `.turbo/`, `.vercel/`, `.netlify/`, `dist/`, `build/`, `node_modules/`,
  any `*.log`, and any `CHANGELOG.md` or `HISTORY.md` that references the original
  organization.
- Grep the whole repo for the original org/school names, any real person's name, any
  real email domain, and any internal Slack/Linear/Jira references. Replace with
  generic placeholders (e.g. "Example School District", "Jane Doe").
- Check `README.md` (both root-level and `client/README.md`) for anything written for
  internal engineers — replace with a portfolio-facing description (see §5).

## 2. Remove real credentials and secrets

- Delete `server/.env` if it was copied over (it shouldn't be committed, but verify).
  Keep only `server/.env.example` with placeholder values.
- Confirm there are no hardcoded `ALMA_KEY`, `ALMA_SECRET`, `JWT_SECRET`, DB
  credentials, or API keys anywhere in source, `.env.example`, migration files, seed
  scripts, or committed config.
- Rotate/regenerate `JWT_SECRET` for the demo environment — do not reuse the
  production value even as a placeholder.
- Confirm `.gitignore` still excludes `.env`, `node_modules`, and any local DB dumps
  before the first commit to the new repo.

## 3. Remove real student/staff data (PII)

This app handles real minors' data (names, case notes, nationality, DOB, etc.) in
production. **None of that may exist anywhere in the demo repo, database, or seed
files.**

- Do not copy any production DB dump, backup, or `.sql` file that contains real rows.
- Build a small **seed script** (`server/seed/demoData.js` or similar) that inserts
  fake schools, buildings, cohorts, students, and cases using clearly fake data (e.g.
  names like "Alex Demo", "Sam Example"). Keep the dataset small (~10–20 students,
  a handful of cases) so the UI has enough to look real without being a wall of
  placeholder rows.
- Add fake data for every field the case-filing form reads (nickname, cohort,
  nationality_id, etc.) so nothing renders blank or throws on missing fields.

## 4. Replace the live Alma integration with a mock

The real app depends on Alma (Digest Auth, a live SSO/SIS vendor) which the demo has
no legitimate access to and must not attempt to call.

- `server/services/almaService.js` has already been rewritten for this (see the
  `almaService.demo.js` file alongside this CLAUDE.md — drop it in as
  `server/services/almaService.js`, replacing the original). It adds a `DEMO_MODE`
  env flag; when `DEMO_MODE=true`, both `getStudentsByBuilding` and
  `syncAllStudents` short-circuit to read/count rows from the already-seeded
  `alma_students` table instead of making any Digest Auth HTTP call. `syncAllStudents`
  in demo mode still writes a `sync_logs` row (marked with an explanatory
  `error_message` even though `status = 'success'`) so the admin sync-log screen has
  something to show.
- Add `DEMO_MODE=true` to the demo deployment's `.env` (and to `.env.example` so
  it's documented) — do not leave it unset, or requests will fall through to the
  real Alma code paths and fail with no valid credentials.
- Confirm no other code path (routes, controllers) calls Alma directly instead of
  going through `almaService.js` — everything should be funneled through the two
  functions it exports.

## 5. Make the demo self-explanatory and safe to explore

- Update the top-level README with: what this project is, that it's a portfolio demo
  of a real system with data/integrations swapped for fakes, tech stack, and how to
  run it locally.
- Provide working demo login credentials directly in the README (e.g. one account per
  access level 0–4) so a visitor can log in and see each role's view without signing
  up.
- Add a visible banner/note in the UI (e.g. in the header or login page) stating this
  is a portfolio demo with fictional data — no real students are represented.
- If the demo is deployed somewhere public, make sure registration/signup (if it
  exists) either is disabled or writes only to the demo DB, and that nothing a
  visitor does can send real emails, external webhooks, or reminders (check
  `server/services/caseReminderService.js` and the node-cron job in
  `server/index.js` — either point them at no-op/log-only behavior in `DEMO_MODE`,
  or disable the cron entirely for the demo deployment).

## 6. Verify before calling it done

- Grep the final repo for: the original organization's name, any real person's name,
  `ALMA_KEY`, `ALMA_SECRET`, `JWT_SECRET` (real value), and any leftover `.git`
  history.
- Run the app locally end-to-end: log in as each access level, view the dashboards,
  file a case, confirm nothing errors out or tries to hit a real external API.
- Confirm `git log` in the new repo shows only new, clean commits — no trace of the
  original repo's history.

## Out of scope

Do not attempt to preserve feature parity with future changes to the original
private repo — this is a snapshot, not a fork that will be kept in sync.
