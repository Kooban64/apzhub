# APZHUB Integration Error Translation Model

**Milestone:** OSS-100  
**Status:** Canonical error translation contract  
**Authority:** [API Gateway Standards 010](../010-api-gateway-integration-communication-standards.md) · [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)

---

## Purpose

Define how vendor errors are translated to **platform-typed `IntegrationError` categories** via `ErrorTranslator`. Raw vendor HTTP bodies, stack traces, and engine terminology **never** reach Capability Services, API Gateway responses, or users.

---

## Translation flow

```text
Vendor HTTP/API error
        │
        ▼
Vendor adapter catch boundary
        │
        ▼
ErrorTranslator.translate()
        │
        ├── Vendor-specific mapper (per integration)
        └── SDK default fallbacks (status code, timeout, network)
        │
        ▼
IntegrationError (typed category)
        │
        ▼
Capability Service → platform response envelope (010)
        │
        ▼
Client (safe message only)
```

---

## Error categories

| Category | Retryable | Typical vendor signals |
|----------|-----------|------------------------|
| `authentication` | No* | 401, invalid token, expired session |
| `authorization` | No | 403, insufficient scope |
| `validation` | No | 400, 422, schema validation |
| `not_found` | No | 404 |
| `conflict` | No | 409, duplicate key |
| `rate_limited` | Yes | 429, Retry-After |
| `vendor_unavailable` | Yes | 502, 503, connection refused |
| `timeout` | Yes | Request timeout, socket hang |
| `mapping` | No | Unknown vendor ID, broken entity map |
| `provisioning` | Conditional | Workspace create failed |
| `version_incompatible` | No | Unsupported API version |
| `internal` | No | Unmapped vendor error — logged with correlation ID |

*Auth may retry once after token refresh via `AuthenticationProvider`.

---

## IntegrationError schema

```typescript
interface IntegrationError {
  readonly category: IntegrationErrorCategory;
  readonly code: string;              // stable — e.g. "plane.issue.not_found"
  readonly message: string;           // operator-safe — not raw vendor text
  readonly retryable: boolean;
  readonly correlationId: string;
  readonly vendorStatusCode?: number;
  readonly details?: Readonly<Record<string, string>>;  // opaque IDs only
}
```

**Prohibited in `message` and `details`:** vendor branding, stack traces, SQL, internal hostnames, secrets.

---

## Vendor mapper registration

Each integration registers a **vendor error mapper**:

```typescript
interface VendorErrorMapper {
  readonly integrationId: string;
  map(error: VendorErrorInput): IntegrationError | null;
}

interface VendorErrorInput {
  readonly statusCode?: number;
  readonly vendorCode?: string;
  readonly vendorMessage?: string;   // adapter-internal — discarded after map
  readonly body?: unknown;           // never forwarded
  readonly context: ErrorTranslationContext;
}
```

Mapper returns `null` to fall through to SDK defaults.

---

## SDK default mapping

When vendor mapper returns `null`:

| Condition | Category |
|-----------|----------|
| Status 401 | `authentication` |
| Status 403 | `authorization` |
| Status 404 | `not_found` |
| Status 409 | `conflict` |
| Status 422, 400 | `validation` |
| Status 429 | `rate_limited` |
| Status 502, 503 | `vendor_unavailable` |
| Timeout | `timeout` |
| Network error | `vendor_unavailable` |
| Unknown | `internal` |

---

## Capability Service handling

Capability Services map `IntegrationError` to platform API envelope:

| Integration category | Platform envelope category (010) |
|---------------------|----------------------------------|
| `authentication` | `UNAUTHORIZED` |
| `authorization` | `FORBIDDEN` |
| `validation` | `VALIDATION_ERROR` |
| `not_found` | `NOT_FOUND` |
| `conflict` | `CONFLICT` |
| `rate_limited` | `RATE_LIMITED` |
| `vendor_unavailable`, `timeout` | `SERVICE_UNAVAILABLE` |
| `mapping`, `provisioning`, `version_incompatible` | `INTEGRATION_ERROR` |
| `internal` | `INTERNAL_ERROR` |

User-facing messages use APZHUB terminology (002) — e.g. "Task not found", never "Issue not found".

---

## Retry interaction

| Category | RetryPolicy | CircuitBreaker |
|----------|-------------|----------------|
| `rate_limited` | Yes — honour Retry-After | No trip |
| `vendor_unavailable`, `timeout` | Yes — exponential backoff | Counts toward open |
| `authentication` | Once after refresh | Trip on repeated fail |
| All others | No | No trip |

---

## Audit and security

Security-relevant errors (`authentication`, `authorization`) emit audit events via Capability Service — not from adapter directly.

Log at `warn` or `error` with correlation ID; never log vendor response body at info level in production.

---

## Testing requirements

Each vendor adapter must ship **error translation tests** covering:

- Every mapped vendor code
- All SDK default status code paths
- Retryable flag correctness
- No vendor terminology in output message

Minimum coverage defined in OSS-100-09 certification phase.

---

## Plane reference mapping (illustrative)

| Plane signal | Integration category | APZHUB code |
|--------------|---------------------|-------------|
| Invalid API token | `authentication` | `plane.auth.invalid_token` |
| Workspace not found | `not_found` | `plane.workspace.not_found` |
| Issue state invalid | `validation` | `plane.task.invalid_transition` |
| Rate limit | `rate_limited` | `plane.rate_limited` |

Full mapping authored in OSS-101-04 adapter implementation — not in OSS-100.

---

## Related

- [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)
- [Health & Diagnostics Model](./APZHUB-Integration-Health-Diagnostics-Model.md)
- [OSS Integration Standards](../governance/APZHUB-OSS-Integration-Standards.md)
