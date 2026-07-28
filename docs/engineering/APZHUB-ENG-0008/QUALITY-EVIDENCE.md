# APZHUB-ENG-0008 — Quality Evidence

> **Programme:** APZHUB-ENG-0008  
> **Date:** 2026-07-21  
> **Scope:** RG-A11Y-CONTRAST only

---

## Commands executed

| Gate              | Command                                                                                                         | Result                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Typecheck         | `pnpm --filter @apzhub/theme typecheck` · `ui` · `web`                                                          | **PASS**                                  |
| Lint              | `pnpm --filter @apzhub/theme lint` · `ui`                                                                       | **PASS**                                  |
| Unit              | `pnpm --filter @apzhub/ui test` (passWithNoTests) · `vitest run packages/ui/src/components/status-bar.test.tsx` | **PASS** (2)                              |
| Architecture      | Theme CSS primary-button contract + `@source` for UI; no layer bypass                                           | **PASS**                                  |
| Compatibility     | Light/dark primary pairs ≥ 4.5:1; success/warning light text ≥ 4.5:1; Platform 1.2.0 packaging unchanged        | **PASS**                                  |
| Scoped Playwright | Member RG-A11Y-CONTRAST tests                                                                                   | **4 passed · 0 failed · 0 flaky** (~1.0m) |

### Scoped Playwright command

```bash
CI=true pnpm exec playwright test \
  --config testing/playwright/playwright.config.ts \
  --retries=1 \
  testing/playwright/e2e/accessibility.spec.ts \
  testing/playwright/e2e/oss-110-14-support-accessibility.spec.ts \
  -g "login page has no critical axe violations|inbox has no critical/serious axe violations|search has no critical/serious axe violations|organizations has no critical/serious axe violations"
```

---

## RG-A11Y-CONTRAST Playwright results

| Test                                                 | Before                | After    |
| ---------------------------------------------------- | --------------------- | -------- |
| login page has no critical axe violations            | FAIL (color-contrast) | **PASS** |
| inbox has no critical/serious axe violations         | FAIL (color-contrast) | **PASS** |
| search has no critical/serious axe violations        | FAIL (color-contrast) | **PASS** |
| organizations has no critical/serious axe violations | FAIL (color-contrast) | **PASS** |

**Remaining RG-A11Y-CONTRAST failures:** **0**  
**Remaining flaky (this scoped run):** **0**

Evidence JSON: [20260721T051300Z-APZHUB-ENG-0008-RG-A11Y-CONTRAST.json](../../operations/evidence/portfolio-recert/20260721T051300Z-APZHUB-ENG-0008-RG-A11Y-CONTRAST.json)
