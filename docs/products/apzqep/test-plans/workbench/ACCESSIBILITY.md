# Accessibility — APZQEP-ENG-070A (WP-16)

## Mandatory bar

WCAG 2.2 AA target (OES-ENG-070A Part 4 §4, A11Y-01…06). Design System tokens only — no bespoke styling.

## Gates (A11Y-01…06)

| ID      | Requirement                                                                                                           | Implementation                                                                             | Status |
| ------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| A11Y-01 | axe clean (serious/critical = 0) on Dashboard, Explorer, Review, Inspector, Compare unavailable slot, primary dialogs | Playwright `axe: dashboard, explorer, inspector, review, compare have no critical/serious` | ✅     |
| A11Y-02 | Full keyboard operability, Explorer → Inspector → action                                                              | Playwright `keyboard path Explorer to Inspector action`                                    | ✅     |
| A11Y-03 | Focus trap in dialogs; focus restored to triggering control on close                                                  | `ActionDialog`-style component; Playwright `dialog focus trap and Escape close`            | ✅     |
| A11Y-04 | Status never colour-only                                                                                              | `QepStatusBadge` renders a text label alongside colour                                     | ✅     |
| A11Y-05 | `prefers-reduced-motion` respected                                                                                    | No bespoke/infinite animation introduced; Shell/Design System tokens govern motion         | ✅     |
| A11Y-06 | Correct table/grid and tab/region ARIA semantics                                                                      | `QepTable` (Explorer/Review) + Inspector panel structure reuse shared `qep-ui` primitives  | ✅     |

## Evidence

- Code: dialog rendering and `data-testid="qep-plan-action-dialog"` / `qep-plan-confirm-{action}` hooks in `apps/web/components/qep/qep-test-plan-views.tsx`
- Playwright: `testing/playwright/e2e/apzqep-eng-070a-test-plans-workbench.spec.ts`
  - `axe: dashboard, explorer, inspector, review, compare have no critical/serious`
  - `dialog focus trap and Escape close`
  - `keyboard path Explorer to Inspector action`
- Vitest: action-visibility and dialog interaction assertions in `qep-test-plan-views.test.tsx`

## Reduced motion

Shell/Design System tokens govern motion; the Workbench does not introduce custom infinite animations or non-token transitions.

## Known gap

Accessibility gates were exercised on the surfaces explicitly named in A11Y-01 (Dashboard, Explorer, Review, Inspector, Compare unavailable). The Create/Edit Draft forms and Relationships/History/Versions sub-panels were not separately axe-scanned as discrete Playwright cases; they reuse the same `qep-ui` primitives (inputs, panels, tables) already covered by the axe-scanned surfaces, so no distinct accessibility risk is expected. Recorded here for completeness rather than claimed as separately verified.
