# APZNOTIFY-003 Coverage Baseline

**Date:** 2026-07-16 (recorded at vertical certification)  
**Milestone:** Notification HTTP API & Production Typed Client

## Posture

HTTP handlers are thin gateway wrappers (architecture-audited). Typed client + mock + query keys covered by:

- `apps/web/lib/notifications/notification-client.test.ts`
- `apps/web/lib/notifications/notification-coverage.test.ts`
- `apps/web/lib/notifications/notification-boundary.test.ts`

Consolidated vertical re-measure under APZNOTIFY-005 includes these paths.

## Audit

```bash
pnpm audit:notification-http-client
# RESULT: PASS
```
