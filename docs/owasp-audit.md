# OWASP Top 10 (2021) Security Audit — StudentSafe

**Date:** June 2026
**Framework:** OWASP Top 10 (2021)
**Status:** Pre-launch / Development

---

## Summary

| # | Category | Status | Risk |
|---|---|---|---|
| A01 | Broken Access Control | ⚠️ Partial | Medium |
| A02 | Cryptographic Failures | ⚠️ Partial | Medium |
| A03 | Injection | ⚠️ Partial | Medium |
| A04 | Insecure Design | ⚠️ Partial | Medium |
| A05 | Security Misconfiguration | ⚠️ Partial | Medium |
| A06 | Vulnerable & Outdated Components | ✅ Pass | Low |
| A07 | Identification & Authentication Failures | ⚠️ Partial | Medium |
| A08 | Software & Data Integrity Failures | ⚠️ Partial | Low |
| A09 | Security Logging & Monitoring Failures | ⚠️ Partial | Medium |
| A10 | Server-Side Request Forgery (SSRF) | ✅ Pass | Low |

---

## A01 — Broken Access Control

**Status: ⚠️ Partial**

### What's Done
- Role-based access levels (0–4) enforced in middleware: [authMiddleware.js:18-23](server/middleware/authMiddleware.js)
- `getCases()` and `getCasesById()` filter by access level: [caseController.js:13-82](server/controllers/caseController.js)
- Shared case access queries a separate table: [caseModel.js:65-68](server/models/caseModel.js)
- Admin-only Alma sync endpoints protected: [dropdownRoute.js:16-20](server/routes/dropdownRoute.js)
- `shareCase()` verifies the requesting user has access to the case before sharing: [caseController.js](server/controllers/caseController.js)
- `/uploads/` file route requires a valid JWT — files are not publicly accessible: [index.js:59](server/index.js)

### What Still Needs Fixing (Pre-Launch)
- **Dashboard stats endpoint does not validate that `schoolIdQuery` belongs to the requesting user's school** — a Level 1 or 2 user could request stats for another school: [caseController.js:103-127](server/controllers/caseController.js)
- **Session notes and treatment plans do not verify school-level boundaries** for Level 3 users: [sessionNotesController.js:6-27](server/controllers/sessionNotesController.js)

---

## A02 — Cryptographic Failures

**Status: ⚠️ Partial**

### What's Done
- JWT secret loaded from environment variable: [authMiddleware.js:9](server/middleware/authMiddleware.js)
- Passwords hashed with bcrypt (10 rounds): [userController.js:15](server/controllers/userController.js)
- All Alma API calls use HTTPS: [almaService.js:120](server/services/almaService.js)
- HTTP Digest Auth correctly implemented for Alma: [almaService.js:35-89](server/services/almaService.js)
- File URLs built from `SERVER_URL` environment variable — no hardcoded addresses: [caseController.js](server/controllers/caseController.js)

### What Still Needs Fixing
- **JWT tokens stored in `localStorage`** — vulnerable to XSS; `httpOnly` cookies are safer (pre-launch): [router/index.ts:50-51](client/src/router/index.ts)
- **No token revocation** — a stolen token remains valid for its full 24-hour lifespan (pre-launch)
- **HTTPS enforcement** — must be configured at the web server (Nginx) level at deployment; not a code change
- **No encryption at rest** — PII fields stored as plaintext in the database (post-launch hardening)

---

## A03 — Injection

**Status: ⚠️ Partial**

### What's Done
- Parameterized queries used throughout with `pg` placeholders (`$1`, `$2`): [caseModel.js:9-11](server/models/caseModel.js) and all model files
- ILIKE search uses parameterized wildcard: [searchModel.js:28,40](server/models/searchModel.js)
- Rate limiting on student search (30/min per IP): [studentController.js:8-21](server/controllers/studentController.js)
- `JSON.parse()` on user input is wrapped in `try/catch` — returns 400 on malformed input: [caseController.js:173-178](server/controllers/caseController.js)
- Uploaded filenames sanitized — path traversal characters and unsafe sequences stripped: [uploadMiddleware.js:8-11](server/middleware/uploadMiddleware.js)

