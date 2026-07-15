# OSS-100-08 Completion Report — Webhook & Polling Contracts

**Status:** Complete  
**Date:** 2026-07-11  
**Scope:** OSS-100-08 only — Webhook & polling contracts in `@apzhub/integration-sdk`; Plane/Zammad thin wrappers; **no** HTTP ingress; **no** Platform Event Bus; **no** workers/schedulers; **no** OSS-100-09+

---

## Executive summary

Delivered vendor-neutral **Webhook & Polling** contracts in `@apzhub/integration-sdk` **v0.8.0**. Export `@apzhub/integration-sdk/events` provides `IntegrationSourceEvent`, identity/dedup, schema versioning, `WebhookManager` / verification / replay / processing pipeline, `PollingSource` / cursors / checkpoints / execution pipeline, diagnostics, metrics, capabilities, bridges, and mocks.

Plane and Zammad remain **0.6.0**. They wrap via `asPlaneWebhookManager` / `asZammadWebhookManager`, `translate*WebhookToSourceEvent`, and `create*PollingSource` without changing public webhook/sync/event service signatures.

**Stop condition met:** Await owner approval before **OSS-100-09+** (provisioning/harness) **or** a separate platform webhook-ingress / Event Bus milestone. Do **not** start either without approval.

---

## Objective

Provide reusable webhook and polling infrastructure in the Integration SDK so adapters share envelope, identity, verification, pipelines, and checkpoint semantics — without introducing ingress, bus publish, workers, or durable production stores.

---

## Architecture overview

| Layer          | Component                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Envelope       | `IntegrationSourceEvent`, `buildIntegrationSourceEvent`, schema versions `1.0.0`                 |
| Identity       | `deriveSourceEventId`, `deriveDeduplicationKey`, `createSdkEventId`                              |
| Dedup / replay | `EventDeduplicationStore`, `ReplayProtection` (in-memory for tests)                              |
| Webhooks       | `WebhookManager`, `asWebhookManager`, verifier, `WebhookProcessingPipeline`                      |
| Polling        | `PollingSource`, `createPollingSourceFromSync`, cursors, checkpoints, `PollingExecutionPipeline` |
| Observability  | `EventMetrics`, `EventDiagnosticsCollector`, `buildSafeEventLogFields`                           |
| Bridge         | `toIntegrationEventEnvelope` / `fromIntegrationEventEnvelope`                                    |
| Testing        | Mock harness, HMAC verifier, mock decoder/translator/source                                      |
| Adapters       | Plane/Zammad thin wrappers (versions stay 0.6.0)                                                 |

```text
Webhook path:  decode → verify → replay → translate → dedup → IntegrationSourceEvent
Polling path:  PollingSource.poll → limits/stall → propose checkpoint → IntegrationSourceEvent?
```

**Boundary:** SDK contracts + pipelines only. Platform owns future ingress, Event Bus, schedulers, and durable stores.

---

## Delivered

### Package (`@apzhub/integration-sdk` v0.8.0)

| Component                                             | Location                          |
| ----------------------------------------------------- | --------------------------------- |
| Envelope / types / identity / versioning              | `src/events/`                     |
| Dedup / errors / diagnostics / metrics / capabilities | `src/events/`                     |
| Webhook manager / verify / replay / pipeline          | `src/events/webhook/`             |
| Polling source / cursor / checkpoint / pipeline       | `src/events/polling/`             |
| Bridge / mock                                         | `src/events/bridge.ts`, `mock.ts` |
| Subpath export                                        | `@apzhub/integration-sdk/events`  |
| Version                                               | `0.8.0`                           |

### Adapter migration

| Adapter                      | Change                                                | Version               |
| ---------------------------- | ----------------------------------------------------- | --------------------- |
| `@apzhub/integration-plane`  | WebhookManager / SourceEvent / PollingSource wrappers | **0.6.0** (unchanged) |
| `@apzhub/integration-zammad` | Same pattern                                          | **0.6.0** (unchanged) |

### Platform

| Component                           | Status                                  |
| ----------------------------------- | --------------------------------------- |
| Webhook HTTP ingress                | **ABSENT**                              |
| Platform Event Bus publish from SDK | **ABSENT**                              |
| Workers / schedulers                | **ABSENT**                              |
| Durable dedup/replay/checkpoint SoR | **ABSENT** (in-memory test stores only) |

### Documentation

| Document                                    | Path                                                          |
| ------------------------------------------- | ------------------------------------------------------------- |
| Envelope                                    | `packages/integration-sdk/docs/EVENT-ENVELOPE.md`             |
| Deduplication                               | `packages/integration-sdk/docs/EVENT-DEDUPLICATION.md`        |
| Webhook contracts / verification / pipeline | `packages/integration-sdk/docs/WEBHOOK-*.md`                  |
| Polling contracts / cursors / checkpoints   | `packages/integration-sdk/docs/POLLING-*.md`                  |
| Migration                                   | `packages/integration-sdk/docs/WEBHOOK-POLLING-MIGRATION.md`  |
| Architecture index                          | `docs/architecture/APZHUB-Integration-SDK-Webhook-Polling.md` |
| ADRs                                        | ADR-0052 … ADR-0056                                           |
| Package README                              | `packages/integration-sdk/README.md`                          |

