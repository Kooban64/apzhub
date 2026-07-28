# Accessibility Review — APZQEP-CERT-080A

| Field | Value |
| ----- | ----- |
| Result | **PASS** (WCAG AA intent) |
| Date | 2026-07-28 |
| Source | Re-cited from [../workbench/ACCESSIBILITY.md](../workbench/ACCESSIBILITY.md) and [../CERT-070A/CERTIFICATION-REPORT.md](../CERT-070A/CERTIFICATION-REPORT.md) — not re-executed under CERT-080A |

## Gates

| Gate | Result |
| ---- | ------ |
| A11Y-01 axe clean (serious/critical = 0) on Dashboard, Explorer, Review, Inspector, Compare-unavailable, primary dialogs | **PASS** (Playwright, cited) |
| A11Y-02 full keyboard operability Explorer → Inspector → action | **PASS** (Playwright, cited) |
| A11Y-03 dialog focus trap + Escape + focus restore | **PASS** (Playwright, cited) |
| A11Y-04 status never colour-only | **PASS** — `QepStatusBadge` text label |
| A11Y-05 `prefers-reduced-motion` respected | **PASS** — no bespoke animation; Design System tokens govern motion |
| A11Y-06 correct table/grid and tab/region ARIA semantics | **PASS** — shared `qep-ui` primitives |

## Recorded gap (P-03, scope-defining)

Create/Edit Draft and Relationships/History/Versions sub-panels were not separately axe-scanned — they reuse primitives already scanned on Dashboard/Explorer/Inspector/Review/Compare. Recorded as a test-authoring completeness gap, not a correctness defect. See [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md).

## Verdict

Accessibility review **PASS** under **PRODUCTION_READY_WITH_LIMITATIONS**, consistent with the CERT-070A assessment, re-confirmed unchanged for this Capability Certification.