### What Still Needs Fixing (Post-Launch)
- **No input validation framework** — no `joi`, `express-validator`, or `zod`; fields accept any length or format
- **No sanitization of free-text fields** — special characters in case reason or notes are stored as-is

---

## A04 — Insecure Design

**Status: ⚠️ Partial**

### What's Done
- Access-level architecture is clearly defined and applied throughout
- Atomic transactions used in Alma sync: [almaService.js:271-277](server/services/almaService.js)
- Alma sync audit log exists: [almaService.js:211-232](server/services/almaService.js)
- IP-level rate limiting on `/auth/login` — 20 requests per 15 minutes per IP address, with `Retry-After` headers: [authRoute.js](server/routes/authRoute.js)
- Account lockout after 3 failed password attempts (15-minute lock): [authTemp.js](server/controllers/authTemp.js)

### What Still Needs Fixing
- **No input validation library** — no `joi`, `express-validator`, or `zod` anywhere (post-launch)
- **No CSRF protection** — state-changing endpoints have no CSRF token requirement (post-launch)
- **File uploads stored without content verification** — MIME type checked but not file content (post-launch)
- **No data retention policy** — no archival or deletion schedule (PDPA requirement, pre-launch)
- **Hard deletes** — cases, users, and notes are permanently destroyed with no soft-delete fallback (pre-launch)

---

## A05 — Security Misconfiguration

**Status: ⚠️ Partial**

### What's Done
- Helmet installed and configured: [index.js:26-40](server/index.js)
- CORS origin configured from environment variable, not open wildcard: [index.js:43-45](server/index.js)
- `/uploads/` static route requires authentication — files are not publicly accessible: [index.js:59](server/index.js)
- Database health check endpoint requires authentication: [index.js:70-78](server/index.js)
- No PII or sensitive data in application logs — student data, case objects, and debug traces removed from all controllers

### What Still Needs Fixing
- **CSP allows `unsafe-inline` styles** — acceptable for development but should be tightened before production: [index.js:31](server/index.js)
- **Server listens on `0.0.0.0`** — correct for a VPS behind Nginx, but must only be externally accessible via the reverse proxy

---

## A06 — Vulnerable & Outdated Components

**Status: ✅ Pass**

### What's Done
- All dependencies are current major versions:
  - Express 5.1.0, pg 8.16.1, bcrypt 6.0.0, jsonwebtoken 9.0.2, helmet 8.2.0
  - Vue 3.5.17, Vue Router 4.5.1
- `npm audit` run — **0 vulnerabilities** in server dependencies

### Areas to Monitor
- **No automated vulnerability scanning** — `npm audit` should be run regularly, ideally in CI/CD
- **No Dependabot or equivalent** for automated dependency update PRs

---

## A07 — Identification & Authentication Failures

**Status: ⚠️ Partial**

### What's Done
- JWT authentication enforced on all protected routes: [authMiddleware.js](server/middleware/authMiddleware.js)
- Google OAuth 2.0 with email domain validation: [authTemp.js:50-125](server/controllers/authTemp.js)
- Inactive user check blocks login: [authTemp.js:12](server/controllers/authTemp.js)
- Passwords hashed with bcrypt (10 rounds): [userController.js:15](server/controllers/userController.js)
- Account lockout after 3 failed password attempts (15-minute lock): [authTemp.js:28-46](server/controllers/authTemp.js)
- IP-level rate limiting on login — 20 attempts per 15 minutes per IP: [authRoute.js](server/routes/authRoute.js)
- Minimum password length enforced — 8 characters required: [userController.js](server/controllers/userController.js)

