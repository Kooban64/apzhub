# Rollout Plan

## Deployment order

1. Apply migration **0066** (additive)
2. Deploy code with durable repos **disabled** (flag off) — still process-local OR read-only dual
3. Enable dual-write optional (ENG-001B phase decision: prefer **flag cutover** without dual-write if env never relied on memory durability)
4. Enable `APZHUB_NOTIFICATION_DURABLE_RUNTIME=true` on one worker
5. Enable on all workers; disable process-local SoR
6. Verify metrics/queue
7. Enable admin durable views

## Feature flags

| Flag                                   | Default     | Meaning                        |
| -------------------------------------- | ----------- | ------------------------------ |
| `APZHUB_NOTIFICATION_DELIVERY_ENABLED` | unset/false | Existing deny-by-default       |
| `APZHUB_NOTIFICATION_WORKER_ENABLED`   | unset/false | Existing                       |
| `APZHUB_NOTIFICATION_DURABLE_RUNTIME`  | unset/false | **New** — Postgres SoR + claim |

## Cutover

- Prefer empty/low queue window
- Document that in-memory Phase A queue is **not** migrated (ephemeral) — acceptable per ADR-0073 honesty

## Backward compatibility

- Public statuses unchanged
- Existing APIs preserved
- OpenAPI additive only

## Verification

- Restart test in staging
- Two-worker claim test
- Intent idempotency still holds
- In-app delivery smoke
