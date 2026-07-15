# APZREPORT-003 — Workbench Audit

**Date:** 2026-07-13  
**Verdict:** **PASS** (unit/component) · Playwright **LIMITED** (mock HTTP; requires app `baseURL`)  
**Certification:** APZREPORT-003

---

## Navigation

| Section | Route | Manifest permission |
| ------- | ----- | ------------------- |
| Reporting home | `/workspace/reporting` | `report.view` |
| Templates | `/workspace/reporting/templates` | `report.view` |
| Generated Reports | `/workspace/reporting/generations` | `report.view` |
| History | `/workspace/reporting/history` | `report.view` |
| Formats | `/workspace/reporting/formats` | `report.view` |

Router: `ReportingWorkspaceRouter` → `PlatformReportingView`.

## Commands certified

Refresh · Generate · Preview · View Metadata · Download Metadata · Validate Template · Open Consumer

**Excluded (verified absent):** edit · designer · schedule · delete · email · AI

## UX capabilities

| Capability | Result |
| ---------- | ------ |
| Search / filter | **PASS** |
| Sorting (templates + generations) | **PASS** |
| Pagination | **PASS** |
| Metadata inspection / JSON download | **PASS** |
| Preview panel | **PASS** |
| Output format listing | **PASS** |
| Responsive layout | **PASS** (flex wrap / overflow tables) |
| Read-only administration | **PASS** |

## Accessibility

| Check | Result |
| ----- | ------ |
| Toolbar `role="toolbar"` + label | **PASS** |
| Status / alert regions | **PASS** |
| Labelled search + sort controls | **PASS** |
| Keyboard-activatable table rows (Enter/Space) | **PASS** |
| Focusable interactive controls | **PASS** |
| Token-based colours (no hardcoded brand purple) | **PASS** |

Evidence: `platform-reporting-view.test.tsx` (9 tests).

## Playwright

Spec: `testing/playwright/e2e/apzreport-002-platform-reporting-workbench.spec.ts`  
Mocks `/api/v1/reporting/**` — no live product dependencies.  
**Limitation:** requires running app `baseURL` in CI environments.
