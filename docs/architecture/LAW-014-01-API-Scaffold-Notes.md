# LAW-014-01 — API Scaffold Notes

> **Story:** LAW-014-01  
> **Status:** Implemented  
> **Last updated:** 2026-07-06

---

## Route layout

```text
apps/web/app/api/law/v1/
  health/route.ts       GET + 405 for POST/PUT/PATCH/DELETE
  diagnostics/route.ts  GET + 405 for POST/PUT/PATCH/DELETE
```

**Version prefix:** `/api/law/v1` (per LAW-014-01 specification).

> **Note:** Canonical base path is `/api/law/v1/` (LAW-014-01 / LAW-014-02). Planning documents updated in LAW-014-02.

---

## Shared library

```text
apps/web/lib/api/
  constants.ts              Version prefix, header names
  types.ts                  Envelope types
  request-context.ts        requestId + correlationId resolution
  response.ts               jsonSuccessResponse / jsonErrorResponse
  validation.ts             JSON body + method + content-type helpers
  method-not-allowed.ts     405 helper with Allow header
  law-api-health.ts           Safe health payload builder
  law-api-diagnostics.ts      Safe diagnostics payload builder
  index.ts                    Public exports
  api-scaffold.test.ts        Unit + route handler tests
```

---

## Envelope contract

| Field     | Success                                        | Error                               |
| --------- | ---------------------------------------------- | ----------------------------------- |
| Top-level | `ok: true`                                     | `ok: false`                         |
| Payload   | `data`                                         | `error { code, message, details? }` |
| Tracing   | `meta { requestId, correlationId, timestamp }` | same                                |

Headers mirror `meta.requestId` and `meta.correlationId`.

---

## Security posture (LAW-014-01)

- No authentication or authorization
- Diagnostics excludes database URLs, Redis, secrets, stack traces
- Correlation IDs sanitised (length + character class)

---

## Extension pattern (LAW-014-02+)

```typescript
export async function GET(request: NextRequest) {
  const context = resolveRequestContext(request);
  // LAW-014-02: authenticate + resolve tenant
  const data = /* workflow result mapped to DTO */;
  return jsonSuccessResponse(data, context);
}
```

Use `parseJsonBody`, `validateHttpMethod`, and `jsonErrorResponse` for future POST/PATCH handlers.

---

## Related documents

- [Legal API v1 stub](../developer/legal-api-v1-stub.md)
- [LAW-014-01 completion report](../sprint/LAW-014-01-completion-report.md)
