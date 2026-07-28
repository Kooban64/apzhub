# Worker Design

## Process model

Dedicated worker process (or same host second process) with service identity `notification-delivery-worker`.

API/Gateway process: intake + admin only (may optionally run reclaim sweeper if configured — prefer worker owns reclaim).

## Lifecycle

```
start → load config → verify DB readiness → register worker_id
  → loop:
       reclaim expired leases (batch)
       claim batch (SKIP LOCKED)
       for each claimed: dispatch
       sleep / wait (bounded)
  → SIGTERM: stop_claiming → finish in-flight or release leases → exit
```

## Startup

- Require `APZHUB_NOTIFICATION_DELIVERY_ENABLED` + worker enabled + `DATABASE_URL`
- Fail readiness if DB unreachable
- Generate stable `worker_id` (hostname + pid + uuid)

## Shutdown

1. Set `accepting_claims=false`
2. Wait up to `shutdown_grace_ms` for in-flight dispatches
3. Release remaining `processing` leases owned by this worker (status→`queued`/`retry_scheduled`, clear claim fields)
4. Exit 0

## Claim loop

1. `BEGIN`
2. `SELECT … FROM delivery WHERE (status='queued' OR (status='retry_scheduled' AND next_attempt_at<=now())) ORDER BY next_attempt_at NULLS FIRST, created_at FOR UPDATE SKIP LOCKED LIMIT N`
3. Update to `status='processing'`, set claim fields, `lease_expires_at=now()+lease_ttl`
4. `COMMIT`
5. Process outside transaction (see TRANSACTION-DESIGN)

## Lease renewal

Long provider calls: renew lease before expiry (`lease_expires_at = now()+ttl`) if still `processing` and `claimed_by=self`.

## Lease expiry / reclaim

Periodic job: rows with `status=processing` AND `lease_expires_at < now()` → clear claim → set `queued` or `retry_scheduled` (if attempts already recorded) + `requeue_reason='lease_expired'`.

## Back-pressure

- Cap claim batch size (`N`)
- Cap concurrent dispatches per worker
- Respect `notificationMaxQueueDepth` on intake (existing)
- Pause claiming when DB pool saturated / circuit open

## Parallelism

- Multiple worker processes safe via SKIP LOCKED
- Intra-process concurrency pool optional (default serial or small pool)

## Failure handling

- Uncaught dispatch error → mark try failed → retry or DLQ per policy
- Panic mid-dispatch → lease expiry reclaim

## Duplicate prevention

Row lease + idempotency keys + provider_reference (when present).

## Explicit non-goals

Redis claim locks · Event Bus as queue · WebSockets.
