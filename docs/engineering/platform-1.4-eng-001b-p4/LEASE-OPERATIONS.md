# Lease Operations — Platform-1.4-ENG-001B-P4

## Clear abandoned lease

Clears lease fields on abandoned/processing rows that meet abandonment criteria and returns the delivery to an eligible recoverable state. Rejects non-abandoned leases (lease conflict metrics incremented).

## Force lease expiry

Forces lease expiry for operational recovery when a worker is stuck. Audited; permission-gated.

## Listing

`listLeases` returns processing-lease rows sorted by `leaseExpiresAt`.

## Notes

- Does not remove process-local runtime
- Does not claim work when durable flag is OFF
- Lease fencing from Phase 3 remains authoritative for workers
