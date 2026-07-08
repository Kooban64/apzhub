# LAW — API Tenant Binding Notes

> **Story:** LAW-014-02  
> **Status:** Implemented  
> **Base path:** `/api/law/v1/`  
> **Last updated:** 2026-07-06

---

## 1. Overview

Every authenticated Law API request must resolve a tenant before persistence operations. Tenant resolution is deterministic and ordered; the source is recorded on the request context for diagnostics.

---

## 2. Resolution order

| Priority | Source                                                | `tenantSource` value   |
| -------- | ----------------------------------------------------- | ---------------------- |
| 1        | Auth session user claim (`user.tenantId`)             | `auth_session`         |
| 2        | `x-tenant-id` request header                          | `tenant_claim`         |
| 3        | Active `LawApiPersistenceContext` (AsyncLocalStorage) | `persistence_context`  |
| 4        | Development fallback                                  | `development_fallback` |
| —        | None resolved                                         | `none`                 |

Implementation: `apps/web/lib/api/tenant/tenant-resolver.ts`

---

## 3. Tenant ID format

Tenant IDs must match:

```
^(?:t[\da-f]{7}|[\da-f]{8})-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$
```

This accepts standard UUIDs and Law Platform prefixed IDs (e.g. `t0000001-0000-4000-8000-000000000001`), aligned with `apps/law-platform/lib/persistence/default-tenant.ts`.

---

## 4. Development fallback

When `NODE_ENV !== "production"` and `LAW_API_ALLOW_DEV_TENANT_FALLBACK !== "false"`:

1. `LAW_TENANT_ID` environment variable (if valid format)
2. `DEFAULT_LAW_TENANT_ID` (`t0000001-0000-4000-8000-000000000001`)

**Production:** No fallback. Missing tenant returns `TENANT_REQUIRED` (403).

---

## 5. Persistence scope

When a tenant is resolved, `withLawApiAuth` binds a `LawApiPersistenceContext` via AsyncLocalStorage:

```typescript
{
  tenantId: string;
  actorId?: string;  // authenticated userId
}
```

Downstream handlers and repositories can read the active context with `getActiveLawApiPersistenceContext()`.

This mirrors the law-platform `runWithLawPersistenceContext` pattern without importing law-platform into the web API layer.

---

## 6. Request header

| Header        | Required    | Description                                         |
| ------------- | ----------- | --------------------------------------------------- |
| `x-tenant-id` | Conditional | Tenant claim when session does not carry `tenantId` |

Use only over authenticated transport. Do not rely on client-supplied tenant in production without session binding (TD-P02 gap — see completion report).

---

## 7. Known gap (TD-P02)

Better Auth user schema does not yet persist `tenantId` on the session user. Until TD-P02 closes:

- Production routes should require tenant from a trusted session claim once available
- Development and test may use `x-tenant-id` header or dev fallback

---

## 8. Related documents

- [LAW-API-Authentication-Notes](./LAW-API-Authentication-Notes.md)
- [LAW-API-Request-Context-Specification](../specs/LAW-API-Request-Context-Specification.md)
