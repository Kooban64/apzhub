# OSS-100-06 Completion Report — Shared HTTP Transport Layer

**Status:** Complete  
**Date:** 2026-07-11  
**Scope:** OSS-100-06 only — Shared HTTP Transport in `@apzhub/integration-sdk`; Plane/Zammad migration to shared client; **no** webhook/polling contracts; **no** OSS-100-07+

---

## Executive summary

Delivered the vendor-neutral **Shared HTTP Transport Layer** in `@apzhub/integration-sdk` **v0.6.0**. Plane and Zammad now use `createHttpIntegrationClient` with `errorLabel` `"Plane"` / `"Zammad"`. Public adapter APIs and package versions for those adapters remain **0.6.0**. Retries default disabled; circuit breakers stay in operation runners.

**Numbering clarification:** Owner-approved OSS-100-06 is **HTTP Transport**, not webhook/polling (earlier backlog label). Webhook/polling contracts move to a later planned phase (**OSS-100-08**).

**Stop condition met:** Await owner approval before **OSS-100-07** (Mapping providers).

---

## Objective

Replace interim per-adapter fetch clients with a reusable transport in the Integration SDK without changing public adapter behaviour or introducing business logic into the transport layer.

---

## Architecture overview

| Layer | Component |
|-------|-----------|
| Types | `TransportClient`, `TransportRequest` / `Response`, policies, interceptors |
| Client | `DefaultTransportClient` / `createTransportClient` |
| Bridge | `HttpIntegrationClient` / `createHttpIntegrationClient` |
| Policies | Retry (default off), timeout, TLS, compression, redirects, rate-limit stub |
| Interceptor | Optional circuit-breaker (off by default) |
| Observability | Transport metrics + redacting logger + diagnostics |
| Testing | `MockTransportClient` / `createMockTransport` |

```text
Adapter → createHttpIntegrationClient → TransportClient → fetch → Engine
                │
                └── errorLabel preserves historical error strings
```

---

## Delivered

### Package (`@apzhub/integration-sdk` v0.6.0)

| Component | Location |
|-----------|----------|
| Transport types | `src/transport/types.ts` |
| `DefaultTransportClient` | `src/transport/http-transport.ts` |
| Request builder | `src/transport/request-builder.ts` |
| Response pipeline | `src/transport/response-pipeline.ts` |
| Retry / timeout / common policies | `src/transport/policies/` |
| Circuit-breaker interceptor | `src/transport/interceptors/` |
| Metrics / logger | `src/transport/metrics.ts`, `logger.ts` |
| Mock transport | `src/transport/mock-transport.ts` |
| IntegrationClient bridge | `src/transport/integration-client-bridge.ts` |
| Subpath export | `@apzhub/integration-sdk/transport` |
| Version constant | `INTEGRATION_SDK_VERSION = "0.6.0"` |

### Adapter migration

| Adapter | Change | Version |
|---------|--------|---------|
| `@apzhub/integration-plane` | `createHttpIntegrationClient({ errorLabel: "Plane" })` | **0.6.0** (unchanged) |
| `@apzhub/integration-zammad` | `createHttpIntegrationClient({ errorLabel: "Zammad" })` | **0.6.0** (unchanged) |

Public adapter APIs unchanged. Circuit breakers remain in operation runners.

### Behaviour defaults

| Setting | Value |
|---------|-------|
| Retry `maxAttempts` | **1** (disabled) for parity |
| Transport CB interceptor | **Off** by default |
| Bridge compression headers | No Accept-Encoding injection |

### Documentation

| Document | Path |
|----------|------|
| HTTP Transport | `packages/integration-sdk/docs/HTTP-TRANSPORT.md` |
| Policies | `packages/integration-sdk/docs/TRANSPORT-POLICIES.md` |
| Pipeline | `packages/integration-sdk/docs/TRANSPORT-PIPELINE.md` |
| Diagnostics | `packages/integration-sdk/docs/TRANSPORT-DIAGNOSTICS.md` |
| Migration | `packages/integration-sdk/docs/TRANSPORT-MIGRATION.md` |
| Architecture index | `docs/architecture/APZHUB-Integration-SDK-HTTP-Transport.md` |
| Package README | `packages/integration-sdk/README.md` |

