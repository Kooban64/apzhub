# APZHUB-ENG-0012 — Quality Evidence

> **Programme:** APZHUB-ENG-0012  
> **Date:** 2026-07-21  
> **Scope:** RG-METRICS-WB only (Order 6)

---

## Commands executed

| Gate              | Command                                    | Result                                   |
| ----------------- | ------------------------------------------ | ---------------------------------------- |
| Lint              | `pnpm exec eslint` on member spec          | **PASS**                                 |
| Typecheck         | N/A — Playwright test-only                 | **N/A**                                  |
| Architecture      | No product/service/SDK changes             | **PASS**                                 |
| Compatibility     | Platform 1.2.0 packaging unchanged         | **PASS**                                 |
| Scoped Playwright | `apzmetrics-004-metrics-workbench.spec.ts` | **2 passed · 0 failed · 0 flaky** (~45s) |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --retries=1 \
  testing/playwright/e2e/apzmetrics-004-metrics-workbench.spec.ts
```

---

## RG-METRICS-WB Playwright results

| Test                                            | Before                                   | After    |
| ----------------------------------------------- | ---------------------------------------- | -------- |
| metadata journey across overview…diagnostics    | FAIL (`metrics-page` not visible)        | **PASS** |
| shows METRICS_SERVICE_UNAVAILABLE when disabled | FAIL (`metrics-unavailable` not visible) | **PASS** |

**Remaining hard failures:** **0**  
**Remaining flaky:** **0**

Evidence: [20260721T064100Z-APZHUB-ENG-0012-RG-METRICS-WB.json](../../operations/evidence/portfolio-recert/20260721T064100Z-APZHUB-ENG-0012-RG-METRICS-WB.json)
