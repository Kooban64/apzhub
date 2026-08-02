# Processing Engine — APZQEP-120-S09

| Field     | Value                                   |
| --------- | --------------------------------------- |
| Programme | APZQEP-120                              |
| Slice     | S09 — Reliable Event Processing Engine  |
| Package   | `@apzhub/platform-processing` **0.1.0** |
| Status    | **ACTIVE**                              |

## Principle

> The Processing Engine shall know _how_ to execute work, but never _why_ the work exists.

| Slice | Responsibility           |
| ----- | ------------------------ |
| S07   | Business event semantics |
| S08   | Reliable delivery        |
| S09   | Reliable execution       |
| S10+  | Business capabilities    |

## Platform Architecture Rule (S10)

```text
The Processing Engine SHALL execute registered processors.

The Processing Engine SHALL never contain business processing logic.

Business processing SHALL exist only inside registered processors.

Processor registration SHALL be the only extension mechanism.
```

This is a **platform architecture rule** — not an Enterprise Standard. Evidence processors (S10) and future Search/Notification/UCP processors register; they do not modify the engine.

## Package

```text
@apzhub/platform-processing
  → Processor Registry
  → Reservation / Lease
  → Stateless Worker
  → Ack / Retry / Dead Letter
  → Metrics (hooks only)
```

Delivery remains `@apzhub/platform-outbox`. Processing consumes delivered events via `enqueueFromOutboxEvent` (or direct enqueue for tests).

## Related

- [PROCESSING-CONTRACT.md](./PROCESSING-CONTRACT.md)
- [WORKER-LIFECYCLE.md](./WORKER-LIFECYCLE.md)
- [LEASE-MANAGEMENT.md](./LEASE-MANAGEMENT.md)
- [PROCESSOR-REGISTRY.md](./PROCESSOR-REGISTRY.md)
- [FAILURE-HANDLING.md](./FAILURE-HANDLING.md)
- [OUTBOX-ARCHITECTURE.md](./OUTBOX-ARCHITECTURE.md)
