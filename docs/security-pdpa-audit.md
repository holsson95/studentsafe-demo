# Security & PDPA Compliance Audit — StudentSafe

**Date:** 2026-06-22
**Previous audit:** 2026-06-18

---

## What Is Already Implemented (Good Foundation)

| Control | Where |
|---|---|
| JWT authentication (1-day expiry) | `server/controllers/authTemp.js` |
| bcrypt password hashing (10 rounds) | `server/controllers/authTemp.js:19` |
| Google OAuth2 with email domain verification | `server/controllers/authTemp.js:91-103` |
| Access-level authorization (Levels 0–4) | `server/controllers/caseController.js`, `server/controllers/studentController.js` |
| Parameterized SQL queries throughout | All model files |
| Rate limiting on login — 20 req / 15 min per IP | `server/routes/authRoute.js:6-12` |
| Account lockout after 3 failed attempts (15 min) | `server/controllers/authTemp.js:31-45` |
| Minimum password length enforced (8 chars) | `server/controllers/userController.js:15-17` |
| Helmet with CSP, HSTS, clickjacking protection | `server/index.js:26-40` |
| CORS origin from environment variable | `server/index.js:42-45` |
| `/uploads/` route requires valid JWT | `server/index.js:59` |
| File URL built from `SERVER_URL` env var | `server/controllers/caseController.js:274` |
| File type + size filtering on uploads | `server/middleware/uploadMiddleware.js` |
| PII field stripping before Alma cache | `server/services/almaService.js:23-26, 96-99` |
| Alma sync audit log with atomic transactions | `server/services/almaService.js` |
| Audit log for auth, case, and user events | `server/models/logModel.js`, `server/controllers/authTemp.js` |
| No PII in auth middleware logs | `server/middleware/authMiddleware.js` — JWT no longer logged |

---

## Fixed Since Last Audit (2026-06-18)

| Issue | Resolution |
|---|---|
| JWT token logged in `authMiddleware.js` | Removed — middleware is now clean |
| `req.body` (plaintext password) logged in `userController.js` | Removed |
| No rate limiting on login endpoint | `loginLimiter` added: 20 req / 15 min per IP with `Retry-After` header |
| No helmet / security headers | Helmet installed with CSP, `frameAncestors: 'none'`, HSTS etc. |
| `/uploads/` publicly accessible without auth | Now behind `authenticate` middleware |
| No account lockout | Lockout after 3 failed attempts for 15 minutes |
| No password length policy | Minimum 8 characters enforced |
| Hardcoded `localhost:5000` in file URLs | Replaced with `process.env.SERVER_URL` |
| Auth events not logged | LOGIN_SUCCESS, LOGIN_FAILED, LOGIN_LOCKED, GOOGLE_LOGIN_SUCCESS all recorded in `audit_logs` |

---

## Critical Issues (Fix Before Production)

### 1. `deleteCase` Does Not Verify User Access

