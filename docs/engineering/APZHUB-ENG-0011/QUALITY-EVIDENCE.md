# APZHUB-ENG-0011 — Quality Evidence

> **Programme:** APZHUB-ENG-0011  
> **Date:** 2026-07-21  
> **Scope:** RG-SELECTORS only

---

## Commands executed

| Gate              | Command                                 | Result                                    |
| ----------------- | --------------------------------------- | ----------------------------------------- |
| Lint              | `pnpm exec eslint` on four member specs | **PASS**                                  |
| Typecheck         | N/A — Playwright test-only              | **N/A**                                   |
| Architecture      | No product/service/SDK changes          | **PASS**                                  |
| Compatibility     | Platform 1.2.0 packaging unchanged      | **PASS**                                  |
| Scoped Playwright | Four RG-SELECTORS member tests          | **3 passed · 0 failed · 1 flaky** (~1.4m) |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --retries=1 \
  testing/playwright/e2e/apzdocs-005-platform-documents-workbench.spec.ts \
  testing/playwright/e2e/apzsearch-007-platform-search-workbench.spec.ts \
  testing/playwright/e2e/apztcms-018-pipeline-workbench.spec.ts \
  testing/playwright/e2e/apzobserve-004-observe-workbench.spec.ts \
  -g "opens Documents workbench through mocked|query section shows mocked hit|opens workflow runs and asserts a11y landmarks|manifest journey across overview"
```

---

## RG-SELECTORS Playwright results

| Test                                           | Before              | After                                               |
| ---------------------------------------------- | ------------------- | --------------------------------------------------- |
| opens Documents workbench (Playwright Policy)  | FAIL (strict)       | **PASS**                                            |
| query section shows mocked hit                 | FAIL (strict)       | **PASS**                                            |
| opens workflow runs and asserts a11y landmarks | FAIL (strict)       | **PASS** (flaky: heading timeout; cell OK on retry) |
| manifest journey (ad_pw)                       | FAIL/flaky (strict) | **PASS**                                            |

**Remaining hard failures:** **0**  
**Remaining flaky:** **1** (TCMS Workflow runs heading hydration — not selector collision)

Evidence: [20260721T061700Z-APZHUB-ENG-0011-RG-SELECTORS.json](../../operations/evidence/portfolio-recert/20260721T061700Z-APZHUB-ENG-0011-RG-SELECTORS.json)
