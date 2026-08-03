# Execution Lifecycle — APZQEP-161

## States

| State       | Terminal | Meaning                           |
| ----------- | -------- | --------------------------------- |
| queued      | no       | Accepted; awaiting scheduler      |
| preparing   | no       | Provider `prepare` in progress    |
| running     | no       | Provider `execute` in progress    |
| retrying    | no       | Failed attempt; retry scheduled   |
| completed   | yes      | Success                           |
| failed      | yes      | Exhausted retries or hard failure |
| cancelled   | yes      | Cancelled by operator / API       |
| timed_out   | yes      | Exceeded `timeoutMs`              |
| interrupted | yes      | Process/host interruption         |

## Transition rules

Illegal transitions are rejected by the engine (unit-tested). Typical happy path:

```text
queued → preparing → running → completed
```

Retry path:

```text
… → running → retrying → preparing → running → completed|failed
```

## Events

Lifecycle changes publish domain events (past-tense / platform naming), including evidence publication when artifacts and refs are ready. Correlation IDs travel with the execution record.
