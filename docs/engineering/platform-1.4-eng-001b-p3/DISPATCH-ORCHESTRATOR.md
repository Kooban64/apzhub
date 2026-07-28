# Dispatch Orchestrator

**Module:** `packages/platform-services/src/services/notification/delivery/durable-dispatch-orchestrator.ts`

## Flow

1. `validateClaim` (worker + optional tenant/org)
2. Load intent; missing → dead-letter
3. Expiry → fenced clear to `expired`
4. Insert started try (short persistence)
5. Re-validate lease
6. **Channel I/O outside DB TX** (`dispatchInAppChannel` or injectable channel)
7. Fenced success / retry / dead-letter
8. After-commit fail-soft events

## Non-goals

No SMTP · no new providers · no product-to-provider bypass.
