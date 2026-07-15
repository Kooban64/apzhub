# ADR-0056: Adapter Polling vs Platform Scheduling

## Status

Accepted — OSS-100-08

## Context

Adapters already expose sync APIs (Plane/Zammad). Early backlog drafts mentioned `PollingScheduler` in the SDK. Platform owns workers and scheduling; putting schedulers in adapters or the SDK would violate layering and duplicate orchestration.

## Decision

1. SDK provides **`PollingSource`** + **`PollingExecutionPipeline`** (limits, stall detection, checkpoint propose) — not a scheduler.
2. Adapters implement or wrap sync services as `PollingSource` (`createPollingSourceFromSync`).
3. **Workers, cron, and schedulers remain platform concerns** — absent from SDK and adapters in OSS-100-08.
4. Checkpoint acknowledgement is caller-owned (ADR-0054); platform ingestion will drive execute + ack later.
5. Webhook **management** remains adapter-side; webhook **HTTP ingress** remains platform-future — neither is a polling scheduler.

## Consequences

- Clear split: adapters fetch pages; platform decides when and how often.
- No silent background sync in `@apzhub/integration-sdk`.
- Future platform-ingestion milestone can schedule pipelines without changing adapter contracts.

## Related

- [POLLING-CONTRACTS.md](../../packages/integration-sdk/docs/POLLING-CONTRACTS.md)
- [ADR-0054](./ADR-0054-polling-checkpoint-acknowledgement.md)
- [012 — Events & background processing](../012-event-driven-architecture-background-processing-workflow-framework.md)
- [OSS-100-08 Completion Report](../sprint/OSS-100-08-completion-report.md)
