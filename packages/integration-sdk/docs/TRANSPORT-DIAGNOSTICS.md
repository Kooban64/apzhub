# Transport Diagnostics (OSS-100-06)

**Package:** `@apzhub/integration-sdk` v0.6.0  
**Modules:** `metrics.ts`, `logger.ts`, `http-transport.ts` (`getDiagnostics`)

---

## Diagnostics snapshot

```typescript
const d = client.getDiagnostics();
```

| Field            | Contents                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `configuration`  | Resolved base URL, timeout, retry, TLS, compression, redirects, headers, rate-limit, CB flag |
| `capabilities`   | Supported methods/body/response kinds; feature flags                                         |
| `metrics`        | Current `TransportMetricsSnapshot`                                                           |
| `activePolicies` | Policy names (e.g. `tls`, `compression`, `redirects`)                                        |
| `timeouts`       | Timeout policy options                                                                       |
| `retry`          | `enabled`, `maxAttempts`, `attemptsExecuted`, `lastRetryAfterMs`                             |
| `connection`     | `baseUrl`, `lastStatus`, `lastLatencyMs`, `lastError`                                        |
| `features`       | circuitBreaker, compression, redirects, authHeadersProvider                                  |
| `tls`            | TLS configuration (including unused custom CA placeholder)                                   |

`retry.enabled` is `true` only when `maxAttempts > 1`.

---

## Capabilities flags

| Flag                      | OSS-100-06 value  | Meaning                              |
| ------------------------- | ----------------- | ------------------------------------ |
| `retry`                   | Depends on config | `maxAttempts > 1`                    |
| `circuitBreaker`          | Depends on config | Interceptor enabled                  |
| `compression`             | true              | Policy present                       |
| `redirects`               | Config            | Follow redirects                     |
| `authHooks`               | true              | Provider supported                   |
| `mock`                    | false / true      | Real client vs `MockTransportClient` |
| `tlsCustomCaSupported`    | **false**         | Fetch limitation                     |
| `streamingSupported`      | **false**         | Placeholder only                     |
| `binaryTransferSupported` | **false**         | Placeholder only                     |
| `oauthSupported`          | **false**         | Out of scope                         |

---

## Metrics

`DefaultTransportMetrics` / `createTransportMetrics`:

| Counter                                     | When                    |
| ------------------------------------------- | ----------------------- |
| `requestCount` / `bytesSent`                | Before fetch            |
| `responseCount` / `bytesReceived` / latency | After successful decode |
| `errorCount`                                | Non-abort failures      |
| `timeoutCount`                              | Abort / timeout         |
| `retryCount`                                | Retry decision taken    |
| `redirectCount`                             | `response.redirected`   |

`averageLatencyMs` = `totalLatencyMs / responseCount` (0 when no responses).

Call `getMetrics()` or `diagnostics.metrics`. `reset()` clears the snapshot (tests).

---

## Logging & redaction

`DefaultTransportLogger` records structured entries:

- Levels: debug, info, warn, error
- Typical events: `transport.request`, `transport.response`, `transport.retry`, `transport.timeout`, `transport.error`

**Never logged in clear text:**

- Authorization / cookie / API-key headers
- Fields whose keys match token/password/secret/credential patterns
- Bearer tokens and secret-like substrings in messages

Helpers: `isSensitiveHeaderName`, `redactHeaders`.

Inject a custom `TransportLogger` for platform log backends; keep the same redaction contract.

---

## Security rules

| Rule                          | Detail                                                    |
| ----------------------------- | --------------------------------------------------------- |
| No credentials in diagnostics | Auth tokens are not part of diagnostics payload           |
| No raw secrets in metrics     | Counters only                                             |
| Correlation IDs               | Propagated via `TransportContext.correlationId` into logs |
| Error messages (bridge)       | Stable `{errorLabel} API …` — no backend stack traces     |

Complements OSS-100-02 credential masking and OSS-100-04 `IntegrationLogger`.

---

## Mock diagnostics

`MockTransportClient` implements the same diagnostics/metrics APIs with `capabilities.mock: true` and scripted last-status behaviour for adapter certification tests.
