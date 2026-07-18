# OSS-100-12 Completion Report — Platform Event Bus & Webhook Ingress

> **Status:** ACCEPTED / CLOSED  
> **Package:** `@apzhub/platform-event-bus` **0.1.0**  
> **Date:** 2026-07-18  
> **Owner Acceptance:** 2026-07-18  
> **Classification:** Platform Integration Runtime MVP

---

## Executive summary

OSS-100-12 delivers the Platform Event Bus and Webhook Ingress MVP. Ingress composes frozen Integration SDK webhook contracts, validates SDK `IntegrationSourceEvent` envelopes, routes to a registered ENF event (`platform.integration.sourceevent.received`), dispatches on the in-process Event Bus, and optionally enqueues durable rows for `@apzhub/platform-outbox` relay/replay. HTTP thin routes expose ingress, health, diagnostics, and replay. The outbox worker wires the Event Bus relay handler. No Integration SDK public contract changes. No BullMQ. No product webhook adapters.

---

## Deliverables

| Item                          | Path / command                                              |
| ----------------------------- | ----------------------------------------------------------- |
| Package                       | `packages/platform-event-bus/` **0.1.0**                    |
| Ingress HTTP                  | `POST /api/v1/platform/events/webhooks`                     |
| Health / diagnostics / replay | `/api/v1/platform/events/{health,diagnostics,replay}`       |
| Outbox worker relay           | `scripts/worker-outbox.mjs` (Event Bus handler + ack)       |
| Audit                         | `pnpm audit:platform-event-bus`                             |
| Sprint guide                  | `docs/sprint/OSS-100-12-Platform-Event-Bus-Sprint-Guide.md` |
| Unit + integration tests      | **10** passed                                               |

---

## Architecture

```text
Client / engine webhook
  → POST /api/v1/platform/events/webhooks
  → SDK WebhookProcessingPipeline
  → IntegrationSourceEvent
  → route + map → EventEnvelope
  → InProcessEventBus.publish  ±  outbox enqueue

pnpm worker:outbox
  → EventBusOutboxHandler → InProcessEventBus.publish
  → acknowledging handler
```

---

## Explicit limitations (retained)

- ENF bus remains in-process (no durable transport rewrite)
- Product-specific webhook translators (Plane/Zammad/etc.) not included
- HTTP replay requires `APZHUB_EVENT_BUS_MEMORY_OUTBOX=1`; production Postgres replay via `pnpm worker:outbox`
- Production ingress requires `APZHUB_WEBHOOK_INGRESS_SECRET`
- No BullMQ / PCv2-08 / notification delivery / identity changes

---

## Quality

| Gate                                                 | Result                       |
| ---------------------------------------------------- | ---------------------------- |
| `pnpm --filter @apzhub/platform-event-bus typecheck` | PASS                         |
| `pnpm --filter @apzhub/platform-event-bus test`      | **10** passed                |
| `pnpm audit:platform-event-bus`                      | PASS                         |
| Integration SDK public contracts                     | Unchanged (**1.0.0** frozen) |

---

## Stop condition

**ACCEPTED / CLOSED.** Owner Acceptance recorded. Bootstrap and recommend next programme only after this closure (lifecycle).

---

## See also

- [Sprint Guide](./OSS-100-12-Platform-Event-Bus-Sprint-Guide.md)
- [Programme Acceptance Report](../foundation/completion-reports/OSS-100-12-programme-acceptance-report.md)
