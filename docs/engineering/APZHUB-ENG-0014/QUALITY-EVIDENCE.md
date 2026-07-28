# APZHUB-ENG-0014 — Quality Evidence

> **Programme:** APZHUB-ENG-0014  
> **Date:** 2026-07-21  
> **Scope:** RG-WORKFLOW-WB only (Order 6)

---

## Commands executed

| Gate              | Command                                             | Result                                   |
| ----------------- | --------------------------------------------------- | ---------------------------------------- |
| Lint              | `pnpm exec eslint` on member spec                   | **PASS**                                 |
| Typecheck         | N/A — Playwright harness only                       | **N/A**                                  |
| Unit tests        | N/A — no product/unit surface changed               | **N/A**                                  |
| Integration tests | N/A — no service/API change                         | **N/A**                                  |
| Architecture      | No product/service/SDK/boundary changes             | **PASS**                                 |
| Compatibility     | Platform 1.2.0 packaging / public APIs unchanged    | **PASS**                                 |
| Scoped Playwright | `apzworkflow-009-workflow-engine-workbench.spec.ts` | **2 passed · 0 failed · 0 flaky** (~51s) |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --retries=1 \
  testing/playwright/e2e/apzworkflow-009-workflow-engine-workbench.spec.ts
```

---

## RG-WORKFLOW-WB Playwright results

| Test                                                         | Before                                    | After    |
| ------------------------------------------------------------ | ----------------------------------------- | -------- |
| overview shows READ-ONLY ENGINE via mocked typed-client path | FAIL (`toContainText` / mock path)        | **PASS** |
| workflows section shows list and definition viewer           | FAIL (timeout / empty list from 404 mock) | **PASS** |

**Remaining hard failures (group):** **0**  
**Remaining flaky (group):** **0**

Evidence: [20260721T090100Z-APZHUB-ENG-0014-RG-WORKFLOW-WB.json](../../operations/evidence/portfolio-recert/20260721T090100Z-APZHUB-ENG-0014-RG-WORKFLOW-WB.json)
