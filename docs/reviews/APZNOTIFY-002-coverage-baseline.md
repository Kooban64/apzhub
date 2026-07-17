# APZNOTIFY-002 Coverage Baseline

**Date:** 2026-07-14  
**Target:** ≥95% lines/functions · ≥70% branches (scoped)

## Measured

Scoped to `packages/platform-services/src/services/notification/**` + `packages/notification-core/src/service/**`:

| Metric | Combined |
| --- | ---: |
| Lines | **95.53%** |
| Functions | **97.33%** |
| Branches | **90.99%** |

## Audit

```bash
pnpm audit:notification-platform-services
# RESULT: PASS
```
