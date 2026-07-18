# APZHUB — Testing Error Model

**Milestone:** APZTCMS-011  
**Source:** `packages/platform-services/src/services/testing/map-testing-error.ts`  
**Output type:** `PlatformServiceError` from `@apzhub/platform-service-contracts`  
**Status:** All testing gateway operations map domain/persistence errors at platform boundary

---

## Translation flow

```text
DomainRuleError / PersistenceError / unknown
        ↓
mapTestingDomainError(error, correlationId)
        ↓
PlatformServiceError  (category, code, message, correlationId, retryable, details?)
        ↓
[Future HTTP] standard response envelope (010)
```

Every platform impl wraps operations with `withTestingErrorMapping(fn, ctx.correlationId)`.

---

## Domain rule mappings

Pattern match on `DomainRuleError.code`:

| Pattern (regex)                       | Category        | Code                          | Retryable |
| ------------------------------------- | --------------- | ----------------------------- | --------- |
| validation / invalid format           | `validation`    | `VALIDATION_FAILED`           | no        |
| invalid transition / state_transition | `business_rule` | `INVALID_STATE_TRANSITION`    | no        |
| approval order                        | `business_rule` | `APPROVAL_ORDER_VIOLATION`    | no        |
| evidence incomplete                   | `business_rule` | `EVIDENCE_INCOMPLETE`         | no        |
| certification gate                    | `business_rule` | `CERTIFICATION_GATE_FAILURE`  | no        |
| not ready                             | `business_rule` | `CERTIFICATION_NOT_READY`     | no        |
| duplicate automation                  | `conflict`      | `DUPLICATE_AUTOMATION_IMPORT` | no        |
| invalid automation result             | `validation`    | `INVALID_AUTOMATION_RESULT`   | no        |
| not_implemented / unsupported         | `configuration` | `CAPABILITY_UNSUPPORTED`      | no        |
| (default)                             | `business_rule` | `BUSINESS_RULE_VIOLATION`     | no        |

`details.classification` preserves original domain code for diagnostics (not user-facing copy).

---

## Persistence mappings

| `PersistenceError.code` | Category        | Code                |
| ----------------------- | --------------- | ------------------- |
| `NOT_FOUND`             | `not_found`     | `NOT_FOUND`         |
| `REVISION_CONFLICT`     | `conflict`      | `CONFLICT`          |
| `TENANT_MISMATCH`       | `authorization` | `TENANT_MISMATCH`   |
| `UNAUTHORIZED`          | `authorization` | `PERMISSION_DENIED` |
| `VALIDATION`            | `validation`    | `VALIDATION_FAILED` |

---

## Pass-through and fallback

- Existing `PlatformServiceError` instances pass through unchanged (`isPlatformServiceError`).
- Unclassified errors → `category: "system"`, `code: "INTERNAL_ERROR"`, generic message — **no raw stack or SQL in message**.

---

## Gateway disabled error

Separate from translation — when testing is not wired:

```typescript
{
  category: "configuration",
  code: "PROVIDER_CAPABILITY_UNSUPPORTED",
  message: "Testing service is not enabled",
  retryable: false,
}
```

---

## HTTP layer rules (APZTCMS-012)

Future route handlers must:

1. Never expose `DomainRuleError` or `PersistenceError` directly
2. Map `PlatformServiceError.category` to HTTP status per platform envelope
3. Propagate `correlationId` in response headers/body
4. Omit backend table names, constraint names, and internal codes from user messages

---

## Tests

`map-testing-error.test.ts` — **13** cases covering domain patterns, persistence codes, pass-through, and fallback.

---

## Related

- [Platform HTTP API](./APZHUB-Platform-HTTP-API.md)
- [Testing Platform Service Architecture](./APZHUB-Testing-Platform-Service-Architecture.md)
- [APZ TCMS Validation Rules](./APZHUB-APZ-TCMS-Validation-Rules.md)
