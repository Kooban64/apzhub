# APZHUB Integration SDK — Shared HTTP Transport

> **Milestone:** OSS-100-06  
> **Package:** `@apzhub/integration-sdk` v0.6.0  
> **Status:** Implemented  
> **Primary docs:** [packages/integration-sdk/docs/HTTP-TRANSPORT.md](../../packages/integration-sdk/docs/HTTP-TRANSPORT.md)

---

## Purpose

Architecture index for the owner-approved **Shared HTTP Transport Layer**. Replaces interim per-adapter fetch clients with a reusable SDK transport while preserving Plane/Zammad public API behaviour.

---

## Package documentation

| Document | Path |
|----------|------|
| HTTP Transport overview | [HTTP-TRANSPORT.md](../../packages/integration-sdk/docs/HTTP-TRANSPORT.md) |
| Policies (retry, timeout, TLS, …) | [TRANSPORT-POLICIES.md](../../packages/integration-sdk/docs/TRANSPORT-POLICIES.md) |
| Pipeline & interceptors | [TRANSPORT-PIPELINE.md](../../packages/integration-sdk/docs/TRANSPORT-PIPELINE.md) |
| Diagnostics, metrics, logging | [TRANSPORT-DIAGNOSTICS.md](../../packages/integration-sdk/docs/TRANSPORT-DIAGNOSTICS.md) |
| Adapter migration guide | [TRANSPORT-MIGRATION.md](../../packages/integration-sdk/docs/TRANSPORT-MIGRATION.md) |

---

## Architecture

```text
Capability Service
        ↓
Vendor Adapter (Plane / Zammad / …)
        ↓
createHttpIntegrationClient  ──►  HttpIntegrationClient
        ↓                              │
IntegrationClient.request              │
        ↓                              ▼
                              DefaultTransportClient
                              (policies + interceptors + fetch)
        ↓
Backend Engine REST API
```

**Defaults:** retries disabled (`maxAttempts=1`); circuit breaker remains in operation runners; optional transport CB interceptor exists but is off by default.

---

## Export

```text
@apzhub/integration-sdk/transport
@apzhub/integration-sdk/client   → createHttpIntegrationClient
```

---

## Numbering note

Earlier backlog drafts labelled OSS-100-06 as “Webhook & polling contracts”. **Owner-approved OSS-100-06 is Shared HTTP Transport.** Webhook/polling contracts are **OSS-100-08** — **complete** (see [APZHUB-Integration-SDK-Webhook-Polling.md](./APZHUB-Integration-SDK-Webhook-Polling.md)).

---

## Related

- [OSS-100-06 Completion Report](../sprint/OSS-100-06-completion-report.md)
- [Platform Integration SDK Architecture](./APZHUB-Platform-Integration-SDK-Architecture.md)
- [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)
- [Adapter Framework Implementation](./APZHUB-Adapter-Framework-Implementation.md) (OSS-100-05)
