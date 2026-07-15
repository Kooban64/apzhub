# Polling Checkpoints (OSS-100-08)

**Package:** `@apzhub/integration-sdk` v0.8.0  
**Export:** `@apzhub/integration-sdk/events`  
**Related ADR:** [ADR-0054](../../../docs/adr/ADR-0054-polling-checkpoint-acknowledgement.md)

---

## Purpose

Checkpoints capture polling progress so a run can resume safely. The pipeline **proposes** checkpoints; callers **commit** (ack) or **abandon** after validating results. Auto-commit before acknowledgement is forbidden.

```text
execute → proposedCheckpoint (state: proposed)
              ↓
     caller validates records / events
              ↓
     checkpointStore.commit(id)  |  abandon(id)
```

---

## States

| `CheckpointState` | Meaning                                         |
| ----------------- | ----------------------------------------------- |
| `proposed`        | Suggested after a run; not yet durable progress |
| `committed`       | Acknowledged — becomes latest for `sourceId`    |
| `abandoned`       | Rejected — cannot commit afterward              |

---

## Store contract

```typescript
interface PollingCheckpointStore {
  getLatest(sourceId: string): Promise<PollingCheckpoint | undefined>;
  propose(input: ProposeCheckpointInput): Promise<PollingCheckpoint>;
  commit(checkpointId: string, correlationId: string): Promise<PollingCheckpoint>;
  abandon(checkpointId: string, correlationId: string): Promise<PollingCheckpoint>;
  clear?(sourceId?: string): Promise<void>;
}
```

`InMemoryPollingCheckpointStore` — **tests only**.

Rules:

- Cannot commit an abandoned checkpoint
- Cannot abandon a committed checkpoint
- `getLatest` tracks the last **committed** checkpoint per source

---

## Pipeline behaviour

When `checkpointStore` is set and `requireCheckpointAck !== false` (default):

1. After the poll loop, `propose({ sourceId, cursor: lastCursor, recordsProcessed, correlationId })`
2. Result includes `proposedCheckpoint`
3. Pipeline does **not** call `commit`

Set `requireCheckpointAck: false` only when intentionally disabling propose (rare).

---

## Ack / commit pattern

```typescript
const result = await pipeline.execute(context, { mode: "incremental", cursor });

if (result.ok && result.proposedCheckpoint) {
  await checkpointStore.commit(result.proposedCheckpoint.id, context.correlationId);
  // next run: getLatest → use checkpoint.cursor
} else if (result.proposedCheckpoint) {
  await checkpointStore.abandon(result.proposedCheckpoint.id, context.correlationId);
}
```

---

## Errors

| Code                                          | When                                 |
| --------------------------------------------- | ------------------------------------ |
| `integration.events.polling.checkpoint_error` | Missing id, invalid state transition |

`isPollingCheckpointError` helper available.

---

## Limitations

- No production persistence in SDK
- Propose may still occur on cancelled/stalled/limit paths when a store is present — caller decides commit vs abandon
- Platform durable checkpoint SoR is future work

---

## Related

- [POLLING-CONTRACTS.md](./POLLING-CONTRACTS.md)
- [POLLING-CURSORS.md](./POLLING-CURSORS.md)
- [ADR-0054](../../../docs/adr/ADR-0054-polling-checkpoint-acknowledgement.md)
- [ADR-0056](../../../docs/adr/ADR-0056-adapter-polling-vs-platform-scheduling.md)
