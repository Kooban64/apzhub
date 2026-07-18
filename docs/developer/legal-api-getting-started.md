# Law Platform API — Getting Started

> **Story:** LAW-014-07  
> **Base path:** `/api/law/v1/`  
> **OpenAPI:** [/api/law/v1/openapi.yaml](../specs/LAW-OpenAPI-v1.yaml)

---

## Base URL

| Environment | URL                                     |
| ----------- | --------------------------------------- |
| Local       | `http://localhost:3300/api/law/v1`      |
| Staging     | `https://staging.apzhub.com/api/law/v1` |
| Production  | `https://api.apzhub.com/api/law/v1`     |

---

## First request

1. Sign in at `/login` (session cookie is set automatically).
2. Include the tenant header on every business API call.
3. Call a public health endpoint first, then an authenticated list endpoint.

```http
GET /api/law/v1/health
```

```http
GET /api/law/v1/clients?limit=10
Cookie: better-auth.session_token=...
x-tenant-id: t0000001-0000-4000-8000-000000000001
x-correlation-id: my-first-request
```

---

## Response envelope

Success:

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "requestId": "...",
    "correlationId": "my-first-request",
    "timestamp": "2026-07-06T12:00:00.000Z"
  }
}
```

List success adds `pagination`:

```json
{
  "ok": true,
  "data": [],
  "pagination": {
    "limit": 25,
    "hasMore": false,
    "nextCursor": null,
    "prevCursor": null
  },
  "meta": {}
}
```

---

## Implemented resources

Clients, Matters, Documents, Tasks, Calendar Events, Time Entries, Invoices.

---

## Interactive docs

- **Documentation landing:** [/api/docs](../developer/legal-api-developer-guide.md)
- **OpenAPI YAML:** [/api/law/v1/openapi.yaml](../specs/LAW-OpenAPI-v1.yaml)
- **OpenAPI JSON:** [/api/law/v1/openapi.json](../specs/LAW-OpenAPI-v1.yaml)

---

## Related guides

- [Authentication](./legal-api-authentication.md)
- [Tenant resolution](./legal-api-tenant-resolution.md)
- [API onboarding](./legal-api-onboarding.md)
