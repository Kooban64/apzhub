# Work-Claiming Model

## Principles

1. Only rows in `queued` or due `retry_scheduled` are claimable.
2. Claim is a single atomic DB transaction that transitions to `processing` and records lease metadata.
3. Preferred mechanism class: `FOR UPDATE SKIP LOCKED` (or equivalent) + lease expiry timestamp + worker identity.
4. Abandoned claims: lease expiry returns work to claimable set (via status revert to `queued`/`retry_scheduled` or reclaim of expired `processing`).
5. Multiple workers/instances permitted; uniqueness enforced by row lock/lease — not by process memory.
6. Graceful shutdown: stop claiming; finish or release in-flight leases.
7. Duplicate workers: safe due to row-level claim; no shared in-memory queue.

## Lease fields (logical)

`claimed_by`, `claimed_at`, `lease_expires_at` (additive columns under future ENG migration if not already present — architecture permits extending 0065 tables).

## Explicit

Do not claim via Redis-only locks as SoR. Do not claim via Event Bus delivery guarantees.
