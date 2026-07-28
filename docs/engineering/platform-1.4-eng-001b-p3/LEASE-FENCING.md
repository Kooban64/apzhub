# Lease Fencing

Completion/retry/DLQ require:

1. `status === processing`
2. `claimed_by === workerId`
3. Optional `tenantId` / `organisationId` match

Postgres: `UPDATE … WHERE status='processing' AND claimed_by=$worker`.  
Stale worker cannot overwrite newer claims.
