# Worker Lifecycle — Platform-1.4-ENG-001B-P2

## Purpose

Durable worker skeleton that claims and holds leases without executing notification dispatch.

## Module

`packages/platform-services/src/services/notification/delivery/durable-worker.ts`

## Lifecycle

| Phase             | Behaviour                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Startup           | `start()` requires delivery + worker + durable flags ON; begins idle interval                |
| Claim cycle       | `tick()`: reclaim expired → claim batch → renew held leases                                  |
| Idle wait         | Interval driven by `idleWaitMs` (default 500ms)                                              |
| Graceful shutdown | Stop accepting claims → wait in-flight tick → `releaseLease` all held with `worker_shutdown` |
| Restart           | Released rows are claimable by a new worker                                                  |

## Guarantees (P2)

- No provider calls
- No dispatch / receipt progression beyond claim ownership
- Process-local Maps worker in `createNotificationDeliveryService` remains separate and unchanged

## Test coverage

`eng001b-p2-durable-worker.test.ts` — single/multi worker, shutdown, reclaim, flag OFF/ON, legacy default.
