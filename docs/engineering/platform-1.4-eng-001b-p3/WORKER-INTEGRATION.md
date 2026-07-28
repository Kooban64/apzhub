# Worker Integration

`durable-worker.ts` (P3):

1. reclaim expired
2. claim batch
3. for each claimed → `orchestrator.dispatchClaimed`
4. continue after individual failures
5. shutdown → release remaining held leases

Process-local worker in `createNotificationDeliveryService` retained; yields when durable flag ON.