---

## Tests

| Suite | Result |
|-------|--------|
| `@apzhub/integration-sdk` | **99** tests (includes transport suite; was ~65 before OSS-100-06) |
| Transport suite | Comprehensive coverage of builder, pipeline, retry, timeout, client, mock, bridge parity, redaction, metrics |
| Plane + Zammad combined | **211** passed |
| Transport line coverage | **~97%+** |
| Policy line coverage | **~95%+** |

---

## Completion review

| Criterion | Result |
|-----------|--------|
| Shared `TransportClient` with pipeline | ✅ |
| Export `@apzhub/integration-sdk/transport` | ✅ |
| Policies: retry, timeout, TLS, compression, redirects, rate-limit stub | ✅ |
| Retries default disabled (`maxAttempts=1`) | ✅ |
| Optional CB interceptor; runners retain CB | ✅ |
| Auth-neutral header hooks | ✅ |
| `createHttpIntegrationClient` bridge | ✅ |
| Plane + Zammad migrated; public APIs unchanged | ✅ |
| Adapter versions stay 0.6.0 | ✅ |
| `MockTransportClient` / `createMockTransport` | ✅ |
| Diagnostics + redacting logger + metrics | ✅ |
| Binary/multipart/stream placeholders only | ✅ |
| No webhook/polling in this milestone | ✅ |
| Lint / typecheck pass | ✅ |
| OSS-100-07 not started | ✅ |

---

## Quality gates

| Gate | Result |
|------|--------|
| Lint | Pass (unused import fix applied) |
| Typecheck | Pass |
| SDK tests | Pass — 99 |
| Plane + Zammad tests | Pass — 211 |
| Transport coverage | ~97%+ lines |
| Policy coverage | ~95%+ lines |

---

## Technical debt

| Item | Notes |
|------|-------|
| TLS custom CA / per-request cert overrides | Config + diagnostics only until undici Agent wiring |
| Discrete connect/request/response timeouts | Documented; only overall AbortController enforced |
| Rate-limit policy | No-op stub — real limiter future |
| Binary / multipart / streaming bodies | Placeholders — transfer deferred |
| Transport CB vs runner CB | Optional interceptor; keep single ownership per adapter |
| Former backlog label “webhooks as 100-06” | Corrected; webhooks → planned **OSS-100-08** |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Accidental retry enablement changes adapter behaviour | Default `maxAttempts=1`; document opt-in |
| Double circuit breaking | Interceptor off by default; docs warn adapters |
| Drift from historical error strings | `errorLabel` + bridge parity tests |
| Backlog numbering confusion (webhooks) | Documented in backlog + this report |

---

## Recommendation for OSS-100-07

**Next milestone:** **OSS-100-07 — Mapping providers** (per corrected backlog).

| Item | Scope |
|------|-------|
| `UserMappingProvider` | Platform ↔ vendor user binding |
| `PermissionMappingProvider` | Permission translation abstractions |
| `EntityMappingProvider` | Entity ID mapping with tenant scope |
| PostgreSQL repositories | Mapping tables (platform SoR for mappings) |

**Do not** start webhook/polling in OSS-100-07. Schedule **OSS-100-08 — Webhook & polling contracts** after mapping (relocated from the former incorrect OSS-100-06 label).

---

## Stop condition

OSS-100-06 complete. **Await owner approval before OSS-100-07.**

Do not begin Mapping providers, webhook contracts, or further SDK phases without explicit approval.

---

## Related

- [HTTP-TRANSPORT.md](../../packages/integration-sdk/docs/HTTP-TRANSPORT.md)
- [APZHUB-Integration-SDK-HTTP-Transport.md](../architecture/APZHUB-Integration-SDK-HTTP-Transport.md)
- [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)
- [OSS-100-05 Completion Report](./OSS-100-05-completion-report.md)
