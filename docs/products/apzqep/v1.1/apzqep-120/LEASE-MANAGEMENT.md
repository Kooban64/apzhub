# Lease Management — APZQEP-120-S09

## Policy defaults

| Field               | Default |
| ------------------- | ------- |
| leaseTtlMs          | 30000   |
| processingTimeoutMs | 25000   |

## Lifecycle

1. `reserveBatch` → `reserved` + `reservedBy`
2. `acquireLease` → `leased` + `leaseExpiresAt`
3. `markProcessing` → `processing`
4. Optional `renewLease` while long-running (API available)
5. On success → ack clears lease fields
6. On expiry → `reclaimExpired` → `retry_scheduled`

## Determinism

Only the leasing worker may renew or mark processing. Concurrent workers cannot reserve the same item.
