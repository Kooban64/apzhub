# H3 — Performance

| Field  | Value                                                           |
| ------ | --------------------------------------------------------------- |
| Phase  | Hardening H3                                                    |
| Status | **COMPLETE**                                                    |
| Suite  | `testing/playwright/e2e/apzhub-projects-h3-performance.spec.ts` |
| Host   | Standalone production server                                    |

## Budgets

| Surface                     | Budget   | Measured (latest) | Result |
| --------------------------- | -------- | ----------------- | ------ |
| Workspace queue visible     | ≤ 5000ms | 10ms              | PASS   |
| Portfolio band visible      | ≤ 5000ms | 6ms               | PASS   |
| Cockpit visible             | ≤ 5000ms | 16ms              | PASS   |
| Context composition panel   | record   | 8ms               | PASS   |
| Search input interactive    | ≤ 4000ms | 16ms              | PASS   |
| Command Palette open        | ≤ 2000ms | 20ms              | PASS   |
| Large portfolio shell       | record   | 3ms               | PASS   |
| Projects API max (observed) | ≤ 1500ms | (mocked fulfills) | PASS   |

## Optimisations

None required — all measured values within budget. No product performance changes authorised without evidence of unacceptable latency.

## Sign-off

| Criterion                 | Status                  |
| ------------------------- | ----------------------- |
| Measurements recorded     | **DONE**                |
| Optimise only on evidence | **N/A — within budget** |
| H3 accepted               | **COMPLETE**            |
