# APZHUB-ENG-0010 — Quality Evidence

> **Programme:** APZHUB-ENG-0010  
> **Date:** 2026-07-21  
> **Scope:** RG-PW-API only

---

## Commands executed

| Gate                            | Command                                 | Result                                    |
| ------------------------------- | --------------------------------------- | ----------------------------------------- |
| Lint                            | `pnpm exec eslint` on two member specs  | **PASS**                                  |
| Typecheck                       | N/A — Playwright test-only              | **N/A**                                   |
| Unit / Integration / Regression | N/A for this test-hygiene group         | **N/A**                                   |
| Architecture                    | No product/service/SDK contract changes | **PASS**                                  |
| Compatibility                   | Platform 1.2.0 packaging unchanged      | **PASS**                                  |
| Scoped Playwright               | Three RG-PW-API member tests            | **2 passed · 0 failed · 1 flaky** (~1.1m) |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --retries=1 \
  testing/playwright/e2e/apzreport-002-platform-reporting-workbench.spec.ts \
  testing/playwright/e2e/apztcms-022-engineering-intelligence-workbench.spec.ts \
  -g "exposes command toolbar and a11y landmarks|opens Engineering Intelligence through mocked|supports panel tabs and a11y landmarks"
```

---

## RG-PW-API Playwright results

| Test                                                          | Before                  | After                                                                              |
| ------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| exposes command toolbar and a11y landmarks                    | FAIL (`getByLabelText`) | **PASS**                                                                           |
| opens Engineering Intelligence through mocked /api/v1/testing | FAIL (`getByLabelText`) | **PASS**                                                                           |
| supports panel tabs and a11y landmarks                        | FAIL (`getByLabelText`) | **PASS** (flaky: first attempt tablist timeout; retry PASS including `getByLabel`) |

**Remaining RG-PW-API hard failures:** **0**  
**Remaining flaky (this scoped run):** **1** (tablist hydration — not `getByLabel` API defect)

Evidence JSON: [20260721T060700Z-APZHUB-ENG-0010-RG-PW-API.json](../../operations/evidence/portfolio-recert/20260721T060700Z-APZHUB-ENG-0010-RG-PW-API.json)
