# Failure Handling — APZQEP-120-S09

## Classification

| Class     | Typical action                         |
| --------- | -------------------------------------- |
| transient | Retry with backoff                     |
| timeout   | Retry / lease reclaim                  |
| permanent | Dead letter preparation                |
| poison    | Dead letter preparation immediately    |
| unknown   | Treat conservatively (retry until max) |

## Paths

```text
Processor throws / retryable → Retry Scheduled
PROCESSING_TIMEOUT → Retry
LEASE_EXPIRED → Retry Scheduled (reclaim)
permanent / poison / max attempts → Dead Letter Ready
NO_PROCESSOR → Dead Letter Ready
```

Dead-letter **product** (ops UI) is later. S09 provides preparation hooks + metrics only.
