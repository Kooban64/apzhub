# APZHUB Production Operations Checklist

> **Programme:** PRH-012–018  
> **Story:** PRH-014  
> **Audience:** Release approvers / operators  
> **Use:** Sign off before production traffic

---

## Sign-off

| Field             | Value                                       |
| ----------------- | ------------------------------------------- |
| Environment       | staging / production                        |
| Date (UTC)        |                                             |
| Operator          |                                             |
| App SHA / version |                                             |
| Verdict           | READY / READY_WITH_OBSERVATIONS / NOT_READY |

---

## 1. Security

| #    | Check                                                                                   | Pass |
| ---- | --------------------------------------------------------------------------------------- | ---- |
| 1.1  | `NODE_ENV=production`                                                                   | ☐    |
| 1.2  | Strong `BETTER_AUTH_SECRET` (not example default)                                       | ☐    |
| 1.3  | CSP enforced (not Report-Only) on HTML responses                                        | ☐    |
| 1.4  | Security headers present (XFO, XCTO, Referrer-Policy, HSTS in prod, Permissions-Policy) | ☐    |
| 1.5  | `AUTHORIZATION_PROVIDER_MODE=production`                                                | ☐    |
| 1.6  | Allow-all authz **disabled** in production                                              | ☐    |
| 1.7  | Dev registration disabled                                                               | ☐    |
| 1.8  | Rate limiting active on auth / privileged APIs                                          | ☐    |
| 1.9  | Session cookies Secure + HttpOnly + appropriate SameSite                                | ☐    |
| 1.10 | Webhook ingress secret set if ingress exposed                                           | ☐    |

---

## 2. Environment & configuration

| #   | Check                                                                                 | Pass |
| --- | ------------------------------------------------------------------------------------- | ---- |
| 2.1 | Environment validation passes at startup                                              | ☐    |
| 2.2 | `DATABASE_URL` / `REDIS_URL` point to intended instances                              | ☐    |
| 2.3 | `ENTITY_MAPPING_STORE_MODE=postgres`                                                  | ☐    |
| 2.4 | Public URLs match TLS certificates                                                    | ☐    |
| 2.5 | Ports do not collide with legacy `apz-stack` ([ENVIRONMENT.md](../../ENVIRONMENT.md)) | ☐    |

---

## 3. Data & backups

| #   | Check                                                                                 | Pass |
| --- | ------------------------------------------------------------------------------------- | ---- |
| 3.1 | Pre-cutover Postgres backup taken and restore-tested                                  | ☐    |
| 3.2 | Migrations applied; journal matches release                                           | ☐    |
| 3.3 | Rollback plan reviewed ([Upgrade Guide](./APZHUB-Platform-Upgrade-Rollback-Guide.md)) | ☐    |

---

## 4. Health & readiness

| #   | Check                                                                           | Pass |
| --- | ------------------------------------------------------------------------------- | ---- |
| 4.1 | `GET /api/health` → healthy (DB + Redis)                                        | ☐    |
| 4.2 | Platform Operations production verification READY or accepted WITH_OBSERVATIONS | ☐    |
| 4.3 | Outbox worker running (if async delivery required)                              | ☐    |
| 4.4 | Event Bus health OK (authenticated diagnostics)                                 | ☐    |

---

## 5. Isolation & audit

| #   | Check                                                                                     | Pass |
| --- | ----------------------------------------------------------------------------------------- | ---- |
| 5.1 | RLS / tenant isolation tests green on staging                                             | ☐    |
| 5.2 | Authz audit sink recording allow/deny on critical paths                                   | ☐    |
| 5.3 | Audit gap report reviewed ([PRH-016](../sprint/PRH-012-018-audit-completeness-report.md)) | ☐    |

---

## 6. Diagnostics & ops console

| #   | Check                                          | Pass |
| --- | ---------------------------------------------- | ---- |
| 6.1 | Operations dashboard reachable for admin roles | ☐    |
| 6.2 | Degraded capabilities understood / accepted    | ☐    |
| 6.3 | Incident Response Guide available to on-call   | ☐    |

---

## 7. Smoke validation

| #   | Check                                                             | Pass |
| --- | ----------------------------------------------------------------- | ---- |
| 7.1 | `pnpm test:production-smoke` against target `PLAYWRIGHT_BASE_URL` | ☐    |
| 7.2 | Login → shell Home renders                                        | ☐    |
| 7.3 | Health API OK                                                     | ☐    |
| 7.4 | Law home reachable (if law-platform in scope for this deploy)     | ☐    |

---

## 8. Explicit deferrals (do not block on)

- M17 full CI pipeline
- Vault
- BullMQ platform
- Commercial provisioning (OSS-100-12+)
- Kimai / new OSS adapters

---

## Approval

| Role                  | Name | Signature / date |
| --------------------- | ---- | ---------------- |
| Operator              |      |                  |
| Owner (if production) |      |                  |

---

## Related

- [Deployment Guide](./APZHUB-Production-Deployment-Guide.md)
- [Operational Readiness Guide](./APZHUB-Operational-Readiness-Guide.md)
- [Production Verification Guide](./APZHUB-Production-Verification-Guide.md)
