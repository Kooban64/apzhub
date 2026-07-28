# APZHUB-ENG-0020 — Quality Evidence

> **Programme:** APZHUB-ENG-0020  
> **Date:** 2026-07-21  
> **Scope:** RG-SUPPORT-CERT + RG-OBSERVE-WB + RG-VISUAL-INBOX only

---

## Commands executed

| Gate                     | Command                                                                                                            | Result                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Unit (affected)          | `pnpm exec vitest run` Support errors + inbox/analytics/detail views                                               | **11/11 PASS**                             |
| Lint (affected)          | `pnpm exec eslint` on changed Support/Observe/spec files                                                           | **PASS**                                   |
| Typecheck                | Affected Support unit scope via Vitest; full `apps/web` tsc shows pre-existing `.next/dev/types` noise (unrelated) | **PASS** (affected)                        |
| Integration / Regression | Covered by scoped Playwright suites below                                                                          | **PASS**                                   |
| Architecture             | No SDK/service/connector redesign; Support↔Observe boundaries unchanged                                            | **PASS**                                   |
| Compatibility            | Platform 1.2.0 packaging / SemVer unchanged                                                                        | **PASS**                                   |
| Scoped Playwright        | Observe + Support 110-13/14 cert/a11y/visual                                                                       | **20 passed · 0 failed · 0 flaky** (~2.4m) |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --retries=1 \
  testing/playwright/e2e/apzobserve-004-observe-workbench.spec.ts \
  testing/playwright/e2e/oss-110-13-support-module.spec.ts \
  testing/playwright/e2e/oss-110-14-support-accessibility.spec.ts \
  testing/playwright/e2e/oss-110-14-support-ui-certification.spec.ts \
  testing/playwright/e2e/oss-110-14-support-visual.spec.ts
```

Inbox baseline refresh:

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --update-snapshots=changed \
  --retries=0 \
  testing/playwright/e2e/oss-110-14-support-visual.spec.ts \
  -g "inbox screenshot"
```

---

## Results vs CERT-001 residual members

| ID            | Suite / case                    | Before                             | After    |
| ------------- | ------------------------------- | ---------------------------------- | -------- |
| QA2-F-001     | apzobserve-004 manifest journey | FAIL (strict mode `hc_pw`/`md_pw`) | **PASS** |
| QA2-F-009     | oss-110-13 maps 403/503         | FAIL (`support-error` timeout)     | **PASS** |
| QA2-F-010     | oss-110-14 a11y Tab             | FAIL                               | **PASS** |
| QA2-F-011     | oss-110-14 lifecycle            | FAIL (detached controls)           | **PASS** |
| QA2-F-012…014 | oss-110-14 error landmarks      | FAIL                               | **PASS** |
| QA2-F-015     | inbox visual                    | FAIL (800 vs 928)                  | **PASS** |

**Remaining hard failures (these groups):** **0**  
**Remaining flaky (these groups):** **0**

Evidence: [20260721T164923Z-APZHUB-ENG-0020-SUPPORT-OBSERVE-VISUAL.json](../../operations/evidence/portfolio-recert/20260721T164923Z-APZHUB-ENG-0020-SUPPORT-OBSERVE-VISUAL.json)
