# APZHUB Platform — Security Review

> **Milestone:** M16 — Platform Stabilisation & Engineering Review  
> **Date:** 2026-07-08  
> **Type:** Analysis only — no implementation  
> **Authority:** [013 Security Architecture](../013-security-architecture-zero-trust-framework.md) · [LAW Integration Security Model](../security/LAW-Integration-Security-Model.md)

---

## 1. Purpose

Rate security posture across authentication, authorization, tenant isolation, audit, API security, and secrets handling.

**Rating scale:** Excellent · Very Good · Good · Fair · Poor

---

## 2. Security area ratings

| Area             | Rating        | Evidence                                                                       |
| ---------------- | ------------- | ------------------------------------------------------------------------------ |
| Authentication   | **Good**      | BetterAuth integrated; session cookies; login/register flows                   |
| Authorization    | **Fair**      | Permission keys defined; `allow-all` adapter in dev/E2E; M8 RBAC deferred      |
| Tenant isolation | **Good**      | RLS on law tables; `tenantId` on entities; **gap:** auth tenant claim (TD-P02) |
| RLS              | **Very Good** | Migrations 0002, 0004, 0006, 0008, 0010; policies per table                    |
| Audit            | **Good**      | Action audit events; trust workflow audit; no central audit store              |
| Outbox           | **Good**      | Transactional write; **gap:** no consumers/workers (TD-P18)                    |
| API security     | **Good**      | `withLawApiAuth`; permission gates; error envelopes mask internals             |
| Session handling | **Good**      | HTTP-only cookies via BetterAuth; middleware on protected routes               |
| Permissions      | **Fair**      | Manifest keys exist; not seeded in production RBAC                             |
| Secrets          | **Very Good** | `.secrets/` gitignored; `.env.example` only; no secrets in repo                |

**Overall security posture: GOOD (6.5/10)** — strong foundations; production authz/tenant gaps

---

## 3. Authentication

### Strengths

- BetterAuth as sole auth layer (007 compliance)
- Server-side session validation on API routes
- Auth routes isolated under `/api/auth/[...all]`

### Weaknesses

- No MFA/passkey configuration documented for production
- Dev mode allows unauthenticated E2E paths via hooks

### Risks

- Session fixation if cookie settings not hardened for production deployment

### Recommendations

- Document production cookie/TLS requirements in operator guide
- M8: identity administration including MFA policy

**Rating: Good**

---

## 4. Authorization

### Strengths

- Permission-driven UI spec (005) with `PermissionService` seam
- Law API checks `legal.*` permission keys
- Trust API permission gates on all routes

### Weaknesses

- `ScaffoldPermissionAdapter` / `AllowAllPermissionAdapter` used in validation
- `TD-M8-RBAC` — no production role seed
- Superadmin tier specified but not implemented

### Risks

- Deploying to pilot without RBAC = all users see all capabilities

### Recommendations

- **Block commercial pilot on M8 RBAC seed**
- Permission re-validation on session restore (018)

**Rating: Fair**

---

## 5. Tenant isolation

### Strengths

- `tenantId` on all law entities
- PostgreSQL RLS via `app.tenant_id` session variable
- API requires `x-tenant-id` header with session binding

### Weaknesses

- **TD-P02:** Auth session lacks real `tenantId` — falls back to `DEFAULT_LAW_TENANT_ID`
- Single-firm validation only
- RLS cross-tenant denial not integration-tested (TD-P10)

### Risks

- Multi-firm deployment without TD-P02 fix = tenant bypass

### Recommendations

- Wire firm ID from auth session before any pilot
- Add cross-tenant denial integration test

**Rating: Good** (Fair for multi-tenant until TD-P02 resolved)

---

## 6. RLS

### Strengths

- Policies on client, matter, document, task, calendar, time, invoice, trust tables
- Dedicated migration per phase
- `postgres-tenant-session.ts` sets session variable

### Weaknesses

