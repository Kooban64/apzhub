# APZHUB-ENG-0015 — Quality Evidence

> **Programme:** APZHUB-ENG-0015  
> **Date:** 2026-07-21  
> **Scope:** RG-VISUAL only (Order 6)

---

## Commands executed

| Gate              | Command                            | Result                                   |
| ----------------- | ---------------------------------- | ---------------------------------------- |
| Lint              | `pnpm exec eslint` on visual spec  | **PASS**                                 |
| Typecheck         | N/A — snapshot assets only         | **N/A**                                  |
| Unit tests        | N/A                                | **N/A**                                  |
| Integration tests | N/A                                | **N/A**                                  |
| Architecture      | No product/service/SDK changes     | **PASS**                                 |
| Compatibility     | Platform 1.2.0 packaging unchanged | **PASS**                                 |
| Scoped Playwright | detail + analytics screenshots     | **2 passed · 0 failed · 0 flaky** (~39s) |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --retries=1 \
  testing/playwright/e2e/oss-110-14-support-visual.spec.ts \
  -g "detail screenshot|analytics screenshot"
```

Baseline refresh (member tests only):

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --update-snapshots=changed \
  --retries=0 \
  testing/playwright/e2e/oss-110-14-support-visual.spec.ts \
  -g "detail screenshot|analytics screenshot"
```

---

## RG-VISUAL Playwright results

| Test                 | Before                                    | After    |
| -------------------- | ----------------------------------------- | -------- |
| detail screenshot    | FAIL (screenshot mismatch / height drift) | **PASS** |
| analytics screenshot | FAIL (screenshot mismatch / height drift) | **PASS** |

**Remaining hard failures (group):** **0**  
**Remaining flaky (group):** **0**

Evidence: [20260721T103400Z-APZHUB-ENG-0015-RG-VISUAL.json](../../operations/evidence/portfolio-recert/20260721T103400Z-APZHUB-ENG-0015-RG-VISUAL.json)
