# LAW-014-02 — Authentication & Tenant Binding — Completion Report

> **Story:** LAW-014-02  
> **Status:** **Complete**  
> **Date:** 2026-07-06  
> **Verdict:** AUTHENTICATION & TENANT BINDING DELIVERED — ready for LAW-014-03

---

## Summary

LAW-014-02 secures the Law Platform API scaffold with Platform authentication, tenant resolution, permission enforcement hooks, and a reusable authenticated request context. No business entity endpoints were added. Planning documents now use the canonical base path `/api/law/v1/`.

---

## Deliverables

| Deliverable                 | Location                                                  |
| --------------------------- | --------------------------------------------------------- |
| Authentication middleware   | `apps/web/lib/api/middleware/with-law-api-auth.ts`        |
| Request context builder     | `apps/web/lib/api/context/build-authenticated-context.ts` |
| Tenant resolver             | `apps/web/lib/api/tenant/tenant-resolver.ts`              |
| User resolver               | `apps/web/lib/api/auth/user-resolver.ts`                  |
| Permission resolver         | `apps/web/lib/api/auth/permission-resolver.ts`            |
| Auth diagnostics            | `apps/web/lib/api/auth/auth-diagnostics.ts`               |
| 401/403 responses           | `apps/web/lib/api/auth/auth-errors.ts`                    |
| Persistence scope (ALS)     | `apps/web/lib/api/persistence/`                           |
| Protected diagnostics route | `apps/web/app/api/law/v1/diagnostics/route.ts`            |
| Tests                       | `apps/web/lib/api/law-api-auth.test.ts`                   |
| Authentication notes        | `docs/security/LAW-API-Authentication-Notes.md`           |
| Tenant binding notes        | `docs/security/LAW-API-Tenant-Binding-Notes.md`           |
| Request context spec        | `docs/specs/LAW-API-Request-Context-Specification.md`     |
| Updated API stub            | `docs/developer/legal-api-v1-stub.md`                     |

---

## Routes

| Method | Path                      | Auth     | Tenant   | Permission                 |
| ------ | ------------------------- | -------- | -------- | -------------------------- |
| GET    | `/api/law/v1/health`      | Public   | —        | —                          |
| GET    | `/api/law/v1/diagnostics` | Required | Required | `legal.nav.dashboard.view` |

---

## Tenant resolution order

1. Auth session (`user.tenantId`)
2. `x-tenant-id` header claim
3. Active `LawApiPersistenceContext` (ALS)
4. Development fallback (`LAW_TENANT_ID` / `DEFAULT_LAW_TENANT_ID`)

---

## Error codes added

| Code              | HTTP | Description                  |
| ----------------- | ---- | ---------------------------- |
| `UNAUTHENTICATED` | 401  | Missing or invalid session   |
| `FORBIDDEN`       | 403  | Permission denied            |
| `TENANT_REQUIRED` | 403  | Tenant could not be resolved |

---

## Test report

| Test area                                                     | Tests  | Result       |
| ------------------------------------------------------------- | ------ | ------------ |
| Tenant resolution (session, claim, persistence, dev fallback) | 4      | Pass         |
| User resolver                                                 | 1      | Pass         |
| 401 / 403 envelopes                                           | 2      | Pass         |
| Permission resolver                                           | 2      | Pass         |
| Authenticated context                                         | 3      | Pass         |
| Auth diagnostics (no secrets)                                 | 1      | Pass         |
| Diagnostics route (auth + unauth)                             | 2      | Pass         |
| Scaffold tests (unchanged health/public)                      | 11     | Pass         |
| **Total (Law API)**                                           | **26** | **All pass** |

---

## Infrastructure fix

Vitest alias order corrected: `@apzhub/auth/server` must precede `@apzhub/auth` for subpath resolution in `vitest.config.ts`.

---

## Technical debt

| ID     | Item                                      | Notes                                                       |
| ------ | ----------------------------------------- | ----------------------------------------------------------- |
| TD-P02 | `tenantId` not on Better Auth user schema | Use `x-tenant-id` or dev fallback until session claim wired |
| TD-I01 | Path prefix reconciliation                | **Closed** — planning docs updated to `/api/law/v1/`        |

---

## Out of scope (confirmed)

- Business entity APIs (Client, Matter, Document, Task, Calendar, Time, Invoice)
- CRUD operations, webhooks, SDK generation, background workers, external integrations

---

## Next step

**Await owner approval** before LAW-014-03 (OpenAPI generation and business endpoint contracts).

---

## Related documents

- [LAW-API-Authentication-Notes](../security/LAW-API-Authentication-Notes.md)
- [LAW-API-Tenant-Binding-Notes](../security/LAW-API-Tenant-Binding-Notes.md)
- [LAW-API-Request-Context-Specification](../specs/LAW-API-Request-Context-Specification.md)
- [LAW-014-01 completion report](./LAW-014-01-completion-report.md)
