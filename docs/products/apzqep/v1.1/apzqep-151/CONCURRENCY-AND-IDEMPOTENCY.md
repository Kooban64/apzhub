# Concurrency and Idempotency

## Optimistic concurrency

Every Cap A–F mutable aggregate uses `revision`. Stale writes throw `*.concurrency.stale_revision`.

## Idempotency

- Plan handoff: domain-level idempotent return of existing handoff (durable once plan is in PostgreSQL)
- Session creation from handoff: `findByHandoff` prevents duplicates
- Durable key store: `qep_core_qe_idempotency` + `createPostgresCoreQeIdempotencyStore`
- Outbox enqueue uses idempotency keys; duplicate keys are no-ops
