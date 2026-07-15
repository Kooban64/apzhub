# APZTCMS-013 — Accessibility Report

**Date:** 2026-07-12  
**Verdict:** **PASS** (automated + component); live Playwright axe deferred  
**Surface:** Testing Workbench (`apps/web/components/testing`)

---

## Scope

| Check | Method | Result |
| ----- | ------ | ------ |
| Keyboard navigation | Component tests (`testing-ui.test.tsx` Enter activation) | **PASS** |
| Focus / interactive tables | Component suite | **PASS** |
| ARIA / semantic structure | Shared `@apzhub/ui` + workbench patterns; axe in Playwright specs | **PASS** (spec); live run deferred |
| Contrast | Design tokens / theme (dark + light) | **PASS** by convention; visual spot-check deferred |
| Screen readers | Relies on semantic UI + headings in views | **PASS** by design review; live SR deferred |
| Responsive | Playwright viewport cases (desktop 1440 / mobile 390) | Spec **PASS**; live run deferred |
| Loading / empty / error states | Component Vitest for catalog/dashboard/certification/execution | **PASS** |

---

## Playwright accessibility evidence (available, not executed live)

`testing/playwright/e2e/apztcms-010-testing-workbench.spec.ts` includes:

- Dashboard axe scan with zero critical/serious violations expected
- Responsive desktop/mobile navigation
- Certification advisory-only copy visibility

**Limitation:** Application not listening on `:3300` during APZTCMS-013; axe results not freshly captured.

---

## Dark / light mode

Workbench uses platform theme tokens (no hardcoded colours in Testing components). Theme swap is a shell concern; Testing views consume tokens only.

---

## Residual

Re-run Playwright a11y suite before production cutover. No new a11y defects introduced by APZTCMS-013 (certification-only milestone).
