# Law Platform API — Optimistic Concurrency

> **Story:** LAW-014-07

---

## Overview

Detail responses include an **ETag** header with the resource version number. Mutations accept an optional **If-Match** header.

---

## Read version

```http
GET /api/law/v1/clients/{clientId}
```

Response headers:

```http
ETag: "3"
```

---

## Conditional update

```http
PATCH /api/law/v1/clients/{clientId}
If-Match: 3
Content-Type: application/json
```

If the current version differs, returns **412 PRECONDITION_FAILED**:

```json
{
  "ok": false,
  "error": {
    "code": "PRECONDITION_FAILED",
    "message": "Resource version mismatch."
  },
  "meta": {}
}
```

---

## When to use

- PATCH and DELETE on all versioned resources
- Optional — omit `If-Match` to skip version check (last-write-wins)

---

## Related

- [Error handling](./legal-api-error-handling.md)
