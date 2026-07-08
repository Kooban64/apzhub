# LAW — API Design Standard

> **Milestone:** LAW-014 — Integration Foundation (planning)  
> **Status:** **Planning authority** — no endpoints implemented  
> **Authority:** [LAW-Integration-Reference-Architecture](../architecture/LAW-Integration-Reference-Architecture.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

This standard defines conventions for all Law Platform public REST APIs. Every future endpoint, SDK, and integration must comply.

---

## 2. Base URL and versioning

| Environment | Base URL (proposed)                                |
| ----------- | -------------------------------------------------- |
| Production  | `https://{tenant-subdomain}.apzhub.com/api/law/v1` |
| Staging     | `https://staging.apzhub.com/api/law/v1`            |
| Local       | `http://localhost:3000/api/law/v1`                 |

### Versioning rules

- Major version in URL path: `/api/v1/`, `/api/v2/`
- Minor/patch changes are backward-compatible within the same major version
- Breaking changes require new major version with overlap period
- `Accept-Version: v1` header optional — URL is authoritative

---

## 3. URL conventions

### 3.1 Resource naming

| Rule                      | Example                               |
| ------------------------- | ------------------------------------- |
| Plural nouns              | `/clients`, `/matters`, `/invoices`   |
| kebab-case for multi-word | `/calendar-events`, `/time-entries`   |
| No verbs in paths         | ✗ `/createClient` → ✓ `POST /clients` |
| Sub-resources             | `/matters/{matterId}/documents`       |
| Actions (non-CRUD)        | `POST /invoices/{id}/mark-paid`       |

### 3.2 Resource catalogue (v1)

| Resource              | Base path                |
| --------------------- | ------------------------ |
| Clients               | `/clients`               |
| Matters               | `/matters`               |
| Documents             | `/documents`             |
| Tasks                 | `/tasks`                 |
| Calendar events       | `/calendar-events`       |
| Time entries          | `/time-entries`          |
| Invoices              | `/invoices`              |
| Search                | `/search`                |
| Webhook subscriptions | `/webhook-subscriptions` |
| API keys (admin)      | `/admin/api-keys`        |

### 3.3 Standard operations

| Operation      | Method | Path pattern                 |
| -------------- | ------ | ---------------------------- |
| List           | GET    | `/{resources}`               |
| Create         | POST   | `/{resources}`               |
| Get            | GET    | `/{resources}/{id}`          |
| Update         | PATCH  | `/{resources}/{id}`          |
| Archive/delete | DELETE | `/{resources}/{id}`          |
| Action         | POST   | `/{resources}/{id}/{action}` |

Use `PATCH` for partial updates; `PUT` is not used in v1.

---

## 4. Request shape

### 4.1 Headers (required)

| Header              | Required    | Description                                      |
| ------------------- | ----------- | ------------------------------------------------ |
| `Authorization`     | Yes*        | `Bearer {token}` or `ApiKey {keyId}:{secret}`    |
| `Content-Type`      | Yes (body)  | `application/json`                               |
| `Accept`            | Recommended | `application/json`                               |
| `X-Correlation-Id`  | Recommended | Client-supplied UUID; echoed in response         |
| `X-Request-Id`      | Optional    | Client trace ID; server generates if absent      |
| `X-Idempotency-Key` | Conditional | Required on POST mutations that create resources |

*Except health/readiness probes.

### 4.2 Headers (conditional)

| Header            | When                                                 |
| ----------------- | ---------------------------------------------------- |
| `X-Tenant-Id`     | Service-to-service only; requires service credential |
| `If-Match`        | Optimistic concurrency — entity `version` value      |
| `Accept-Language` | Future localisation                                  |

### 4.3 Request body

```json
{
  "displayName": "Harbourview Holdings Pty Ltd",
  "clientType": "organisation",
  "status": "active",
  "tags": ["corporate", "retainer"],
  "customFields": {
    "industry": "Property Development"
  }
}
```

Rules:

- Unknown fields rejected with `400 VALIDATION_UNKNOWN_FIELD` (strict mode)
- Null clears nullable fields on PATCH
- Omitted fields unchanged on PATCH
- Dates as ISO 8601 UTC: `2026-07-06T10:30:00.000Z`
- References (`clientReference`) server-generated on create unless documented otherwise

---

## 5. Response shape

### 5.1 Success — single resource

```json
{
  "data": {
    "clientId": "c1000001-0001-4000-8000-000000000001",
    "clientReference": "CLT-2026-00001",
    "displayName": "Harbourview Holdings Pty Ltd",
    "clientType": "organisation",
    "status": "active",
    "tags": ["corporate", "retainer"],
    "customFields": { "industry": "Property Development" },
    "version": 3,
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-07-01T14:22:00.000Z"
  },
  "meta": {
    "requestId": "req-uuid",
    "correlationId": "corr-uuid"
  }
}
```

### 5.2 Success — list

```json
{
  "data": [/* resources */],
  "pagination": {
    "nextCursor": "eyJpZCI6...",
    "prevCursor": null,
    "hasMore": true,
    "limit": 25
  },
  "meta": {
    "requestId": "req-uuid",
    "correlationId": "corr-uuid",
    "totalCount": null
  }
}
```

`totalCount` is omitted by default (expensive on large tables). Available via `?include=totalCount` when supported.

### 5.3 Response headers

| Header             | Description                                       |
| ------------------ | ------------------------------------------------- |
| `X-Request-Id`     | Server-generated request identifier               |
| `X-Correlation-Id` | Echoed from request or server-generated           |
| `ETag`             | Entity version fingerprint on GET single resource |
| `Location`         | On 201 Created — URL of new resource              |
| `X-RateLimit-*`    | Rate limit state                                  |

---

## 6. Error envelope

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields failed validation.",
    "details": [
      {
        "field": "displayName",
        "code": "REQUIRED",
        "message": "Display name is required."
      }
    ],
    "correlationId": "corr-uuid",
    "requestId": "req-uuid",
    "documentationUrl": "https://docs.apzhub.com/legal-api/errors/VALIDATION_FAILED"
  }
}
```

### Error code catalogue (v1)

| Code                | HTTP | Description                           |
| ------------------- | ---- | ------------------------------------- |
| `UNAUTHENTICATED`   | 401  | Missing or invalid credentials        |
| `FORBIDDEN`         | 403  | Permission denied                     |
| `NOT_FOUND`         | 404  | Resource not found in tenant          |
| `VALIDATION_FAILED` | 400  | Field-level validation errors         |
| `MALFORMED_REQUEST` | 400  | JSON/schema parse failure             |
| `CONFLICT`          | 409  | Duplicate reference or state conflict |
| `VERSION_CONFLICT`  | 409  | Optimistic concurrency failure        |
| `RATE_LIMITED`      | 429  | Too many requests                     |
| `INTERNAL_ERROR`    | 500  | Unexpected server error               |

---

## 7. Pagination

### Cursor pagination (default)

```http
GET /api/law/v1/clients?limit=25&cursor=eyJpZCI6...
```

| Parameter | Description                          |
| --------- | ------------------------------------ |
| `limit`   | Page size (default 25, max 100)      |
| `cursor`  | Opaque cursor from previous response |

Cursor encodes sort key + ID — opaque to clients, stable across requests.

### Sorting with pagination

```http
GET /api/law/v1/clients?sort=displayName&order=asc&limit=25
```

Default sort: `createdAt desc` unless documented per resource.

---

## 8. Filtering

Query parameter filters — AND semantics:

```http
GET /api/law/v1/clients?status=active&clientType=organisation&query=harbour
```

| Parameter type | Encoding                                                           |
| -------------- | ------------------------------------------------------------------ |
| Enum           | Single value or comma-separated OR: `status=active,prospect`       |
| Date range     | `dueBefore=2026-12-31T00:00:00Z&dueAfter=2026-01-01T00:00:00Z`     |
| Full-text      | `query=` — matches reference, title, display name per entity rules |
| Foreign key    | `matterId=`, `clientId=`                                           |

Invalid filter values → `400 VALIDATION_INVALID_FILTER`.

---

## 9. Sorting

```http
GET /api/law/v1/matters?sort=matterStatus,-createdAt
```

| Rule           | Detail                                    |
| -------------- | ----------------------------------------- |
| Prefix `-`     | Descending                                |
| Multi-field    | Comma-separated, left-to-right precedence |
| Allowed fields | Documented per resource in OpenAPI        |
| Default        | `createdAt` descending if not specified   |

---

## 10. Idempotency

`X-Idempotency-Key` header on `POST` create operations:

- Client generates UUID
- Server stores key + response for 24 hours per tenant
- Duplicate key with same body → replay stored response (same status code)
- Duplicate key with different body → `409 CONFLICT`

Required for: client create, matter create, invoice create, payment record (future).

---

## 11. Correlation IDs

| ID                 | Source           | Propagation                  |
| ------------------ | ---------------- | ---------------------------- |
| `X-Correlation-Id` | Client or server | Logged, audit, outbox events |
| `X-Request-Id`     | Server (always)  | Per HTTP request             |

Both returned in `meta` block and error envelope.

---

## 12. Tenant headers

| Header        | Usage                                                 |
| ------------- | ----------------------------------------------------- |
| `X-Tenant-Id` | **Service accounts only** — explicit tenant targeting |

User Bearer tokens embed `tenantId` in claims — clients must not send `X-Tenant-Id`.

Mismatch between token tenant and header → `403 FORBIDDEN`.

---

## 13. Authentication headers

### Bearer (user session)

```http
Authorization: Bearer eyJhbGciOi...
```

Token issued by BetterAuth; contains `sub`, `tenantId`, `permissions[]` (or permission lookup key).

### API key (integration)

```http
Authorization: ApiKey key_abc123:secret_xyz789
```

- `keyId` identifies the key record (auditable, revocable)
- `secret` verified against bcrypt hash
- Key record stores `tenantId`, `permissions[]`, `rateLimitTier`

---

## 14. Compliance checklist

Every new endpoint must satisfy:

- [ ] Documented in OpenAPI before implementation
- [ ] Permission gate defined
- [ ] Tenant resolved before workflow call
- [ ] DTO mapper — no domain type leakage
- [ ] Error codes from catalogue
- [ ] Pagination/filter/sort aligned with repository filters
- [ ] Audit log entry on mutation
- [ ] Contract test (request → response shape)
- [ ] Integration test with auth + tenant isolation

---

## 15. Related documents

| Document                                                                                            | Purpose                       |
| --------------------------------------------------------------------------------------------------- | ----------------------------- |
| [LAW-OpenAPI-Planning](./LAW-OpenAPI-Planning.md)                                                   | Endpoint and schema catalogue |
| [LAW-Integration-Security-Model](../security/LAW-Integration-Security-Model.md)                     | Auth details                  |
| [LAW-Integration-Reference-Architecture](../architecture/LAW-Integration-Reference-Architecture.md) | Layer model                   |
