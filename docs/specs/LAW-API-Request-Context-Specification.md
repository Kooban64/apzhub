# LAW — API Request Context Specification

> **Story:** LAW-014-02  
> **Status:** Implemented  
> **Module:** `apps/web/lib/api/`  
> **Last updated:** 2026-07-06

---

## 1. Purpose

Defines the request context object passed to all Law API route handlers. Ensures consistent tracing, identity, tenant binding, and persistence scope across endpoints.

---

## 2. Types

### 2.1 Base tracing context (`LawApiRequestContext`)

| Field           | Type                | Source                                   |
| --------------- | ------------------- | ---------------------------------------- |
| `requestId`     | `string` (UUID)     | Generated per request                    |
| `correlationId` | `string`            | `x-correlation-id` header or `requestId` |
| `timestamp`     | `string` (ISO 8601) | Request entry time                       |

### 2.2 Authenticated context (`LawApiAuthenticatedContext`)

Extends `LawApiRequestContext`:

| Field                | Type                        | Description                        |
| -------------------- | --------------------------- | ---------------------------------- |
| `authenticated`      | `boolean`                   | Whether a valid session was found  |
| `user`               | `LawApiUser?`               | Mapped Platform user               |
| `tenantId`           | `string?`                   | Resolved tenant                    |
| `tenantSource`       | `LawApiTenantSource`        | How tenant was resolved            |
| `roles`              | `string[]`                  | User roles from permission context |
| `permissions`        | `string[]`                  | Granted permissions                |
| `permissionChecker`  | `LawApiPermissionChecker`   | `can(permission)` hook             |
| `repositoryMode`     | `"memory" \| "postgres"`    | From `LAW_REPOSITORY_MODE`         |
| `persistenceContext` | `LawApiPersistenceContext?` | ALS-bound tenant + actor           |

---

## 3. Construction

```typescript
// Public routes (health)
const tracing = resolveRequestContext(request);

// Protected routes
const result = await buildLawApiAuthenticatedContext(request, {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: "legal.nav.dashboard.view",
});
```

Route handlers receive context via `withLawApiAuth`:

```typescript
export const GET = withLawApiAuth(handleGet, {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: LAW_API_DIAGNOSTICS_PERMISSION,
});
```

---

## 4. Propagation

| Mechanism         | Scope                                                              |
| ----------------- | ------------------------------------------------------------------ |
| Handler parameter | Per-request, passed to `jsonSuccessResponse` / `jsonErrorResponse` |
| Response headers  | `x-request-id`, `x-correlation-id` echoed on every response        |
| AsyncLocalStorage | `persistenceContext` available within handler async scope          |
| Envelope `meta`   | `requestId`, `correlationId`, `timestamp` on all JSON responses    |

---

## 5. Correlation ID rules

- Header: `x-correlation-id`
- Max length: 128 characters
- Allowed characters: `[A-Za-z0-9_.-]`
- Invalid or missing values fall back to `requestId`

---

## 6. Repository mode

Read from `LAW_REPOSITORY_MODE` environment variable:

| Value      | Default          |
| ---------- | ---------------- |
| `memory`   | Yes (when unset) |
| `postgres` | Explicit opt-in  |

Reported in diagnostics; does not switch behaviour in LAW-014-02 (no entity persistence yet).

---

## 7. Future handler contract

All LAW-014-04+ entity handlers **must**:

1. Use `withLawApiAuth` with appropriate options
2. Read `context.tenantId` and `context.persistenceContext` — never trust raw body tenant fields
3. Check permissions via `context.permissionChecker.can(...)` or `requiredPermission` option
4. Pass `context` to response helpers for envelope consistency

---

## 8. Related documents

- [LAW-API-Authentication-Notes](../security/LAW-API-Authentication-Notes.md)
- [LAW-API-Tenant-Binding-Notes](../security/LAW-API-Tenant-Binding-Notes.md)
- [LAW-API-Design-Standard](./LAW-API-Design-Standard.md)
