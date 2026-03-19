# SECURITY_OWASP_REVIEW.md

Updated: 2026-03-19

## Scope

- Backend: NestJS API (`/api/v1/*`)
- Frontend: React + Axios client
- Focus: OWASP Top Risks baseline review (implementation-level)

## OWASP Mapping (Current)

1. Broken Access Control
- Mitigation:
  - JWT auth guard for protected APIs
  - RBAC via `RolesGuard` and role decorators
  - Builder admin endpoints protected by role tiers (Editor/Admin/SuperAdmin split)
- Residual risk:
  - Need broader endpoint-by-endpoint permission audit across all admin routes

2. Cryptographic Failures
- Mitigation:
  - Argon2id password hashing
  - JWT access/refresh secrets from env
  - Refresh token hash storage (no plaintext refresh token in DB)
- Residual risk:
  - Need secret rotation procedure doc

3. Injection
- Mitigation:
  - Prisma ORM (avoid raw SQL string concatenation in runtime APIs)
  - Input validation + sanitization utilities
  - Builder JSON payload deep-sanitized
- Residual risk:
  - Need stricter allowlist sanitizer for rich HTML blocks if supporting raw HTML in future

4. Insecure Design
- Mitigation:
  - Versioned API (`/api/v1`)
  - Builder publish/rollback flow with history
  - CSRF protection for cookie-based auth flow
- Residual risk:
  - Need explicit threat model document for payment + webhook flows

5. Security Misconfiguration
- Mitigation:
  - `helmet` enabled
  - CORS whitelist by env
  - Cookie flags (`HttpOnly`, `Secure` by env, `SameSite`)
- Residual risk:
  - Need production-specific hardened helmet CSP policy

6. Vulnerable and Outdated Components
- Mitigation:
  - Centralized package manifests
- Residual risk:
  - Require periodic `npm audit` workflow in CI

7. Identification and Authentication Failures
- Mitigation:
  - Access/refresh token architecture
  - Refresh revoke on logout
  - Brute-force lock for login attempts by `email+ip`
  - Endpoint throttling (global + auth endpoint level)
- Residual risk:
  - Need MFA support for admin roles (future hardening)

8. Software and Data Integrity Failures
- Mitigation:
  - Signed upload flow for Cloudinary
  - Controlled media metadata persistence
- Residual risk:
  - Need signed release/CI artifact validation policy

9. Security Logging and Monitoring Failures
- Mitigation:
  - Audit log module
  - Sensitive action audit logging for auth and builder admin operations
- Residual risk:
  - Need alerting pipeline and retention policy

10. SSRF
- Mitigation:
  - No generic server-side URL fetch endpoint exposed for users
- Residual risk:
  - Any new URL-fetch feature must enforce hostname/IP allowlist

## Immediate Next Hardening (Recommended)

1. Add CI security jobs: `npm audit`, SAST, dependency policy gate.
2. Add centralized authorization matrix tests for admin endpoints.
3. Add security alerting + audit log retention policy.
