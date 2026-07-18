# Transport Migration Guide (OSS-100-06)

**Package:** `@apzhub/integration-sdk` v0.6.0  
**Audience:** Adapter authors (Plane, Zammad, future engines)

---

## What changed

| Before                                               | After                                         |
| ---------------------------------------------------- | --------------------------------------------- |
| Per-adapter `PlaneFetchClient` / `ZammadFetchClient` | `createHttpIntegrationClient` from SDK        |
| Duplicated timeout / JSON decode / error strings     | Shared bridge with `errorLabel`               |
| No shared mock transport                             | `createMockTransport` / `MockTransportClient` |

**Unchanged:** public adapter APIs, operation runners, circuit breakers in runners, package versions for Plane/Zammad (**0.6.0**), default retry behaviour (disabled).

---

## Plane migration pattern

```typescript
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";

const transport = createHttpIntegrationClient({
  apiBaseUrl,
  timeoutMs,
  fetchFn,
  errorLabel: "Plane",
});
```

`integrations/plane/src/internal/plane-fetch-client.ts` retains only a `FetchFn` re-export (if present) for test injectability — no standalone client class in the public API.

---

## Zammad migration pattern

```typescript
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";

const transport = createHttpIntegrationClient({
  apiBaseUrl,
  timeoutMs,
  fetchFn,
  errorLabel: "Zammad",
});
```

Same parity rules as Plane. Public Zammad adapter surface unchanged.

---

## Parity checklist

When migrating or adding an adapter:

- [ ] Use `createHttpIntegrationClient` (or `createTransportClient` if you need the full pipeline)
- [ ] Set `errorLabel` to the historical engine name used in error strings
- [ ] Keep `retry: { maxAttempts: 1 }` unless product explicitly enables retries
- [ ] Leave transport circuit-breaker interceptor **disabled**; keep CB in operation runners
- [ ] Inject `fetchFn` in tests; prefer `createMockTransport` for new TransportClient-based code
- [ ] Do not bump adapter major/minor solely for this swap (Plane/Zammad stayed 0.6.0)
- [ ] Confirm non-OK and timeout error shapes still match prior tests

---

## Choosing the API

| Need                                               | Use                           |
| -------------------------------------------------- | ----------------------------- |
| Drop-in `IntegrationClient`                        | `createHttpIntegrationClient` |
| Custom policies / interceptors / auth header hooks | `createTransportClient`       |
| Scripted unit tests                                | `createMockTransport`         |

---

## Enabling retries (opt-in)

```typescript
createHttpIntegrationClient({
  apiBaseUrl,
  timeoutMs,
  errorLabel: "Example",
  retry: {
    maxAttempts: 3,
    backoff: "exponential",
    initialDelayMs: 100,
  },
});
```

Document the behaviour change in the adapter changelog before enabling in production.

---

## Future adapters

1. Prefer SDK transport from day one — do not copy Plane/Zammad interim clients.
2. Register vendor error mappers via `ErrorTranslator` (OSS-100-04).
3. Use `MockTransportClient` in certification suites (OSS-100-09 will formalise harnesses).
4. Webhook/polling contracts are **not** part of OSS-100-06 — planned as a later OSS-100 milestone (see backlog: former webhook scope → **OSS-100-08**).

---

## Related

- [HTTP-TRANSPORT.md](./HTTP-TRANSPORT.md)
- [OSS-100-06 Completion Report](../../../docs/sprint/OSS-100-06-completion-report.md)
- [Plane Adapter](../../../integrations/plane/docs/PLANE-ADAPTER.md)
- [Zammad Adapter](../../../integrations/zammad/docs/ZAMMAD-ADAPTER.md)
