# Law Platform API v1 — Documentation Stub

> **Status:** Auth & tenant binding (LAW-014-02)  
> **Base path:** `/api/law/v1`  
> **OpenAPI:** Not yet published — see [LAW-OpenAPI-Planning](../specs/LAW-OpenAPI-Planning.md)

---

## Overview

The Law Platform REST API exposes tenant-scoped legal practice management operations. LAW-014-01 established route scaffolding and response envelopes. LAW-014-02 adds authentication, tenant resolution, permission hooks, and request context propagation. Entity endpoints will be added in subsequent stories.

---

## Base URL

| Environment | URL                                |
| ----------- | ---------------------------------- |
| Local       | `http://localhost:3000/api/law/v1` |

---

## Request headers

| Header             | Required         | Description                                       |
| ------------------ | ---------------- | ------------------------------------------------- |
| `Accept`           | Recommended      | `application/json`                                |
| `Cookie`           | Protected routes | Better Auth session cookie                        |
| `x-correlation-id` | Optional         | Client trace ID (max 128 chars; `[A-Za-z0-9_.-]`) |
| `x-tenant-id`      | Conditional      | Tenant claim when session lacks `tenantId`        |

---

## Response headers

| Header             | Description                                  |
| ------------------ | -------------------------------------------- |
| `x-request-id`     | Server-generated per-request identifier      |
| `x-correlation-id` | Echoed from request or equals `x-request-id` |

---

## Success envelope

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "requestId": "uuid",
    "correlationId": "uuid-or-client-value",
    "timestamp": "2026-07-06T10:00:00.000Z"
  }
}
```

---

## Error envelope

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication is required to access this resource."
  },
  "meta": {
    "requestId": "uuid",
    "correlationId": "uuid",
    "timestamp": "2026-07-06T10:00:00.000Z"
  }
}
```

---

## Available routes

### GET `/health` (public)

Liveness probe for the Law API scaffold.

**Response `data`:**

```json
{
  "status": "healthy",
  "service": "law-platform-api",
  "apiVersion": "v1",
  "scaffoldVersion": "1.0.0",
  "basePath": "/api/law/v1"
}
```

### GET `/diagnostics` (authenticated)

Scaffold diagnostics including auth status, tenant source, repository mode, and principal summary. No secrets exposed.

**Requires:** valid session, resolved tenant, permission `legal.nav.dashboard.view`

**Response `data` includes:**

- `auth.authenticated`, `auth.tenantSource`, `auth.repositoryMode`, `auth.principal`
- `capabilities.authentication`, `capabilities.authorization`
- Route catalogue

---

## Error codes

| Code                 | HTTP | Description                        |
| -------------------- | ---- | ---------------------------------- |
| `UNAUTHENTICATED`    | 401  | Session missing or invalid         |
| `FORBIDDEN`          | 403  | Permission denied                  |
| `TENANT_REQUIRED`    | 403  | Tenant could not be resolved       |
| `METHOD_NOT_ALLOWED` | 405  | HTTP method not supported on route |
| `MALFORMED_REQUEST`  | 400  | Invalid JSON or Content-Type       |

---

## Next steps

| Story       | Deliverable                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| LAW-014-03  | OpenAPI specification — [LAW-OpenAPI-v1.yaml](../specs/LAW-OpenAPI-v1.yaml) |
| LAW-014-04+ | Entity REST APIs                                                            |

---

## Related documents

- [LAW-API-Authentication-Notes](../security/LAW-API-Authentication-Notes.md)
- [LAW-API-Tenant-Binding-Notes](../security/LAW-API-Tenant-Binding-Notes.md)
- [LAW-API-Request-Context-Specification](../specs/LAW-API-Request-Context-Specification.md)
- [LAW-API-Design-Standard](../specs/LAW-API-Design-Standard.md)
- [LAW-014-02 completion report](../sprint/LAW-014-02-completion-report.md)
