# Transaction Design

## Claim transaction (atomic)

```
BEGIN
  SELECT claimable FOR UPDATE SKIP LOCKED LIMIT N
  UPDATE status=processing, claimed_by, claimed_at, lease_expires_at
COMMIT
```

## Dispatch (non-atomic with provider)

After claim committed:

1. Insert `delivery_try` (started) — short TX
2. Call in-app adapter (I/O outside TX)
3. Completion TX: finish try + update delivery status + optional in-app item + clear lease fields

## Completion transaction (success)

```
BEGIN
  UPDATE try finished + receipt
  UPDATE delivery status=delivered, terminal_at, clear claim, receipt_level
  INSERT in_app_item if channel=in_app
  UPDATE intent aggregate status as needed
COMMIT
→ publish events fail-soft AFTER commit
```

## Retry transaction

```
BEGIN
  UPDATE try finished (failure)
  UPDATE delivery status=retry_scheduled, next_attempt_at, attempt_count, failure fields, clear claim
COMMIT
→ publish retry event
```

## Dead-letter transaction

```
BEGIN
  UPDATE try finished
  UPDATE delivery status=permanent_failure, dead_letter=true, terminal_at, clear claim
COMMIT
→ publish failure/DLQ event
```

## Reclaim transaction

```
BEGIN
  SELECT processing WHERE lease_expires_at < now() FOR UPDATE SKIP LOCKED
  UPDATE clear claim, status=queued|retry_scheduled, requeue_reason
COMMIT
```

## Replay transaction (admin)

```
BEGIN
  INSERT new delivery (queued) with replay metadata + new idempotency key
  INSERT audit event row / publish audit after commit
COMMIT
```

## Atomic operations checklist

| Op                | Atomic?                 |
| ----------------- | ----------------------- |
| Claim batch       | Yes (single TX)         |
| Provider I/O      | No                      |
| Persist try start | Yes                     |
| Complete success  | Yes (single TX)         |
| Schedule retry    | Yes                     |
| DLQ               | Yes                     |
| Event publish     | After commit, fail-soft |

## Explicit

Do not hold DB transactions open across provider I/O.