- ALS wiring not in all API routes (TD-P09)
- No FK constraints — referential integrity via application only (TD-P11)

### Recommendations

- Complete ALS middleware in API layer
- Document intentional FK omission or add constraints

**Rating: Very Good**

---

## 7. Audit

### Strengths

- Action Framework emits `action.executed` audit events
- Trust workflow append-only audit repository
- Correlation IDs in API error envelopes (010)

### Weaknesses

- No centralised immutable audit store
- Law archive has no audit trail (TD-L011-03)
- Outbox events not consumed for audit projection

### Recommendations

- Audit projection via outbox worker (M10)
- `law_audit_record` table in compliance sprint

**Rating: Good**

---

## 8. Outbox security

### Strengths

- Events written in same transaction as domain write
- Outbox rows tenant-scoped

### Weaknesses

- No worker — events sit unprocessed
- No dead-letter queue (TD-P20)
- No replay authentication (TD-P19)

### Risks

- Stale projections; no tamper detection on unconsumed events

### Recommendations

- Worker with dedicated service identity (013 least privilege)

**Rating: Good** (infrastructure incomplete)

---

## 9. API security

### Strengths

- Standard error envelope — no stack traces to clients
- Permission check before handler execution
- Validation via Zod/query parsers
- Trust export requires report ownership check

### Weaknesses

- OpenAPI not complete — security schemes partially documented
- No rate limiting implemented at gateway
- Webhook SSRF risk documented but not implemented (LAW-014)

### Recommendations

- Rate limiting at Caddy/gateway before commercial
- Complete OpenAPI security schemes

**Rating: Good**

---

## 10. Session handling

### Strengths

- Server-side session via BetterAuth
- Middleware protects `/workspace` routes
- No tokens in localStorage for primary auth

### Weaknesses

- E2E hooks bypass some flows
- Session store type (Redis vs DB) not documented for production

### Recommendations

- Document session store requirements for HA deployment

**Rating: Good**

---

## 11. Permissions model

### Strengths

- Namespace design `legal.{domain}.{verb}` consistent
- Trust permissions comprehensive in spec
- Platform permissions planned for M8

### Weaknesses

- Spec vs implementation mismatch (`legal.trust.export` vs `legal.trust.report`)
- No permission administration UI

**Rating: Fair**

---

## 12. Secrets

### Strengths

- `.secrets/` in `.gitignore`
- `.env.example` with placeholders only
- No credentials found in tracked files
- GitHub token stored locally only (operator practice)

### Weaknesses

- No secrets rotation runbook
- Connector config refs not yet implemented (011)

### Recommendations

- Secrets manager integration before production
- Rotation procedure for API keys (LAW-014-02)

**Rating: Very Good**

---

## 13. Zero Trust alignment (013)

| Principle                       | Status                     |
| ------------------------------- | -------------------------- |
| Verify identity every request   | ✅ API auth middleware     |
| Verify permission every request | ⚠️ Dev allow-all           |
| Verify tenant context           | ⚠️ TD-P02                  |
| Least privilege                 | ⚠️ Workers not implemented |
| Audit all mutations             | ⚠️ Partial                 |
| TLS mandatory                   | ⏸ Deployment concern       |
| No secrets in code              | ✅                         |

---

## 14. Critical security blockers (commercial)

1. **TD-P02** — Real tenant claim from auth
2. **TD-M8-RBAC** — Production permission seed
3. **TD-P18** — Outbox workers with service identity
4. **Rate limiting** — Edge gateway
5. **TD-T03** — Client bundle must not import PostgreSQL adapters

---

## 15. Verdict

**Platform security: GOOD** — architecture aligns with Zero Trust intent; validation-phase shortcuts (allow-all, default tenant) must not reach production.

---

_Related: [Commercial Readiness Assessment](../reviews/APZHUB-Commercial-Readiness-Assessment.md) · [Technical Debt Register](./APZHUB-Platform-Technical-Debt-Register.md)_
