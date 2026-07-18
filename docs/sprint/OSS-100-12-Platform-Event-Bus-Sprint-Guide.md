# OSS-100-12 — Platform Event Bus & Webhook Ingress — Sprint Guide

> **Status:** APPROVED (Owner Programme Approval)  
> **Package:** `@apzhub/platform-event-bus` **0.1.0**  
> **Authority:** Owner Programme Approval OSS-100-12 · [Programme Recommendation](../foundation/completion-reports/PROGRAMME-RECOMMENDATION-OSS-100-12.md) · [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md)

---

## Objective

Implement the Platform Event Bus and Webhook Ingress only — validate Integration SDK source-event envelopes, route/dispatch onto the ENF in-process Event Bus, integrate durable relay/replay with `@apzhub/platform-outbox`, and expose health/diagnostics/audit/metrics.

---

## MVP scope

| Item          | Deliverable                                                                              |
| ------------- | ---------------------------------------------------------------------------------------- |
| Package       | `@apzhub/platform-event-bus` **0.1.0**                                                   |
| Ingress       | SDK `WebhookProcessingPipeline` composition + HMAC option                                |
| HTTP          | `POST /api/v1/platform/events/webhooks` (+ health/diagnostics/replay)                    |
| Dispatch      | Map → ENF `EventEnvelope` → `InProcessEventBus.publish`                                  |
| Outbox relay  | `createEventBusOutboxHandler` wired in `pnpm worker:outbox`                              |
| Replay        | `runtime.replay()` / authenticated replay route (memory outbox) + worker Postgres replay |
| Observability | Structured logs, metrics, in-memory audit sink, health                                   |
| Audit         | `pnpm audit:platform-event-bus`                                                          |

---

## Out of scope

- Commercial / product provisioning UI and flows
- BullMQ / PCv2-08 job registry
- GitLab CI / Kimai / Paperless / Metabase / AI Assist
- Webhook product integrations (Plane/Zammad-specific translators)
- Notification delivery providers
- Identity model changes
- Integration SDK public contract changes (require ADR + stop)
- Frozen Search / SoR architecture rewrites

---

## Architecture

```text
HTTP POST /api/v1/platform/events/webhooks
  → SDK WebhookProcessingPipeline (decode → verify → replay → translate → dedup)
  → IntegrationSourceEvent (validated)
  → route + map → EventEnvelope (platform.integration.sourceevent.received)
  → EventBus.publish  and/or  law_outbox_event (pending)

Outbox worker (pnpm worker:outbox)
  → EventBusOutboxHandler → EventBus.publish
  → acknowledging handler
  → published | retrying | dead-letter
```

---

## Contracts

- Use existing `@apzhub/integration-sdk/events` (frozen **1.0.0**) — no public API changes
- Use existing `@apzhub/platform-outbox` **0.1.0**
- Use existing ENF `InProcessEventBus` / `EventRegistry`

---

## Stop condition

MVP complete: typecheck/tests/audit PASS, docs/CURRENT-* updated, Completion Report + Programme Acceptance Report written. **STOP** — await Owner Acceptance. Do not recommend or start another programme.
