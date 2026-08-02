# Worker Lifecycle — APZQEP-120-S09

Workers are **stateless**. Business state belongs to domain services.

## Steps

```text
reserve_work
  → acquire_lease
    → execute_processor
      → commit_acknowledgement
        → release_reservation
          → update_metrics
```

API: `createProcessingWorker({ store, registry, workerId, … }).runOnce()`.

## Rules

- Workers reserve and lease work; they do not own business meaning.
- Crash recovery: expired leases reclaim to `retry_scheduled`.
- Concurrency: reservation is exclusive per work item.
