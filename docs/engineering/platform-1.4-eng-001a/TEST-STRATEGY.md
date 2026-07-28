# Test Strategy

| Layer                  | Cases                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| Unit                   | Transitions, backoff, idempotency key formatting, failure class mapping |
| Integration (Postgres) | CRUD repos, unique constraints, claim SKIP LOCKED with two clients      |
| Lease                  | Claim, renew, expire, reclaim, shutdown release                         |
| Concurrency            | Two workers never claim same row; parallel intake                       |
| Restart                | Kill mid-processing → reclaim → single delivery                         |
| Duplicate prevention   | Same idempotency intent; replay keys                                    |
| Dead-letter            | Max attempts → DLQ; admin replay creates new delivery                   |
| Retry                  | Transient → retry_scheduled → due claim                                 |
| Migration              | 0065→0066 up; null leases readable                                      |
| Performance            | Claim batch latency under N (lab)                                       |
| Failure                | DB down on claim; adapter throw; panic simulation                       |
| Security               | Authz on admin; tenant isolation on list/replay                         |
| Tenant isolation       | Cross-tenant claim/replay denied                                        |
| Contract               | Existing eng004 suite green with durable store test double or postgres  |
| API/OpenAPI            | Admin paths documented if added                                         |

## Explicit

No fabricated PASS. Capacity evidence may defer to E02 programme but ENG-001B must ship restart/concurrency tests.