---

## Tests

| Suite                                                                               | Result                                                                                                                                  |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `@apzhub/integration-sdk` full                                                      | **160** passed                                                                                                                          |
| Plane + Zammad                                                                      | **217** passed                                                                                                                          |
| Wave 1 + Wave 2 + Support vertical + platform-service-contracts + platform-services | **262** passed                                                                                                                          |
| Events coverage                                                                     | stmts ~**97.77%** · branches ~**86.25%** · funcs ~**98.68%** · lines ~**97.77%**                                                        |
| Critical paths                                                                      | webhook pipeline **100%**; polling pipeline ~**99%**; cursor/checkpoint **100%**; dedup **100%**; replay ~**98%**; diagnostics **100%** |
| Architecture boundary                                                               | PASS — no Plane/Zammad/platform-services/EntityMappingStore imports; no ingress/bus/scheduler; no secret keys in diagnostics/metrics    |

---

## Completion review

| Criterion                                          | Result |
| -------------------------------------------------- | ------ |
| `IntegrationSourceEvent` + versioning              | ✅     |
| Identity precedence + dedup store                  | ✅     |
| Export `@apzhub/integration-sdk/events`            | ✅     |
| `WebhookManager` + `asWebhookManager`              | ✅     |
| Verification + replay + webhook pipeline           | ✅     |
| `PollingSource` + cursors + checkpoints + pipeline | ✅     |
| Diagnostics + metrics + safe log fields            | ✅     |
| Mocks / test harness                               | ✅     |
| Plane/Zammad thin wrappers; public APIs stable     | ✅     |
| Adapter versions stay 0.6.0                        | ✅     |
| SDK version 0.8.0                                  | ✅     |
| No ingress / Event Bus / workers / schedulers      | ✅     |
| ADRs 0052–0056                                     | ✅     |
| OSS-100-09+ not started                            | ✅     |

---

## Quality gates

| Gate                                                             | Result                                                                                  |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| SDK typecheck / lint                                             | **PASS**                                                                                |
| Full SDK tests                                                   | Pass — **160**                                                                          |
| Plane + Zammad                                                   | Pass — **217**                                                                          |
| Wave1 / Wave2 / Support vertical / platform contracts & services | Pass — **262**                                                                          |
| Events coverage                                                  | ~97.77% stmts/lines · ~86.25% branches · ~98.68% funcs                                  |
| Critical path coverage                                           | As above                                                                                |
| Architecture-boundary + secret-redaction checks                  | **PASS**                                                                                |
| Full `@apzhub/web` build                                         | Not a mandatory SDK gate; known `/_global-error` prerender failure remains out of scope |

---

## Technical debt

| Item                                                 | Notes                                                                                        |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| In-memory stores only                                | Production Redis/PostgreSQL dedup/replay/checkpoint deferred to platform                     |
| Backlog named `WebhookReceiver` / `PollingScheduler` | Delivered as verifier+pipeline and PollingSource+execution pipeline; no scheduler (ADR-0056) |
| Pipeline optional at adapter call sites              | Existing webhook/sync services remain SoT; SDK wrappers additive                             |
| Generic HMAC verifier                                | Reference/test; vendor-specific verifiers may replace                                        |

---

## Risks

| Risk                                              | Mitigation                                  |
| ------------------------------------------------- | ------------------------------------------- |
| Confusing SDK pipelines with platform ingress/bus | Docs + ADRs explicit; absences listed       |
| Auto-commit of polling progress                   | ADR-0054 — propose/ack only                 |
| Dedup via SDK UUID                                | Precedence forbids; `deduplicatable: false` |
| Accidental OSS-100-09 / ingress start             | Stop condition + foundation closeout        |

---

## Recommendation for next work

**Await owner approval.** Candidates from backlog (do not invent new IDs beyond backlog):

| Option                       | Scope                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| **OSS-100-09+**              | Provisioning / harness / docs closeout (per OSS-100 backlog)                                           |
| **Platform webhook-ingress** | HTTP receiver + wiring to SDK pipeline + eventual Event Bus (separate from SDK phase if owner prefers) |

**Do not** start either without explicit approval. Do not add workers/schedulers to adapters.

---

## Stop condition

OSS-100-08 complete. **Await owner approval before OSS-100-09+ or platform webhook-ingress / Event Bus.**

Do not begin provisioning, test harness, ingress, or Event Bus work without approval.

---

## Related

- [EVENT-ENVELOPE.md](../../packages/integration-sdk/docs/EVENT-ENVELOPE.md)
- [APZHUB-Integration-SDK-Webhook-Polling.md](../architecture/APZHUB-Integration-SDK-Webhook-Polling.md)
- [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)
- [OSS-100-07 Completion Report](./OSS-100-07-completion-report.md)
- [ADR-0052](../adr/ADR-0052-canonical-source-event-envelope.md) · [ADR-0053](../adr/ADR-0053-event-identity-and-deduplication.md) · [ADR-0054](../adr/ADR-0054-polling-checkpoint-acknowledgement.md) · [ADR-0055](../adr/ADR-0055-webhook-verification-boundary.md) · [ADR-0056](../adr/ADR-0056-adapter-polling-vs-platform-scheduling.md)