[caseController.js:336-356](server/controllers/caseController.js#L336-L356)

`deleteCase` declares `userId` and `access_level` but passes neither to the model:

```js
const userId = req.user.id;
const access_level = req.user.access_level;
// ...
const deleted = await caseModel.deleteCase(id);   // no ownership check
```

Any authenticated user — including a Level 4 teacher with no relationship to the case — can delete any case by ID. Fix: fetch the case first using the same scoped queries used in `getCasesById`, return 403 if null, then delete.

### 2. `getCasesByStudentId` Has No Access Control

[caseController.js:517-530](server/controllers/caseController.js#L517-L530)

This endpoint returns all cases for a given student with no access-level check. A Level 4 user can retrieve cases they didn't create and were never shared with.

### 3. Login Still Logs User Email (PII)

[authTemp.js:13-20](server/controllers/authTemp.js#L13-L20)

```js
console.log(
    "LOGIN CHECK:",
    user.email,       // PII — email address
    "Attempts:",
    user.failed_login_attempts,
    "Locked:",
    user.locked_until
);
```

Email is personal data under PDPA. Remove this `console.log` entirely — the same state is already captured in `audit_logs`.

### 4. Google Login Endpoint Not Rate-Limited

[authRoute.js:15](server/routes/authRoute.js#L15)

```js
router.post('/login', loginLimiter, authController.login);   // rate-limited
router.post('/google', authController.googleLogin);           // not rate-limited
```

An attacker can issue unlimited requests to `/auth/google`. Apply the same `loginLimiter` (or a dedicated one) to the Google route.

---

## Security Gaps (High Priority)

| Gap | Detail |
|---|---|
| Analytics endpoints don't validate `school_id` | `fetchCaseCountsBySchool`, `fetchCaseCountsByBuilding`, `fetchCaseCountsByStatus`, `fetchCaseCountsBySeverity`, `fetchCaseCountsByGender`, `fetchTopCategories`, `fetchTopSubcategories` — all accept a `school_id` query param with no ownership check; a Level 1 user can query another school's aggregated data: [caseController.js:383-515](server/controllers/caseController.js#L383-L515) |
| `CASE_VIEWED` log commented out | [caseController.js:83-88](server/controllers/caseController.js#L83-L88) — no audit record of who read a case; required for PDPA accountability |
| `logModel` silently drops `details` field | [logModel.js:3-16](server/models/logModel.js#L3-L16) doesn't accept or store `details`; `updateStatus` at [caseController.js:374](server/controllers/caseController.js#L374) passes it but it is silently lost |
| Audit log missing IP address and user agent | `audit_logs` schema has no `ip_address` / `user_agent` columns; without these, breach investigations cannot reconstruct access paths |
| No CSRF protection | POST endpoints accept requests without a CSRF token |
| Token in localStorage | Vulnerable to XSS; httpOnly cookies would be safer |
| No refresh token / logout endpoint | Sessions cannot be invalidated; a stolen token lasts 24 hours |
| No password reset flow | Users permanently locked out if they forget their password |
| Hard deletes on cases and users | No `deleted_at` — no audit trail recovery and no PDPA-compliant erasure verification |
| CSP allows `unsafe-inline` styles | [index.js:31](server/index.js#L31) — acceptable during development, must be tightened for production |
| Files stored in webroot without virus scan | No magic-byte verification; filename is `timestamp + originalname` |

---

## PDPA Compliance Gaps (Thailand Personal Data Protection Act)

| PDPA Requirement | Status | What's Missing |
|---|---|---|
| Lawful basis / consent for processing | ❌ Missing | No consent capture, storage, or withdrawal mechanism |
| Data minimization | ⚠️ Partial | Alma strips PII before caching; analytics endpoints still accept school filters without scope validation |
| Data retention policy | ❌ Missing | No TTL, archival job, or retention period fields on any table |
| Right to access (data export) | ❌ Missing | No endpoint to export a data subject's personal data |
| Right to rectify | ❌ Missing | No correction workflow for inaccurate data |
| Right to erasure | ❌ Missing | Hard deletes destroy audit trail; no verified erasure flow |
| Right to restrict processing | ❌ Missing | No mechanism to flag a record as restricted |
| Audit trail for data access | ⚠️ Partial | Auth, case creation/update/deletion, and user management are logged; case reads are not (log commented out); IP address not captured |
| Breach notification mechanism | ❌ Missing | No breach detection, log table, or notification template |
| DPA with third-party processors | ❌ Missing | Alma API and email service handle PII with no recorded agreement |
| Encryption at rest | ❌ Missing | PII columns (names, emails, nationalities) stored as plaintext |

---

## Recommended Fix Priority

### Immediate (Before Any Real Data Enters the System)

1. **Remove `console.log` of email in `authTemp.js:13-20`** — already in `audit_logs`

2. **Add access check to `deleteCase`** — fetch case with scoped query first, return 403 if null, then delete
   - [caseController.js:336-356](server/controllers/caseController.js#L336-L356)

3. **Add access check to `getCasesByStudentId`** — filter by `access_level` same as `getCases`
   - [caseController.js:517-530](server/controllers/caseController.js#L517-L530)

4. **Rate-limit the Google login route**
   - [authRoute.js:15](server/routes/authRoute.js#L15)

5. **Fix `logModel` to persist `details` field** — add parameter and column; re-enable `CASE_VIEWED` log
   - [logModel.js:3-16](server/models/logModel.js#L3-L16)

6. **Validate `school_id` on all analytics endpoints** — require that the requested school matches the user's school unless access_level === 3

---

### Short-Term (1–2 Sprints)

7. Add `ip_address INET` and `user_agent TEXT` columns to `audit_logs` and capture them in `logModel.createLog`
8. Implement soft deletes (`deleted_at`) on cases, users, and session notes
9. Add a logout endpoint that clears the client-side token
10. Build a password reset flow with expiring tokens
11. Add email verification for manually created (non-Google) user accounts
12. Add CSRF protection (`sameSite: Strict` cookie policy or `csurf`)
13. Move uploaded files to cloud storage or outside the webroot with randomly generated filenames

---

### Medium-Term (PDPA Compliance)

14. Add data retention periods to all PII tables and build an archival/purge job
15. Implement data subject endpoints: export, erasure, rectification
16. Build a consent tracking table linked to cases and student records
17. Document and record Data Processing Agreements with Alma and the email provider
18. Implement a breach log table and notification workflow
19. Tighten CSP to remove `unsafe-inline` for styles before production
20. Encrypt sensitive database columns at rest

---

## Database Schema Additions Needed

```sql
-- Soft deletes: add to cases, session_notes, treatment_plans, users
ALTER TABLE cases ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;

-- Add IP + user agent to audit trail
ALTER TABLE audit_logs ADD COLUMN ip_address INET;
ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
ALTER TABLE audit_logs ADD COLUMN details TEXT;

-- Consent tracking
CREATE TABLE data_subject_consents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   INT REFERENCES alma_students(id),
  consent_type VARCHAR(50) NOT NULL,     -- 'case_filing', 'data_sharing', etc.
  given_at     TIMESTAMPTZ NOT NULL,
  expires_at   TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ
);
```

---

## Summary

Since the 2026-06-18 audit, significant hardening has been applied: Helmet is installed, login is rate-limited with account lockout, `/uploads/` requires authentication, the JWT is no longer logged, and audit trails now cover auth and case lifecycle events.

The remaining critical gaps are:

- **Three access control holes**: `deleteCase` has no ownership check, `getCasesByStudentId` has no access-level filter, and the analytics family of endpoints allows any user to query any school's aggregated data.
- **One residual PII log**: the email address is still printed to stdout on every login check in `authTemp.js`.
- **Google login is not rate-limited** — inconsistent with the password login protection.
- **Audit trail gaps**: case reads are unlogged (commented out), the `details` field is silently dropped, and neither IP address nor user agent are captured.

PDPA-specific obligations (consent, data retention, data subject rights, breach notification) remain entirely absent — these are additive features that do not require architectural changes.
