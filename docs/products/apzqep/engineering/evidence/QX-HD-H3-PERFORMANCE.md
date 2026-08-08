# QX-HD / H3 — Performance

| Field      | Value                                                                            |
| ---------- | -------------------------------------------------------------------------------- |
| Timestamp  | 20260808T064200Z                                                                 |
| Status     | **CLOSED**                                                                       |
| UI suite   | `testing/playwright/e2e/apzqep-v11-h3-performance.spec.ts`                       |
| Orch suite | `packages/platform-orchestration/src/quality-flow-workspace-operational.test.ts` |

---

## Measurements (UI — warm shell methodology)

| Surface / metric                                             | Budget   | Result        |
| ------------------------------------------------------------ | -------- | ------------- |
| QFW · Automation · SCM · QI · Dashboards · Evidence headings | ≤ 5000ms | PASS (5–12ms) |
| QFW detail                                                   | ≤ 5000ms | PASS (40ms)   |
| Dashboard detail                                             | ≤ 5000ms | PASS (6ms)    |
| Evidence status filter (search-like)                         | ≤ 4000ms | PASS (45ms)   |

Recorded log line: `[H3-PERF-APZQEP]` (Playwright stdout).

Cold first-paint of Next.js workspace catch-all is host compile noise and excluded (same approach as APZ Projects H3).

---

## Orchestration / Quality Flow Workspace

Operational performance suite (prior QX-P1-03 evidence, re-run PASS): create/list/timeline/transition within recorded thresholds — **no optimisation required**.

---

## Optimisation

**None required** — all measured budgets met without code changes beyond measurement methodology.
