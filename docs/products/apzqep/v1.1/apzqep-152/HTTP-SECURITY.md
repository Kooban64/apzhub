# HTTP Security — APZQEP-152

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-152       |
| Artefact  | HTTP-SECURITY    |
| Timestamp | 20260803T064000Z |

---

## `withPlatformApiAuth`

Location: `apps/web/lib/api/v1/auth/with-platform-api-auth.ts`

| Step          | Behaviour                                                                 |
| ------------- | ------------------------------------------------------------------------- |
| Tracing       | Correlation / request IDs required                                        |
| Auth          | `authenticatePlatformApiRequest` + `requireAuthenticatedSession` → 401    |
| Authz resolve | `resolveSessionAuthorization({ userId, tenantId, productKey: "apzqep" })` |
| Context       | `buildServiceRequestContext({ …, permissions: authz.permissions })`       |
| Traffic       | `enforceTrafficGovernanceForHandler`                                      |
| Tenant ALS    | Handler runs inside `runWithTenantContext(serviceContext.tenantId)`       |
| Errors        | `translatePlatformApiError` — no raw backend leakage                      |

## `buildServiceRequestContext`

Location: `apps/web/lib/api/v1/service-context.ts`

- Accepts optional `permissions` from `resolveSessionAuthorization`.
- Never trusts client-supplied roles/permissions/tenant/actor.
- When permissions omitted, defaults to `[]` (fail closed for Cap domain).

## `actorFromContext` — no elevation

All six Cap handlers construct actors as:

```text
userId     ← serviceContext.userId
tenantId   ← serviceContext.tenantId
permissions ← serviceContext.permissions   // pass-through only
```

| Cap | Handler file                     |
| --- | -------------------------------- |
| A   | `qep-suites.ts`                  |
| B   | `qep-execution-plans.ts`         |
| C   | `qep-execution-workspace.ts`     |
| D   | `qep-defects.ts`                 |
| E   | `qep-enterprise-requirements.ts` |
| F   | `qep-enterprise-reporting.ts`    |

**Removed:** LIMITED_AVAILABILITY logic that appended Cap write grants when base permissions lacked Cap read/admin.

Empty permissions → domain `requirePermission` denies → HTTP 403 (mapped from Cap permission errors).
