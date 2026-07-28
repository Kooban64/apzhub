# APZHUB-ENG-0022 — Quality Evidence

> **Programme:** APZHUB-ENG-0022  
> **Date:** 2026-07-21  
> **Scope:** Groups A–E only

---

## Commands executed

| Gate                  | Command                                                                | Result              |
| --------------------- | ---------------------------------------------------------------------- | ------------------- |
| Lint (full)           | `pnpm lint`                                                            | **PASS** (0 errors) |
| TypeScript            | `tsc --noEmit` — workbench-framework, web, integration-zammad          | **PASS**            |
| Vitest (affected)     | view-engine · workbench-manager · zammad-core-services                 | **37/37 PASS**      |
| Playwright (affected) | config · analytics · projects · time · law-api DX · spr-003 context    | **19/19 PASS**      |
| Architecture          | Longest-prefix view resolution unit-tested; Law routes remain apps/web | **PASS**            |
| Compatibility         | No SemVer / DB / contract breaks                                       | **PASS**            |

### Affected Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --retries=1 \
  testing/playwright/e2e/law-api-developer-experience.spec.ts \
  testing/playwright/e2e/apzconfig-004-platform-configuration-workbench.spec.ts \
  testing/playwright/e2e/apzhub-analytics-workbench.spec.ts \
  testing/playwright/e2e/apzhub-projects-001-workbench.spec.ts \
  testing/playwright/e2e/apzhub-time-1.0-workbench.spec.ts \
  testing/playwright/e2e/spr-003-workbench-context-selection.spec.ts
```

---

## Previously failing → newly passing

| Source (QA-CERT-002)                              | After ENG-0022 |
| ------------------------------------------------- | -------------- |
| Lint `no-useless-escape` ×2                       | **PASS**       |
| Zammad `discoverCapabilities().length` (12 vs 11) | **PASS** (11)  |
| `apzconfig-004` browses configurations (`cfg_pw`) | **PASS**       |
| Analytics dashboard detail `toHaveURL`            | **PASS**       |
| Projects list → detail `toHaveURL`                | **PASS**       |
| Time timesheets detail + create `toHaveURL`       | **PASS**       |
| Law OpenAPI YAML/JSON · guide · health            | **PASS**       |
| SPR-003 `platform-home-overview` persistence      | **PASS**       |

**Previously failing (punch list):** 2 lint + 1 Vitest + 10 Playwright hard  
**Newly passing (affected verification):** all of the above  
**Remaining hard failures (punch list scope):** **0**  
**Remaining flaky (affected suites):** **0**

> Note: Support Soft performance baseline flaky from QA-CERT-002 was outside this punch list and not re-executed here.

Evidence: [20260721T190028Z-APZHUB-ENG-0022-CERTIFICATION-PUNCHLIST.json](../../operations/evidence/portfolio-recert/20260721T190028Z-APZHUB-ENG-0022-CERTIFICATION-PUNCHLIST.json)
