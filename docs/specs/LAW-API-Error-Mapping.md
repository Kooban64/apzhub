# LAW — API Error Mapping Guide

> **Story:** LAW-014-05  
> **Status:** Implementation guide  
> **Authority:** [LAW-API-Error-Catalogue.md](./LAW-API-Error-Catalogue.md)  
> **Last updated:** 2026-07-06

---

## Rule

**No controller should manually construct error envelopes.**

Use typed error classes or framework response helpers from `apps/web/lib/api/framework/errors.ts`.

---

## Error class → HTTP mapping

| Class                        | `error.code`          | HTTP | When to use                                                      |
| ---------------------------- | --------------------- | ---- | ---------------------------------------------------------------- |
| `ValidationError`            | `VALIDATION_FAILED`   | 422  | Business rule / field validation from WorkflowService            |
| `NotFoundError`              | `NOT_FOUND`           | 404  | Resource absent in tenant scope                                  |
| `ConflictError`              | `CONFLICT`            | 409  | Duplicate reference, idempotency mismatch, state conflict        |
| `PermissionError`            | `FORBIDDEN`           | 403  | Explicit permission denial in handler (rare — prefer middleware) |
| `TenantIsolationError`       | `TENANT_MISMATCH`     | 403  | Cross-tenant access attempt                                      |
| `OptimisticConcurrencyError` | `PRECONDITION_FAILED` | 412  | If-Match / ETag version mismatch                                 |

Auth errors remain in `apps/web/lib/api/auth/auth-errors.ts`:

| Helper                     | Code              | HTTP |
| -------------------------- | ----------------- | ---- |
| `unauthorizedResponse()`   | `UNAUTHENTICATED` | 401  |
| `forbiddenResponse()`      | `FORBIDDEN`       | 403  |
| `tenantRequiredResponse()` | `TENANT_REQUIRED` | 403  |

Request shape errors remain in `apps/web/lib/api/validation.ts`:

| Helper                           | Code                 | HTTP |
| -------------------------------- | -------------------- | ---- |
| `parseJsonBody()` failure        | `MALFORMED_REQUEST`  | 400  |
| `requireRequestFields()` failure | `MALFORMED_REQUEST`  | 400  |
| `validateHttpMethod()` failure   | `METHOD_NOT_ALLOWED` | 405  |

---

## Response helpers (preferred in handlers)

```typescript
// 404
return notFoundResponse(context, "Client not found.");

// 422 from workflow validation map
return workflowValidationToResponse(context, result.validationErrors);

// 422 from field map
return validationErrorResponse(context, { displayName: "Required" });

// 412 from If-Match
const failed = ifMatchPreconditionResponse(context, expectedVersion, currentVersion);
if (failed) return failed;

// 409
return conflictResponse(context, "Client reference already exists.");

// 500 unexpected
return internalErrorResponse(context, "Client could not be created.");
```

---

## Throwing vs returning

| Pattern                       | Use                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| **Return** response helper    | Normal control flow in handlers (preferred)                                             |
| **Throw** typed `LawApiError` | Deep in shared utilities; caught by `createLawApiController` via `translateLawApiError` |

```typescript
// Throw pattern (utilities)
assertIfMatchVersion(expected, current); // throws OptimisticConcurrencyError

// Return pattern (handlers)
if (!result.client) {
  return notFoundResponse(context, "Client not found.");
}
```

---

## Workflow validation mapping

WorkflowService results commonly return:

```typescript
{ ok: boolean; client?: Client; validationErrors?: Record<string, string> }
```

Map validation errors:

```typescript
if (result.validationErrors) {
  return workflowValidationToResponse(context, result.validationErrors);
}
```

This produces:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields failed validation.",
    "details": [
      { "field": "displayName", "code": "INVALID", "message": "..." }
    ]
  },
  "meta": { ... }
}
```

---

## Unknown errors

`createLawApiController` wraps handlers and calls `translateLawApiError()` on uncaught exceptions:

- `LawApiError` subclasses → mapped envelope
- Everything else → `500 INTERNAL_ERROR`

---

## Repository error translation (future)

When repository layers throw structured errors, add mappers in `framework/errors.ts`:

```typescript
export function translateRepositoryError(error: unknown, context): NextResponse {
  // Map DB constraint violations → CONFLICT
  // Map row-not-found → NOT_FOUND
}
```

Not yet implemented — WorkflowService currently absorbs repository outcomes.

---

## Related documents

- [LAW-API-Error-Catalogue.md](./LAW-API-Error-Catalogue.md)
- [LAW-API-Framework.md](./LAW-API-Framework.md)
