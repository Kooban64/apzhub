# ANA-P1-04 — Operator surfaces honesty

| Field  | Value            |
| ------ | ---------------- |
| ID     | **ANA-P1-04**    |
| Slice  | **APZAN-104**    |
| Status | **Closed**       |
| Date   | 20260808T185500Z |

## Disposition

Datasets / reports / health / diagnostics remain **operator** surfaces (`analytics.admin` or explicit grants). UI gated in `analytics-workspace-router.tsx`. No false live-embed affordance on dashboard detail.

## Tests

- `analytics-daily-path.test.ts` — admin-gate assertions
