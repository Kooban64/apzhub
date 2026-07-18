# Law Platform API — Authentication

> **Story:** LAW-014-07

---

## Overview

The Law Platform API uses **Better Auth** session authentication for browser and programmatic clients.

| Scheme         | Use case                                      |
| -------------- | --------------------------------------------- |
| Session cookie | Browser apps, Swagger UI explorer after login |
| Bearer token   | Programmatic clients (when configured)        |

---

## Example authentication flow (browser)

1. `POST /api/auth/sign-in/email` with credentials (via login page).
2. Browser stores `better-auth.session_token` cookie.
3. Subsequent `fetch("/api/law/v1/clients")` calls include the cookie automatically.
4. Add `x-tenant-id` header for tenant-scoped endpoints.

---

## Example authentication flow (API client)

```http
GET /api/law/v1/clients
Authorization: Bearer <session-token-or-api-key>
x-tenant-id: t0000001-0000-4000-8000-000000000001
x-correlation-id: partner-corr-001
```

---

## Unauthenticated requests

Return **401** with:

```json
{
  "ok": false,
  "error": { "code": "UNAUTHENTICATED", "message": "Authentication is required..." },
  "meta": {}
}
```

---

## Swagger UI / API explorer

1. Open [/api/docs](../developer/legal-api-developer-guide.md).
2. Sign in to the portal in another tab (same origin).
3. Use **Try it out** on any endpoint — cookies are sent automatically.
4. Set `x-tenant-id` in the request headers field.

---

## Related

- [Tenant resolution](./legal-api-tenant-resolution.md)
- [Permissions](./legal-api-permissions.md)
- [Troubleshooting — 401](./legal-api-troubleshooting.md)
