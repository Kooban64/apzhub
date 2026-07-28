# Accessibility — ENG-050C (WP-16)

## Mandatory bar

WCAG 2.2 AA target. Tokens/Design System only.

## Implemented

| Requirement | Implementation |
| ----------- | -------------- |
| Dialog semantics | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Focus trap | Tab cycles within `ActionDialog` |
| Escape | Closes dialog |
| Focus restore | Returns focus to previously focused control on close |
| Keyboard | Explorer filter + link activation → Inspector actions (Playwright) |
| Status | `QepStatusBadge` text label (not colour-only) |
| Tables | `QepTable` caption (sr-only) |
| axe | Playwright: Dashboard, Explorer, Inspector, Review, Compare — critical/serious = 0 |

## Evidence

- Code: `ActionDialog` in `apps/web/components/qep/qep-test-specification-views.tsx`  
- Playwright: `testing/playwright/e2e/apzqep-eng-050c-test-specifications-workbench.spec.ts`  
- Vitest: dialog/action journeys in `qep-test-specification-views.test.tsx`

## Reduced motion

Shell/Design System tokens govern motion; Workbench does not introduce custom infinite animations.
