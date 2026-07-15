# APZHUB Integration SDK — Webhook & Polling Contracts

> **Milestone:** OSS-100-08  
> **Package:** `@apzhub/integration-sdk` v0.8.0  
> **Status:** Implemented  
> **Primary docs:** [packages/integration-sdk/docs/EVENT-ENVELOPE.md](../../packages/integration-sdk/docs/EVENT-ENVELOPE.md)

---

## Purpose

Architecture index for the owner-approved **Webhook & Polling** contracts. Provides vendor-neutral envelope, identity/dedup, webhook management/verification/pipeline, and polling source/cursor/checkpoint execution — while preserving Plane/Zammad public APIs and excluding ingress, Event Bus, workers, and schedulers.

---

## Package documentation

| Document                 | Path                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Envelope overview        | [EVENT-ENVELOPE.md](../../packages/integration-sdk/docs/EVENT-ENVELOPE.md)                       |
| Identity & deduplication | [EVENT-DEDUPLICATION.md](../../packages/integration-sdk/docs/EVENT-DEDUPLICATION.md)             |
| Webhook contracts        | [WEBHOOK-CONTRACTS.md](../../packages/integration-sdk/docs/WEBHOOK-CONTRACTS.md)                 |
| Verification             | [WEBHOOK-VERIFICATION.md](../../packages/integration-sdk/docs/WEBHOOK-VERIFICATION.md)           |
| Webhook pipeline         | [WEBHOOK-PIPELINE.md](../../packages/integration-sdk/docs/WEBHOOK-PIPELINE.md)                   |
| Polling contracts        | [POLLING-CONTRACTS.md](../../packages/integration-sdk/docs/POLLING-CONTRACTS.md)                 |
| Cursors                  | [POLLING-CURSORS.md](../../packages/integration-sdk/docs/POLLING-CURSORS.md)                     |
| Checkpoints              | [POLLING-CHECKPOINTS.md](../../packages/integration-sdk/docs/POLLING-CHECKPOINTS.md)             |
| Adapter migration        | [WEBHOOK-POLLING-MIGRATION.md](../../packages/integration-sdk/docs/WEBHOOK-POLLING-MIGRATION.md) |

---

## Architecture

```text
Platform (future ingress / Event Bus / scheduler) — ABSENT in OSS-100-08
        │
        ▼
Capability Service / caller
        ↓
Vendor Adapter (Plane / Zammad / …)
        ├── WebhookManager (asWebhookManager)     — registration only
        ├── WebhookProcessingPipeline             — decode → verify → replay → translate → dedup
        ├── PollingSource (createPollingSourceFromSync)
        └── PollingExecutionPipeline              — pages + limits + propose checkpoint
                ↓
        IntegrationSourceEvent  (canonical boundary)
                ↕ bridge
        IntegrationEventEnvelope (contracts)
```

**Separation of concerns**

| Layer             | Responsibility                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| SDK `/events`     | Envelope, identity, pipelines, verification/replay/dedup contracts, cursors, checkpoints (in-memory) |
| Adapter           | Vendor webhook CRUD, payload translation, sync/poll implementation                                   |
| Platform (future) | HTTP ingress, Event Bus, workers/schedulers, durable stores                                          |

---

## Export

```text
@apzhub/integration-sdk/events
@apzhub/integration-sdk          → root re-exports
```

**Version:** `@apzhub/integration-sdk` **0.8.0**  
**Adapters:** `@apzhub/integration-plane` / `@apzhub/integration-zammad` remain **0.6.0**

---

## ADRs

| ADR                                                               | Topic                           |
| ----------------------------------------------------------------- | ------------------------------- |
| [0052](../adr/ADR-0052-canonical-source-event-envelope.md)        | Canonical source-event envelope |
| [0053](../adr/ADR-0053-event-identity-and-deduplication.md)       | Identity precedence & dedup     |
| [0054](../adr/ADR-0054-polling-checkpoint-acknowledgement.md)     | Checkpoint propose/ack          |
| [0055](../adr/ADR-0055-webhook-verification-boundary.md)          | Verification without ingress    |
| [0056](../adr/ADR-0056-adapter-polling-vs-platform-scheduling.md) | Polling vs scheduling           |

---

## Related

- [OSS-100-08 Completion Report](../sprint/OSS-100-08-completion-report.md)
- [Platform Integration SDK Architecture](./APZHUB-Platform-Integration-SDK-Architecture.md)
- [REFERENCE-ADAPTER-STANDARD.md](./REFERENCE-ADAPTER-STANDARD.md)
- [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)
- [Mapping Framework architecture index](./APZHUB-Integration-SDK-Mapping-Framework.md) (OSS-100-07)
- [HTTP Transport architecture index](./APZHUB-Integration-SDK-HTTP-Transport.md) (OSS-100-06)
