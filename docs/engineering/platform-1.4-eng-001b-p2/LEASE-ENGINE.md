# Lease Engine — Platform-1.4-ENG-001B-P2

## Purpose

Lease ownership, renewal, release, expiration, and fencing for durable delivery workers.

## Operations

| Operation        | API                    | Behaviour                                                                                     |
| ---------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| Create           | via `claimBatch`       | Sets owner + `lease_expires_at`                                                               |
| Renew            | `renewLease`           | Extends TTL only if `claimed_by` matches worker and status is `processing`                    |
| Release          | `releaseLease`         | Clears lease; status → `queued` or `retry_scheduled`; optional `requeue_reason`               |
| Expire / reclaim | `reclaimExpiredLeases` | `processing` rows with `lease_expires_at < now` → requeue with `requeue_reason=lease_expired` |
| Validate         | `validateClaim`        | True only for owning worker on `processing` row                                               |

## Fencing

Non-owner renew/release returns `null` / validation `false`. Abandoned leases are recovered only after expiry reclaim (or explicit owner release).

## Schema

Migration **0066** columns: `claimed_by`, `claimed_at`, `lease_expires_at`, `requeue_reason`.

## Explicit non-scope

No dispatch after claim; lease engine is ownership only.
