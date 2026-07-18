# Transport Policies (OSS-100-06)

**Package:** `@apzhub/integration-sdk` v0.6.0  
**Module:** `src/transport/policies/`

---

## Policy inventory

| Policy      | Class / factory                                       | Role                                 |
| ----------- | ----------------------------------------------------- | ------------------------------------ |
| Retry       | `DefaultRetryPolicy` / `createDefaultRetryPolicy`     | Classify retryable failures; backoff |
| Timeout     | `DefaultTimeoutPolicy` / `createDefaultTimeoutPolicy` | AbortController overall timeout      |
| TLS         | `TlsPolicy`                                           | Store TLS prefs for diagnostics      |
| Compression | `CompressionPolicy`                                   | Set `Accept-Encoding` when empty     |
| Redirects   | `RedirectPolicy`                                      | Document follow / max / loop flags   |
| Rate limit  | `NoopRateLimitPolicy`                                 | Stub — `acquire` always succeeds     |

Built-in policies are attached by `DefaultTransportClient` in order: **TLS → Compression → Redirects**, then any caller-supplied policies.

---

## Retry policy

### Defaults

| Option                   | Default                           |
| ------------------------ | --------------------------------- |
| `maxAttempts`            | **1** (retries **disabled**)      |
| `backoff`                | `exponential`                     |
| `initialDelayMs`         | 100                               |
| `maxDelayMs`             | 30_000                            |
| `jitter`                 | true                              |
| `retryableMethods`       | GET, HEAD, OPTIONS, PUT, DELETE   |
| `retryableStatusCodes`   | 408, 425, 429, 500, 502, 503, 504 |
| `retryTransportFailures` | true                              |
| `respectRetryAfter`      | true                              |

**Migration rule:** Plane/Zammad and `createHttpIntegrationClient` keep `maxAttempts: 1` unless an adapter explicitly opts in.

### Classification

1. Stop when `attempt >= maxAttempts`
2. Reject non-retryable HTTP methods (e.g. POST by default)
3. For HTTP status: retry only listed status codes; honour `Retry-After` when present
4. For transport errors / aborts: retry when `retryTransportFailures` is true

### Backoff

- `none` — 0 delay
- `fixed` — `initialDelayMs`
- `exponential` — `initialDelayMs * 2^(attempt-1)`, capped by `maxDelayMs`
- Optional jitter: multiply by `[0.5, 1.0)`

`parseRetryAfterMs` accepts delay-seconds or HTTP-date.

---

## Timeout policy

| Field        | Enforcement                                                      |
| ------------ | ---------------------------------------------------------------- |
| `overallMs`  | **Enforced** via `AbortController` + `setTimeout`                |
| `connectMs`  | Stored / documented — Node fetch has no discrete connect timeout |
| `requestMs`  | Stored — overall abort is the enforceable bound                  |
| `responseMs` | Stored — overall abort is the enforceable bound                  |

Per-request `timeoutMs` overrides `overallMs`. Parent `AbortSignal` from `TransportContext` aborts the child controller.

Abort errors surface as timeouts in metrics/logs; the IntegrationClient bridge maps them to `{errorLabel} API request timed out` with `timeout: true`.

---

## TLS policy

```typescript
interface TlsConfiguration {
  validateCertificates: boolean; // default true
  customCA?: string; // placeholder — not applied via RequestInit
  developmentOverrides?: { allowInsecure?: boolean };
}
```

Node undici/fetch does **not** accept per-request custom CA or certificate validation overrides through `RequestInit`. Values are retained for diagnostics and future Agent wiring. Capabilities report `tlsCustomCaSupported: false`.

---

## Compression policy

Default Accept-Encoding: `gzip, br, identity`. Runtime auto-decompression is relied upon where the fetch implementation provides it.

The **IntegrationClient bridge** sets `acceptEncoding: []` so it does not inject Accept-Encoding, preserving prior Plane/Zammad header behaviour.

---

## Redirect policy

| Option         | Default                                     |
| -------------- | ------------------------------------------- |
| `follow`       | true → fetch `redirect: "follow"`           |
| `maxRedirects` | 20 (documented; fetch manages actual limit) |
| `detectLoops`  | true (metadata / diagnostics)               |

Redirected responses increment transport redirect metrics.

---

## Rate-limit stub

`NoopRateLimitPolicy` always grants a lease immediately. Callers may inject a real `RateLimitPolicy` via `CreateTransportClientOptions.rateLimit`. No production limiter ships in OSS-100-06.

---

## Circuit breaker (interceptor, not a policy)

Optional `createCircuitBreakerInterceptor(circuitBreaker)` — enabled only when:

```typescript
createTransportClient({
  // …
  circuitBreaker,
  enableCircuitBreakerInterceptor: true,
});
```

**Default: off.** Plane and Zammad continue to use `DefaultCircuitBreaker` inside operation runners (OSS-100-04). The interceptor does not duplicate breaker logic; it calls `allowRequest` / `recordSuccess` / `recordFailure`.

See [TRANSPORT-PIPELINE.md](./TRANSPORT-PIPELINE.md).

---

## Coverage target

Policy modules target **~95%+** line coverage (suite in `transport.test.ts`).
