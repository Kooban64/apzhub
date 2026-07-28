# Claim Engine — Platform-1.4-ENG-001B-P2

## Purpose

Transaction-safe work claiming for durable notification delivery rows (ADR-0073 / ENG-001A Phase 2).

## Contract

`NotificationDeliveryClaimPort` in `@apzhub/notification-contracts` **0.3.3**:

- `claimBatch({ workerId, limit, leaseTtlMs, now? })`
- `reclaimExpiredLeases({ limit, now? })`
- Combined store type: `NotificationDeliveryDurableRuntimeStore`

## Implementations

| Backend    | Location                                                            | Claim style                                       |
| ---------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| PostgreSQL | `packages/notification-delivery-persistence/src/postgres/store.ts`  | `FOR UPDATE SKIP LOCKED` CTE + UPDATE             |
| In-memory  | `packages/notification-delivery-persistence/src/in-memory/store.ts` | Sorted candidates + ownership check before mutate |

## Claimable statuses

- `queued`
- `retry_scheduled` when `next_attempt_at` is null or `<= now`

## On successful claim

- `status` → `processing`
- `claimed_by` → worker id
- `claimed_at` → now
- `lease_expires_at` → now + TTL
- `requeue_reason` cleared

## Explicit non-scope

Claim engine does **not** dispatch, invoke providers, schedule retries, or process dead letters.
