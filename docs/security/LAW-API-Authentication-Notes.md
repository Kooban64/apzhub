# LAW — API Authentication Notes

> **Story:** LAW-014-02  
> **Status:** Implemented  
> **Base path:** `/api/law/v1/`  
> **Last updated:** 2026-07-06

---

## 1. Overview

Law Platform API authentication delegates entirely to the existing Platform Better Auth integration. The API layer does not duplicate session validation, token parsing, or user lookup logic.

---

## 2. Authentication flow

```
Request → withLawApiAuth → buildLawApiAuthenticatedContext
         → authenticateLawApiRequest (getValidatedSession)
         → resolveLawApiUser
         → resolveLawApiTenant
         → resolveLawApiPermissions
         → handler
```

| Step               | Module                                        | Responsibility                      |
| ------------------ | --------------------------------------------- | ----------------------------------- |
| Session validation | `@apzhub/auth/server` → `getValidatedSession` | Database-backed Better Auth session |
| User mapping       | `auth/user-resolver.ts`                       | Maps session user → `LawApiUser`    |
| Permission hook    | `auth/permission-resolver.ts`                 | Workbench permission adapter        |
| Middleware         | `middleware/with-law-api-auth.ts`             | Wraps route handlers                |

---

## 3. Resolved identity

| Field           | Source                                   |
| --------------- | ---------------------------------------- |
| `userId`        | Better Auth session `user.id`            |
| `email`         | Better Auth session `user.email`         |
| `name`          | Better Auth session `user.name`          |
| `emailVerified` | Better Auth session `user.emailVerified` |
| `roles`         | Workbench auth permission context        |
| `permissions`   | Workbench auth permission context        |

---

## 4. Route protection modes

| Route                         | Auth     | Tenant   | Permission                 |
| ----------------------------- | -------- | -------- | -------------------------- |
| `GET /api/law/v1/health`      | Public   | —        | —                          |
| `GET /api/law/v1/diagnostics` | Required | Required | `legal.nav.dashboard.view` |

Future entity routes will use `withLawApiAuth` with route-specific permission requirements.

---

## 5. Error responses

| HTTP | Code              | When                                           |
| ---- | ----------------- | ---------------------------------------------- |
| 401  | `UNAUTHENTICATED` | Session missing or invalid when auth required  |
| 403  | `FORBIDDEN`       | Authenticated but permission denied            |
| 403  | `TENANT_REQUIRED` | Authenticated but tenant could not be resolved |

All errors use the standard Law API envelope (`ok: false`, `error`, `meta`).

---

## 6. Permission resolver

The permission hook uses:

- `createAuthPermissionContextFromUser` from `@apzhub/workbench-framework/server`
- `createWorkbenchPermissionAdapter` from `@apzhub/workbench-framework`

In `NODE_ENV=test`, the adapter defaults to allow-all mode. Production uses auth-scoped permission checks.

When `isDevRegistrationAllowed()` is true (development + `ALLOW_DEV_REGISTRATION=true`), authenticated users receive wildcard `["*"]` permissions — mirroring the Workbench hydration pattern.

---

## 7. Security constraints

- Diagnostics and auth status reporting **never** expose secrets, tokens, or session IDs
- Session cookies are validated server-side only; no client-side token handling in the API layer
- API keys and OAuth providers are **out of scope** for LAW-014-02

---

## 8. Related documents

- [LAW-API-Tenant-Binding-Notes](./LAW-API-Tenant-Binding-Notes.md)
- [LAW-API-Request-Context-Specification](../specs/LAW-API-Request-Context-Specification.md)
- [legal-api-v1-stub](../developer/legal-api-v1-stub.md)
