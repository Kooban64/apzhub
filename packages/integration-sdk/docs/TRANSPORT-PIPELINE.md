# Transport Pipeline (OSS-100-06)

**Package:** `@apzhub/integration-sdk` v0.6.0  
**Modules:** `http-transport.ts`, `request-builder.ts`, `response-pipeline.ts`, `interceptors/`

---

## Execution flow

```text
request()
  │
  ├─ retry loop (attempt = 1 … maxAttempts)
  │     │
  │     └─ executeOnce()
  │           │
  │           ├─ timeout controller (overall AbortSignal)
  │           ├─ rateLimit.acquire (optional)
  │           ├─ policies.applyRequest (TLS → Compression → Redirects → custom)
  │           ├─ interceptors.onRequest (sorted by order; CB order=0)
  │           ├─ authHeadersProvider
  │           ├─ serializeBody + mergeHeaders + resolve URL
  │           ├─ fetchFn(url, init)
  │           ├─ decodeResponse → buildTransportResponse
  │           ├─ policies.applyResponse
  │           ├─ interceptors.onResponse
  │           ├─ metrics + logger
  │           └─ on error: interceptors.onError → metrics/log → throw
  │
  └─ classify retry → sleep(delay) → next attempt, or return / throw
```

---

## Request builder

| Helper | Role |
|--------|------|
| `buildUrl` / `resolveRequestUrl` | Join `baseUrl` + `path` or absolute `url` + query |
| `normalizePath` / `stripTrailingSlash` | Path normalisation |
| `serializeBody` | JSON / text / empty; placeholders for multipart/binary/stream |
| `createJsonBody` / `createTextBody` / `createEmptyBody` | Body factories |
| `estimateHeaderBytes` | Approximate outbound size for metrics |

Query values are stringified. Trailing slashes on base URL are stripped.

---

## Response pipeline

| Helper | Role |
|--------|------|
| `headersToRecord` | Flatten Headers → `TransportHeaders` |
| `detectContentType` | Read content-type |
| `classifyResponseKind` | json / text / empty / error (+ placeholder binary/stream) |
| `decodeResponse` | Read body text; parse JSON when appropriate |
| `typedDecodeJson` | Typed JSON helper |
| `buildTransportResponse` | Assemble `TransportResponse` with `durationMs` |

HEAD and empty bodies yield `kind: "empty"`. Non-OK responses still decode bodies when present so adapters can inspect error payloads.

---

## Interceptors

```typescript
interface TransportInterceptor {
  name: string;
  order?: number; // default 100; lower runs first on request
  onRequest?(request, ctx): …
  onResponse?(response, ctx): …
  onError?(error, ctx): …
}
```

Interceptors are sorted ascending by `order` before execution.

### Circuit-breaker interceptor

When enabled:

- `onRequest` — if `!circuitBreaker.allowRequest()`, throw `IntegrationSdkError` (`integration.transport.circuit_open`)
- `onResponse` — success → `recordSuccess`; status ≥ 500 → `recordFailure`
- `onError` — `recordFailure` with translated/internal error

Adapters that already wrap operations with a breaker **must not** enable this unless intentional double-wrapping is desired.

---

## IntegrationClient bridge

`HttpIntegrationClient` wraps `createTransportClient` and implements `IntegrationClient`:

1. Map method/path/query/headers/body/context
2. Always set `Accept: application/json`; set `Content-Type` when body present
3. On non-OK: throw `Error("{errorLabel} API request failed with status {n}")` with `statusCode` + `body`
4. On abort: throw `Error("{errorLabel} API request timed out")` with `timeout: true`
5. Decode body via text → `JSON.parse` or `{}` (Plane/Zammad parity)

`errorLabel` is `"Plane"` or `"Zammad"` in production adapters.

---

## Extensibility

| Extension point | How |
|-----------------|-----|
| Custom fetch | `fetchFn` option |
| Extra policies | `policies: TransportPolicy[]` |
| Interceptors | `interceptors: TransportInterceptor[]` |
| Auth headers | `authHeadersProvider` |
| Metrics / logger | Inject `TransportMetrics` / `TransportLogger` |

Do **not** put vendor business logic in transport policies. Keep mapping and domain rules in Platform Services / adapters.
