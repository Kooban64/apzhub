# ADR-0054: Polling Checkpoint Acknowledgement

## Status

Accepted — OSS-100-08

## Context

Polling progress must be resumable without silently advancing past unprocessed or rejected pages. Auto-committing cursors inside the execution loop risks data loss on partial failure.

## Decision

1. Checkpoints use **propose → commit | abandon** semantics (`proposed` | `committed` | `abandoned`).
2. `PollingExecutionPipeline` may **propose** a checkpoint after a run; it must **not** auto-commit when `requireCheckpointAck` is true (default).
3. Callers acknowledge success via `commit`, or reject via `abandon`, with correlation IDs.
4. Latest committed checkpoint per `sourceId` is the resume source.
5. In-memory store is for tests; production durable SoR is future platform work.

## Consequences

- Platform schedulers (when authorised) own ack timing after validating records/events.
- Cancelled/stalled/limit-exceeded runs may still propose — caller decides commit vs abandon.
- Adapters remain free of durable checkpoint databases in OSS-100-08.

## Related

- [POLLING-CHECKPOINTS.md](../../packages/integration-sdk/docs/POLLING-CHECKPOINTS.md)
- [ADR-0056](./ADR-0056-adapter-polling-vs-platform-scheduling.md)
- [OSS-100-08 Completion Report](../sprint/OSS-100-08-completion-report.md)
