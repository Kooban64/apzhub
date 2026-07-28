# APZHUB-ENG-0013 — Quality Evidence

> **Programme:** APZHUB-ENG-0013  
> **Date:** 2026-07-21  
> **Scope:** RG-TCMS-WB only (Order 6)

---

## Commands executed

| Gate              | Command                                                     | Result                                   |
| ----------------- | ----------------------------------------------------------- | ---------------------------------------- |
| Lint              | `pnpm exec eslint` on member spec                           | **PASS**                                 |
| Typecheck         | N/A — Playwright harness only (no product TS change)        | **N/A**                                  |
| Unit tests        | N/A — no product/unit surface changed                       | **N/A**                                  |
| Integration tests | N/A — no service/API change                                 | **N/A**                                  |
| Regression tests  | Scoped to RG-TCMS-WB member Playwright only (per programme) | **PASS**                                 |
| Architecture      | No product/service/SDK/boundary changes                     | **PASS**                                 |
| Compatibility     | Platform 1.2.0 packaging / public APIs unchanged            | **PASS**                                 |
| Scoped Playwright | `apztcms-010` member tests (grep below)                     | **2 passed · 0 failed · 0 flaky** (~51s) |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --retries=1 \
  testing/playwright/e2e/apztcms-010-testing-workbench.spec.ts \
  -g "dashboard loads with testing page shell|certification detail shows gates and advisory recommendation"
```

---

## RG-TCMS-WB Playwright results

| Test                                                         | Before                                       | After    |
| ------------------------------------------------------------ | -------------------------------------------- | -------- |
| dashboard loads with testing page shell                      | FAIL (`testing-dashboard-stats` not visible) | **PASS** |
| certification detail shows gates and advisory recommendation | FAIL (`testing-page` not visible)            | **PASS** |

**Remaining hard failures (group):** **0**  
**Remaining flaky (group):** **0**

Evidence: [20260721T070126Z-APZHUB-ENG-0013-RG-TCMS-WB.json](../../operations/evidence/portfolio-recert/20260721T070126Z-APZHUB-ENG-0013-RG-TCMS-WB.json)
