# APZIDENTITY-005 — Performance Baseline

**Date:** 2026-07-17  
**Result:** PASS (practical readiness — no redesign)

## Representative operations reviewed

| Operation               | Pagination       | Notes                                      |
| ----------------------- | ---------------- | ------------------------------------------ |
| User list / detail      | Yes (list query) | Typed client + TanStack Query              |
| Membership list         | Yes              | No N+1 in certified gateway path           |
| Service assignment list | Yes              | Metadata only                              |
| Audit / history list    | Yes              | Append-only reads                          |
| Diagnostics             | Single calls     | Health/readiness/capabilities              |
| Common mutations        | Point writes     | Query invalidation via `identityQueryKeys` |

## Guarantees

- List operations use platform pagination contracts
- Workbench invalidates via shared query keys (no second cache layer)
- Indexes in `0052`/`0053` support tenant-scoped IAM access patterns
- No unbounded list reads introduced in certification

## Limitations

No dedicated load-test platform. Large-tenant volume tuning is an operational concern for wave/ops follow-up, not a vertical certification defect.
