# Law Platform API — Error Handling

> **Story:** LAW-014-07  
> **Authority:** [LAW-API-Error-Catalogue.md](../specs/LAW-API-Error-Catalogue.md)

---

## Error envelope

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields failed validation.",
    "details": [
      {
        "field": "displayName",
        "code": "INVALID",
        "message": "Display name is required."
      }
    ]
  },
  "meta": {
    "requestId": "...",
    "correlationId": "...",
    "timestamp": "..."
  }
}
```

Every error includes `x-request-id` and `x-correlation-id` response headers.

---

## Common status codes

| HTTP | Code                            | When                                    |
| ---- | ------------------------------- | --------------------------------------- |
| 400  | `MALFORMED_REQUEST`             | Invalid JSON or missing required fields |
| 401  | `UNAUTHENTICATED`               | No valid session                        |
| 403  | `FORBIDDEN` / `TENANT_REQUIRED` | Permission or tenant failure            |
| 404  | `NOT_FOUND`                     | Resource absent in tenant               |
| 409  | `CONFLICT`                      | State conflict                          |
| 412  | `PRECONDITION_FAILED`           | If-Match version mismatch               |
| 422  | `VALIDATION_FAILED`             | Business validation failure             |
| 500  | `INTERNAL_ERROR`                | Unexpected server error                 |

---

## Validation details

Field-level errors appear in `error.details[]` with `field`, `code`, and `message`.

---

## Related

- [Troubleshooting](./legal-api-troubleshooting.md)
- [Error catalogue](../specs/LAW-API-Error-Catalogue.md)
