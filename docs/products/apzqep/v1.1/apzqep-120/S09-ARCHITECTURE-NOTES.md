# APZQEP-120-S09 — Architecture Notes

## Decision

Create `@apzhub/platform-processing` as a platform execution engine, separate from `@apzhub/platform-outbox` (delivery).

```text
S07 Domain Events → S08 Platform Outbox → DeliveryPort
                         ↓ (handoff)
                   S09 Processing Engine → EventProcessor (registered)
                         ↓
                   Ack | Retry | Dead Letter
```

## Principle

The engine never interprets business meaning. Processors are registered capabilities. Future Search/Notifications/QI/AI are processors — not engine forks.

## Sequence (happy path)

```text
enqueue(pending)
worker.reserve → reserved
acquireLease → leased
markProcessing → processing
processor.execute → acknowledged
metrics.onAttempt(success)
```
