# ACCESSIBILITY-ARCHITECTURE — APZQEP-164-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-164-000   |
| Timestamp | 20260803T191002Z |
| Target    | **WCAG 2.2 AA**  |

## Requirements

| Area                           | Architecture expectation                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| Keyboard navigation            | All widgets operable without pointer; focus order matches visual order                 |
| Screen readers                 | Meaningful names/roles; live regions for refresh; chart summaries as text alternatives |
| Colour                         | No information by colour alone; token contrast AA                                      |
| Responsive                     | Reflow without loss of meaning; horizontal scroll only inside intentional data tables  |
| Internationalisation readiness | No hardcoded copy in platform packages; APZQEP supplies locale strings via i18n hooks  |
| Motion                         | Respect `prefers-reduced-motion`; Motion library subtle only (004)                     |

## Verification (future engineering)

Storybook a11y tests (028) + Playwright accessibility checks on primary landings before Board certification of APZQEP-164.
