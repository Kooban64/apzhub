# LAW — API Error Catalogue

> **Story:** LAW-014-03  
> **Status:** Specification authority  
> **OpenAPI:** [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml)  
> **Base path:** `/api/law/v1/`  
> **Last updated:** 2026-07-06

---

## 1. Error envelope

All error responses use:

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable summary.",
    "details": {},
    "documentationUrl": "https://docs.apzhub.com/legal-api/errors/ERROR_CODE"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "correlationId": "partner-corr-001",
    "timestamp": "2026-07-06T10:00:00.000Z"
  }
}
```

Headers: `x-request-id`, `x-correlation-id` (always present).

---

## 2. HTTP status catalogue

| HTTP                           | When                                                           | Retry                                 |
| ------------------------------ | -------------------------------------------------------------- | ------------------------------------- |
| **400** Bad Request            | Malformed JSON, unknown fields, invalid filters                | Fix request                           |
| **401** Unauthorized           | Missing or invalid authentication                              | Re-authenticate                       |
| **403** Forbidden              | Permission denied or tenant unresolved                         | Do not retry without privilege change |
| **404** Not Found              | Resource absent in tenant scope                                | Do not retry                          |
| **409** Conflict               | Duplicate idempotency key, state conflict, duplicate reference | Conditional                           |
| **412** Precondition Failed    | `If-Match` / ETag version mismatch                             | Refetch and retry                     |
| **415** Unsupported Media Type | Content-Type not `application/json`                            | Fix Content-Type                      |
| **422** Unprocessable Entity   | Valid JSON but business rule violation                         | Fix semantics                         |
| **429** Too Many Requests      | Rate limit exceeded                                            | Retry after `Retry-After`             |
| **500** Internal Server Error  | Unexpected failure                                             | Retry with backoff                    |

---

## 3. Error code catalogue

### 3.1 Authentication and authorization

| Code              | HTTP | Description                                   |
| ----------------- | ---- | --------------------------------------------- |
| `UNAUTHENTICATED` | 401  | Session or API key missing/invalid            |
| `FORBIDDEN`       | 403  | Authenticated but permission denied           |
| `TENANT_REQUIRED` | 403  | Tenant could not be resolved                  |
| `TENANT_MISMATCH` | 403  | Token tenant differs from `x-tenant-id` claim |

### 3.2 Request shape

| Code                        | HTTP | Description                                  |
| --------------------------- | ---- | -------------------------------------------- |
| `MALFORMED_REQUEST`         | 400  | JSON parse failure or invalid Content-Type   |
| `VALIDATION_FAILED`         | 400  | Field-level validation errors in `details[]` |
| `VALIDATION_UNKNOWN_FIELD`  | 400  | Strict mode rejected unknown property        |
| `VALIDATION_INVALID_FILTER` | 400  | Unsupported or malformed query filter        |
| `UNSUPPORTED_MEDIA_TYPE`    | 415  | Content-Type not accepted                    |

### 3.3 Resource state

| Code                   | HTTP | Description                                    |
| ---------------------- | ---- | ---------------------------------------------- |
| `NOT_FOUND`            | 404  | Resource not found (tenant-scoped)             |
| `CONFLICT`             | 409  | Duplicate reference, idempotency body mismatch |
| `VERSION_CONFLICT`     | 409  | Optimistic concurrency failure                 |
| `PRECONDITION_FAILED`  | 412  | `If-Match` ETag mismatch                       |
| `UNPROCESSABLE_ENTITY` | 422  | Business rule violation                        |
| `METHOD_NOT_ALLOWED`   | 405  | HTTP method not supported (includes PUT in v1) |

### 3.4 Rate limiting and infrastructure

| Code                  | HTTP | Description                      |
| --------------------- | ---- | -------------------------------- |
| `RATE_LIMITED`        | 429  | Rate limit exceeded              |
| `INTERNAL_ERROR`      | 500  | Unexpected server error          |
| `SERVICE_UNAVAILABLE` | 503  | Planned — dependency unavailable |

---

## 4. Validation error details

`VALIDATION_FAILED` responses include:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields failed validation.",
    "details": [
      {
        "field": "displayName",
        "code": "REQUIRED",
        "message": "Display name is required."
      },
      {
        "field": "dueDate",
        "code": "INVALID_FORMAT",
        "message": "Expected ISO 8601 date."
      }
    ]
  },
  "meta": {}
}
```

### Field error codes

| Code             | Meaning                              |
| ---------------- | ------------------------------------ |
| `REQUIRED`       | Missing required field               |
| `INVALID_FORMAT` | Type or format mismatch              |
| `TOO_LONG`       | Exceeds max length                   |
| `TOO_SHORT`      | Below min length                     |
| `OUT_OF_RANGE`   | Numeric/date out of bounds           |
| `INVALID_ENUM`   | Value not in allowed set             |
| `READ_ONLY`      | Field cannot be set on create/update |

---

## 5. Problem response (RFC 9457 alignment)

Law API v1 uses the platform envelope above. For integrators expecting RFC 9457 Problem Details, a future version may add `application/problem+json` via content negotiation. The canonical v1 format remains the `ok`/`error`/`meta` envelope implemented in LAW-014-01.

Mapping:

| Envelope field   | Problem field             |
| ---------------- | ------------------------- |
| `error.code`     | `type` / extension `code` |
| `error.message`  | `title`                   |
| `error.details`  | `errors` extension        |
| `meta.requestId` | extension `requestId`     |

---

## 6. Rate limit headers

| Header                  | Description                       |
| ----------------------- | --------------------------------- |
| `x-ratelimit-limit`     | Requests allowed per window       |
| `x-ratelimit-remaining` | Remaining requests                |
| `x-ratelimit-reset`     | Unix timestamp when window resets |
| `retry-after`           | Seconds to wait (429 responses)   |

---

## 7. Implemented vs planned

| Code                 | Implemented (LAW-014-02) | Planned     |
| -------------------- | ------------------------ | ----------- |
| `UNAUTHENTICATED`    | Yes                      | —           |
| `FORBIDDEN`          | Yes                      | —           |
| `TENANT_REQUIRED`    | Yes                      | —           |
| `METHOD_NOT_ALLOWED` | Yes                      | —           |
| `MALFORMED_REQUEST`  | Yes                      | —           |
| All entity codes     | —                        | LAW-014-04+ |

---

## 8. Related documents

- [LAW-API-Design-Standard](./LAW-API-Design-Standard.md)
- [LAW-API-Authentication-Notes](../security/LAW-API-Authentication-Notes.md)
- [LAW-OpenAPI-v1.yaml](./LAW-OpenAPI-v1.yaml)
