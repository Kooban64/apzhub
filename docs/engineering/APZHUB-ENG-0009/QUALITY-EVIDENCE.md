# APZHUB-ENG-0009 — Quality Evidence

> **Programme:** APZHUB-ENG-0009  
> **Date:** 2026-07-21  
> **Scope:** RG-MOCK-FETCH only

---

## Commands executed

| Gate                            | Command                                                   | Result                                     |
| ------------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| Lint                            | `pnpm exec eslint` on four member specs                   | **PASS**                                   |
| Typecheck                       | N/A — Playwright test-only change (no package TS sources) | **N/A**                                    |
| Unit / Integration / Regression | Not applicable to this test-hygiene group                 | **N/A**                                    |
| Architecture                    | No product/service/SDK contract changes                   | **PASS**                                   |
| Compatibility                   | Platform 1.2.0 packaging unchanged                        | **PASS**                                   |
| Scoped Playwright               | Four RG-MOCK-FETCH member specs                           | **4 passed · 0 failed · 0 flaky** (~20.5s) |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --retries=1 \
  testing/playwright/e2e/apzadmin-003-administration-http.spec.ts \
  testing/playwright/e2e/apzidentity-003-identity-http.spec.ts \
  testing/playwright/e2e/apzmetrics-003-metrics-http.spec.ts \
  testing/playwright/e2e/apzobserve-003-observe-http.spec.ts
```

---

## RG-MOCK-FETCH Playwright results

| Test                                                             | Before | After    |
| ---------------------------------------------------------------- | ------ | -------- |
| mock fetch to /api/v1/administration serves module list envelope | FAIL   | **PASS** |
| mock fetch to /api/v1/identity serves user list envelope         | FAIL   | **PASS** |
| mock fetch to /api/v1/metrics serves metrics list envelope       | FAIL   | **PASS** |
| mock fetch to /api/v1/observe serves health-check list envelope  | FAIL   | **PASS** |

**Remaining RG-MOCK-FETCH failures:** **0**  
**Remaining flaky (this scoped run):** **0**

Evidence JSON: [20260721T053000Z-APZHUB-ENG-0009-RG-MOCK-FETCH.json](../../operations/evidence/portfolio-recert/20260721T053000Z-APZHUB-ENG-0009-RG-MOCK-FETCH.json)
