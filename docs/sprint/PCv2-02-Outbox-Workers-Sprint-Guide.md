# PCv2-02 — Outbox Workers & Event Replay — Sprint Guide

> **Status:** APPROVED (owner Engineering Execution Mode)  
> **Package:** `@apzhub/platform-outbox` **0.1.0**  
> **Authority:** [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md) · [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md) · [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md)

---

## Objective

Make the event-driven architecture production-safe by draining the durable Law outbox (`law_outbox_event`) with retry, DLQ, and replay — including trust events written to the same table (TD-T07).

---

## MVP scope

| Item           | Deliverable                                            |
| -------------- | ------------------------------------------------------ |
| Worker package | `@apzhub/platform-outbox`                              |
| Schema         | Migration `0060_apz_platform_outbox_worker.sql`        |
| Drain          | `createOutboxWorker().processBatch()`                  |
| Retry / DLQ    | Status lifecycle + backoff                             |
| Replay         | `worker.replay()` for published / failed / dead-letter |
| Trust          | Same drain path (aggregate type `trust`)               |
| Entry          | `pnpm worker:outbox` / `pnpm worker:outbox --once`     |
| Audit          | `pnpm audit:platform-outbox`                           |

---

## Out of scope

- PCv2-08 central workers platform / BullMQ / Agenda
- Webhook fan-out product
- ENF durable transport rewrite
- Search publication journal changes
- Kimai, provisioning, GitLab CI, AI Assist

---

## Architecture

```text
Law / Trust mutation (same TX)
    → law_outbox_event (pending)
    → OutboxWorker.processBatch()   [outside HTTP]
    → OutboxHandler(s)
    → status published | retrying | dead-letter
```

Default MVP handler: acknowledging handler (marks delivery success). Additional handlers (Event Bus relay, projections) may compose later without changing the drain contract.

---

## Stop condition

MVP complete: package tests green, audit PASS, docs/CURRENT-* updated, completion report written. Await owner before next programme.

---

## Debt closed (MVP)

| Ref    | Item                            |
| ------ | ------------------------------- |
| TD-P18 | Outbox worker service (MVP)     |
| TD-P19 | Event replay (filter re-queue)  |
| TD-P20 | Dead-letter handling            |
| TD-T07 | Trust events on same drain path |
