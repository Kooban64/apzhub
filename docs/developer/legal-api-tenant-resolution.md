# Law Platform API — Tenant Resolution

> **Story:** LAW-014-07

---

## Requirement

All business API endpoints require a resolved **tenant**. Include:

```http
x-tenant-id: t0000001-0000-4000-8000-000000000001
```

---

## Resolution order

1. `x-tenant-id` request header (primary for API clients)
2. Session / auth claims (when configured)
3. Development fallback (disabled in production tests)

---

## Example headers

```http
GET /api/law/v1/matters
Cookie: better-auth.session_token=...
x-tenant-id: t0000001-0000-4000-8000-000000000001
x-correlation-id: matter-list-001
```

---

## Errors

| Code              | HTTP | When                                           |
| ----------------- | ---- | ---------------------------------------------- |
| `TENANT_REQUIRED` | 403  | Authenticated but tenant could not be resolved |
| `TENANT_MISMATCH` | 403  | Token tenant differs from header               |

---

## Tenant isolation

Resources are scoped to the resolved tenant. A resource ID from another tenant returns **404 Not Found**.

---

## Postman / Bruno

Set collection variables:

| Variable   | Example                                |
| ---------- | -------------------------------------- |
| `tenantId` | `t0000001-0000-4000-8000-000000000001` |
| `baseUrl`  | `http://localhost:3300/api/law/v1`     |

Download collections from [/api/docs](/api/docs).
