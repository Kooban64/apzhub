# Dead-Letter Model

## When

Delivery reaches `permanent_failure` with `deadLetter=true` (poison, max attempts exceeded, permanent provider/policy failure).

## Where

Durable on delivery record in PostgreSQL (`dead_letter` column exists in 0065). Optional future DLQ projection table only if admin query needs demand it — prefer single SoR.

## Operations

- Inspect via admin APIs filtered by tenant/org
- Replay = privileged create of new eligible state / re-queue with new attempt budget per policy
- Who: permission-gated notification delivery admin roles
- Audit required on replay
- Tenant controls: cannot replay across tenants