### What Still Needs Fixing
- **No logout / token revocation** — tokens remain valid for 24 hours with no server-side invalidation (pre-launch)
- **No password reset flow** — users with forgotten passwords are permanently locked out (pre-launch)
- **No MFA** — single-factor only; planned for post-launch
- **Manually created users receive no email verification** — only Google accounts are email-verified (pre-launch)
- **Tokens stored in localStorage** — shared across browser tabs; `httpOnly` cookies would be safer (pre-launch)

---

## A08 — Software & Data Integrity Failures

**Status: ⚠️ Partial**

### What's Done
- Audit log table records case creation, update, deletion, sharing, and user management actions: [logModel.js:3-41](server/models/logModel.js)
- Alma sync uses full atomic transactions: [almaService.js:271-277](server/services/almaService.js)
- Uploaded filenames sanitized — prevents path traversal in stored file names: [uploadMiddleware.js](server/middleware/uploadMiddleware.js)

### What Still Needs Fixing (Post-Launch)
- **Multi-step DB writes not wrapped in transactions** — a mid-operation failure in `createCase` can leave data inconsistent: [caseController.js:200-286](server/controllers/caseController.js)
- **Uploaded file content not verified** — only MIME type is checked, not actual file contents
- **No checksums on uploaded files** — no integrity verification after storage

---

## A09 — Security Logging & Monitoring Failures

**Status: ⚠️ Partial**

### What's Done
- Audit log table records case and user management events: [logModel.js](server/models/logModel.js)
- Alma sync attempts logged with timestamps and status: [almaService.js:211-232](server/services/almaService.js)
- Login events recorded — successful logins, failed attempts, account lockouts, and Google logins all written to `audit_logs`: [authTemp.js](server/controllers/authTemp.js)
- No PII in application logs — student data and case objects removed from all console output

### What Still Needs Fixing
- **File access not logged** — no record of who downloaded which case attachment (pre-launch)
- **Session notes and treatment plan access not logged** (post-launch)
- **Logs are not persisted** — written to console only; lost on process restart; a log file or external service needed at deployment (pre-launch)
- **No alerting on suspicious patterns** — high-volume access, repeated failures, bulk downloads (post-launch)

---

## A10 — Server-Side Request Forgery (SSRF)

**Status: ✅ Pass**

### What's Done
- Alma API calls use a fixed domain pattern (`getalma.com`) — not user-controlled: [almaService.js:120,157](server/services/almaService.js)
- No user-controlled redirect URLs in the router: [router/index.ts:23-41](client/src/router/index.ts)
- 10-second timeout on all Alma HTTP requests — prevents hung connections from blocking the server: [almaService.js:37, 82](server/services/almaService.js)
- Uploaded filenames fully sanitized — path traversal sequences stripped before saving to disk: [uploadMiddleware.js](server/middleware/uploadMiddleware.js)

---

## Outstanding Fix List

### Fix Before Launch

1. **Implement soft deletes** (`deleted_at`) for cases, users, and session notes — preserves audit trail
2. **Log file access events** — who downloaded which case attachment
3. **Add a logout endpoint** — clears the client session token
4. **Configure persistent logging** — write audit logs to file or external service at deployment
5. **Move JWT to `httpOnly` secure cookies** instead of `localStorage`
6. **Build a password reset flow** with expiring tokens
7. **Add email verification** for manually created (non-Google) user accounts
8. **Enforce HTTPS** via Nginx at deployment — not a code change
9. **Validate `schoolIdQuery` in stats endpoints** — ensure users can only request data for their own school
10. **Add school-level boundary checks** to session notes and treatment plan access

### Post-Launch Hardening

11. Wrap multi-step DB operations in transactions (especially `createCase`)
12. Add an input validation library (`express-validator` or `joi`) to POST/PUT endpoints
13. Add CSRF protection
14. Implement alerting for anomalous access patterns
15. Log session note and treatment plan access
16. Verify uploaded file content beyond MIME type (magic bytes check)
17. Add MFA for elevated access levels
18. Tighten CSP to remove `unsafe-inline` for styles
19. Add data retention policy — archival and deletion schedule for cases and student records
20. Encrypt sensitive database fields at rest
