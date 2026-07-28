# Test Results — Platform-1.4-ENG-001B-P2

> **Date:** 2026-07-23  
> **Scope:** Affected Vitest for claim/lease engine + durable worker skeleton

## Executed

| Suite                                          | Path                                                 | Result        |
| ---------------------------------------------- | ---------------------------------------------------- | ------------- |
| Contracts                                      | `packages/notification-contracts`                    | **PASS** (4)  |
| Persistence CRUD                               | `notification-delivery-persistence.test.ts`          | **PASS** (4)  |
| Claim & lease                                  | `claim-lease-engine.test.ts`                         | **PASS** (8)  |
| Postgres persistence (unit/skip as configured) | `notification-delivery-persistence-postgres.test.ts` | **PASS** (3)  |
| ENG-004 process-local delivery                 | `eng004-notification-delivery.test.ts`               | **PASS** (13) |
| P0 foundation / flag                           | `eng001b-p0-durable-foundation.test.ts`              | **PASS** (5)  |
| P2 worker lifecycle                            | `eng001b-p2-durable-worker.test.ts`                  | **PASS** (10) |

**Total affected:** 47 tests · **PASS**

## Coverage asserted

- Single worker claim
- Multiple workers / simultaneous claims / duplicate prevention
- Lease expiry + abandoned reclaim
- Lease renewal + fencing
- Worker restart / graceful shutdown release
- Feature flag OFF / ON
- Legacy process-local compatibility (ENG-004 suite unchanged behaviour)

## Not executed

- Full monorepo Vitest
- Live Postgres integration against a running database
- Playwright E2E
