# Shared HTTP Transport (OSS-100-06)

**Package:** `@apzhub/integration-sdk` v0.6.0  
**Export:** `@apzhub/integration-sdk/transport` (also re-exported from root and `/client` for the IntegrationClient bridge)  
**Authority:** [Platform Integration SDK Architecture](../../../docs/architecture/APZHUB-Platform-Integration-SDK-Architecture.md)

---

## Overview

OSS-100-06 delivers a reusable HTTP transport for all APZHUB vendor adapters. Plane and Zammad interim fetch clients are replaced by `createHttpIntegrationClient` with **no public adapter API behaviour change**.

```text
Vendor Adapter
     │
     ├── createHttpIntegrationClient  →  IntegrationClient (parity bridge)
     │                                         │
     └── createTransportClient        →  TransportClient (full pipeline)
                                               │
                                               ├── policies (retry, timeout, TLS, compression, redirects)
                                               ├── interceptors (optional circuit breaker)
                                               ├── metrics + redacting logger
                                               └── fetch (injectable FetchFn)
```

---

## Public surface

| Symbol | Purpose |
|--------|---------|
| `TransportClient` | HTTP client interface (`request`, verb helpers, diagnostics) |
| `createTransportClient` / `DefaultTransportClient` | Production transport |
| `createHttpIntegrationClient` / `HttpIntegrationClient` | `IntegrationClient` bridge for adapters |
| `createMockTransport` / `MockTransportClient` | Scripted mock for adapter tests |
| `createCircuitBreakerInterceptor` | Optional transport-level CB (off by default) |
| Policies | `DefaultRetryPolicy`, `DefaultTimeoutPolicy`, TLS / compression / redirect / rate-limit stubs |
| Observability | `createTransportMetrics`, `createTransportLogger` (redacts secrets) |

---

## Quick start

### Full transport client

```typescript
import {
  createTransportClient,
  createJsonBody,
} from "@apzhub/integration-sdk/transport";

const client = createTransportClient({
  baseUrl: "https://engine.example/api",
  timeout: { overallMs: 30_000 },
  // Default: retries disabled (maxAttempts=1) for adapter migration parity
  retry: { maxAttempts: 1 },
  defaultHeaders: { Accept: "application/json" },
  authHeadersProvider: async () => ({
    Authorization: "Bearer …", // resolved via Auth/Connection — never hardcode
  }),
});

const response = await client.get<{ id: string }>("/projects/1", {
  context: { correlationId: "corr-001", tenantId: "tenant-001" },
});
```

### Adapter bridge (Plane / Zammad pattern)

```typescript
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";

const client = createHttpIntegrationClient({
  apiBaseUrl: connection.baseUrl,
  timeoutMs: 30_000,
  errorLabel: "Plane", // or "Zammad" — preserves prior error message text
  fetchFn: injectableFetch, // tests inject mocks
});
```

Public adapter APIs remain unchanged. Plane and Zammad stay at package version **0.6.0**.

---

## Defaults (migration parity)

| Setting | Default | Rationale |
|---------|---------|-----------|
| Retry `maxAttempts` | `1` (disabled) | Match prior Plane/Zammad fetch clients |
| Circuit-breaker interceptor | Off | Adapters keep CB in operation runners |
| Compression Accept-Encoding (bridge) | Empty | Preserve prior header set |
| Compression (raw transport) | `gzip, br, identity` | Standard fetch behaviour |
| Redirects | Follow (`maxRedirects` 20) | Fetch default |
| TLS custom CA | Config/diagnostics only | Node undici/fetch limitation |

---

## Request / response model

- **Methods:** GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Bodies:** `json`, `text`, `empty` implemented; `multipart` / `binary` / `stream` are **placeholders** (not transferred)
- **Responses:** JSON/text/empty decoded; binary/stream kinds are placeholders
- **Context:** `correlationId`, `requestId`, `tenantId`, `AbortSignal`, metadata

See [TRANSPORT-PIPELINE.md](./TRANSPORT-PIPELINE.md) for pipeline stages and [TRANSPORT-POLICIES.md](./TRANSPORT-POLICIES.md) for policy details.

---

## Auth neutrality

Transport does **not** own credentials. Adapters supply headers via:

- `defaultHeaders`
- `authHeadersProvider(ctx)` — called per attempt
- Per-request `headers`

Authentication remains `@apzhub/integration-sdk/auth` + connection management (OSS-100-02).

---

## Diagnostics & metrics

```typescript
const diagnostics = client.getDiagnostics();
const metrics = client.getMetrics();
```

Diagnostics expose configuration, capabilities, active policies, retry/timeout state, last connection status, and feature flags. Metrics track request/response counts, errors, timeouts, retries, redirects, latency, and approximate bytes.

See [TRANSPORT-DIAGNOSTICS.md](./TRANSPORT-DIAGNOSTICS.md).

---

## Mock transport

```typescript
import { createMockTransport } from "@apzhub/integration-sdk/transport";

const mock = createMockTransport({
  responses: {
    "GET /projects": { status: 200, body: [{ id: "1" }] },
  },
});
```

Future adapters should prefer `MockTransportClient` over ad-hoc fetch stubs when a `TransportClient` is required. See [TRANSPORT-MIGRATION.md](./TRANSPORT-MIGRATION.md).

---

## Out of scope (OSS-100-06)

- Binary / multipart / streaming transfer
- OAuth token refresh flows
- GraphQL transport
- Webhook receivers / polling schedulers (planned later — see backlog note under OSS-100-08)
- Enabling retries or transport CB by default for existing adapters

---

## Related

- [TRANSPORT-POLICIES.md](./TRANSPORT-POLICIES.md)
- [TRANSPORT-PIPELINE.md](./TRANSPORT-PIPELINE.md)
- [TRANSPORT-DIAGNOSTICS.md](./TRANSPORT-DIAGNOSTICS.md)
- [TRANSPORT-MIGRATION.md](./TRANSPORT-MIGRATION.md)
- [Architecture index](../../../docs/architecture/APZHUB-Integration-SDK-HTTP-Transport.md)
- [OSS-100-06 Completion Report](../../../docs/sprint/OSS-100-06-completion-report.md)
