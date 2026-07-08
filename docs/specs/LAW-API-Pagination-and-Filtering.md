# LAW — API Pagination, Filtering, and Sorting

> **Story:** LAW-014-03  
> **Status:** Specification authority  
> **OpenAPI:** [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml)  
> **Base path:** `/api/law/v1/`  
> **Last updated:** 2026-07-06

---

## 1. Overview

All collection endpoints (`GET /{resources}`) use cursor-based pagination with optional filtering, sorting, field selection, and expansion. This document is the human-readable authority; OpenAPI parameters define per-resource filters.

---

## 2. Pagination

### 2.1 Cursor model (default)

| Parameter | Type    | Default | Max | Description                          |
| --------- | ------- | ------- | --- | ------------------------------------ |
| `limit`   | integer | 25      | 100 | Page size                            |
| `cursor`  | string  | —       | —   | Opaque cursor from previous response |

### 2.2 Response shape

```json
{
  "ok": true,
  "data": [],
  "pagination": {
    "limit": 25,
    "nextCursor": "eyJpZCI6ImMwMDAwMDAxIn0",
    "prevCursor": null,
    "hasMore": true,
    "totalCount": null
  },
  "meta": {
    "requestId": "...",
    "correlationId": "...",
    "timestamp": "2026-07-06T10:00:00.000Z"
  }
}
```

### 2.3 Rules

- Cursors are opaque — clients must not parse or construct them
- Cursors are stable for the same sort/filter combination within a reasonable TTL
- `totalCount` is omitted unless `include=totalCount` is requested (expensive)
- Offset pagination is **not supported** in v1

### 2.4 Example

```http
GET /api/law/v1/clients?limit=25&sort=displayName&order=asc
GET /api/law/v1/clients?limit=25&cursor=eyJpZCI6ImMwMDAwMDAxIn0
```

---

## 3. Sorting

| Parameter | Format                                          | Example                       |
| --------- | ----------------------------------------------- | ----------------------------- |
| `sort`    | Comma-separated fields; `-` prefix = descending | `sort=-createdAt,displayName` |

### Defaults

| Resource        | Default sort             |
| --------------- | ------------------------ |
| Clients         | `displayName` asc        |
| Matters         | `-openedAt`              |
| Documents       | `-createdAt`             |
| Tasks           | `dueAt` asc (nulls last) |
| Calendar events | `startsAt` asc           |
| Time entries    | `-entryDate`             |
| Invoices        | `-issueDate`             |
| Activities      | `-occurredAt`            |
| Notifications   | `-createdAt`             |

Invalid sort field → `400 VALIDATION_INVALID_FILTER`.

---

## 4. Filtering

Query parameters use **AND** semantics across parameters; comma-separated values within a parameter use **OR**.

### 4.1 Common filters

| Parameter       | Type      | Example                                         |
| --------------- | --------- | ----------------------------------------------- |
| `query`         | string    | Full-text across reference, title, display name |
| `status`        | enum      | `status=active,prospect`                        |
| `clientId`      | string    | Foreign key filter                              |
| `matterId`      | string    | Foreign key filter                              |
| `createdAfter`  | date-time | ISO 8601 UTC                                    |
| `createdBefore` | date-time | ISO 8601 UTC                                    |

### 4.2 Resource-specific filters

| Resource      | Additional filters                                                    |
| ------------- | --------------------------------------------------------------------- |
| Clients       | `clientType`, `status`                                                |
| Matters       | `matterStatus`, `priority`, `clientId`, `leadAttorneyId`              |
| Documents     | `documentType`, `documentStatus`, `matterId`                          |
| Tasks         | `taskStatus`, `assigneeUserId`, `dueBefore`, `dueAfter`               |
| Calendar      | `eventType`, `startsAfter`, `startsBefore`, `ownerUserId`             |
| Time          | `userId`, `entryDateFrom`, `entryDateTo`, `billable`, `billingStatus` |
| Invoices      | `invoiceStatus`, `clientId`, `dueBefore`, `dueAfter`                  |
| Activities    | `matterId`, `clientId`, `activityType`                                |
| Notifications | `read` (boolean)                                                      |

Invalid filter → `400 VALIDATION_INVALID_FILTER`.

---

## 5. Field selection

| Parameter | Description                                         |
| --------- | --------------------------------------------------- |
| `fields`  | Comma-separated response fields (sparse projection) |

Rules:

- Identifier and reference fields always included
- Unknown field → `400 VALIDATION_INVALID_FILTER`
- Does not apply to nested expansions

Example:

```http
GET /api/law/v1/clients/{clientId}?fields=displayName,status,tags
```

---

## 6. Includes and expansion

| Parameter | Description                      |
| --------- | -------------------------------- |
| `include` | Comma-separated expansion tokens |

| Token        | Expands                                |
| ------------ | -------------------------------------- |
| `client`     | Client summary on matter/document/task |
| `matter`     | Matter summary on document/task/time   |
| `lineItems`  | Invoice line items (default on detail) |
| `totalCount` | Adds `pagination.totalCount`           |

Example:

```http
GET /api/law/v1/matters?include=client&limit=25
```

---

## 7. Search operations

| Operation       | Method | Path             | Body            |
| --------------- | ------ | ---------------- | --------------- |
| Quick search    | GET    | `/search?query=` | —               |
| Advanced search | POST   | `/search`        | `SearchQueryV1` |

Search results are not paginated with cursor in v1 quick search; advanced search may add cursor in implementation.

---

## 8. Optimistic concurrency

| Header     | Usage                                            |
| ---------- | ------------------------------------------------ |
| `If-Match` | Entity `version` integer or ETag on PATCH/DELETE |
| `ETag`     | Returned on GET single resource                  |

Mismatch → `412 PRECONDITION_FAILED` or `409 VERSION_CONFLICT`.

---

## 9. Idempotency

| Header              | Required on                               |
| ------------------- | ----------------------------------------- |
| `x-idempotency-key` | POST create on Clients, Matters, Invoices |

- UUID recommended
- Stored 24 hours per tenant
- Same key + same body → replay stored response
- Same key + different body → `409 CONFLICT`

---

## 10. Correlation and request IDs

| Header             | Direction          | Description                    |
| ------------------ | ------------------ | ------------------------------ |
| `x-correlation-id` | Request (optional) | Client trace ID; max 128 chars |
| `x-request-id`     | Response (always)  | Server-generated UUID          |
| `x-correlation-id` | Response (always)  | Echoed or equals request ID    |

Both appear in `meta` on every response.

---

## 11. Version headers

| Header           | Description                                     |
| ---------------- | ----------------------------------------------- |
| `Accept-Version` | Optional hint (`v1`); URL path is authoritative |
| `Sunset`         | Planned — deprecation date for endpoints        |
| `Deprecation`    | Planned — boolean deprecation flag              |

---

## 12. Content negotiation

| Header         | Value              | Required           |
| -------------- | ------------------ | ------------------ |
| `Accept`       | `application/json` | Recommended        |
| `Content-Type` | `application/json` | Required on bodies |

Unsupported Content-Type → `415 UNSUPPORTED_MEDIA_TYPE`.

---

## 13. Related documents

- [LAW-API-Design-Standard](./LAW-API-Design-Standard.md)
- [LAW-API-DTO-Catalogue](./LAW-API-DTO-Catalogue.md)
- [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml)
