# Failure Categories

> **Programme:** APZHUB-QA-RECERT-001

---

## Counts (55 failed + 1 flaky)

| Category               | Count | Share |
| ---------------------- | ----: | ----: |
| Authentication         |    18 |   32% |
| Infrastructure         |    13 |   23% |
| Playwright Test Defect |    10 |   18% |
| UI Change              |     9 |   16% |
| Application Bug        |     4 |    7% |
| Timing                 |     1 |    2% |
| Flaky Test             |     1 |    2% |

---

## Category definitions (as applied)

| Category                                                               | Application in this analysis                                                            |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Authentication                                                         | Shell/session/hydration failures after login/register path                              |
| Infrastructure                                                         | Health 503; Next/`pg`/`dns` client bundle break                                         |
| Playwright Test Defect                                                 | Relative fetch, wrong Playwright API, strict locators                                   |
| Application Bug                                                        | WCAG contrast on primary button tokens                                                  |
| UI Change                                                              | Missing testids/copy; visual baseline drift                                             |
| Timing                                                                 | Explicit test timeout without stronger product signal                                   |
| Flaky Test                                                             | Passed on retry after intermittent strict-locator failure                               |
| Configuration / Missing Seed Data / Permissions / Regression / Unknown | Not primary labels for this run (seed issues folded into Authentication/Infrastructure) |
