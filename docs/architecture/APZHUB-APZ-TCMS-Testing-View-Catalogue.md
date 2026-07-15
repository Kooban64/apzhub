# APZ TCMS — Testing View Catalogue

**Product:** APZ TCMS  
**Module:** Testing (`testing`)  
**Milestone:** APZTCMS-010  
**Authority:** [UI Architecture](./APZHUB-APZ-TCMS-UI-Architecture.md) · [Testing Workbench Architecture](./APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md)

---

## Overview

Fifteen sidebar views plus the dashboard, routed by `TestingWorkspaceRouter`. Each view is presentation-only: TanStack Query loads data via `testing-api` → `TestingClient` (mock in APZTCMS-010).

| View component | Route(s) | Client method(s) |
| -------------- | -------- | ---------------- |
| `TestingDashboardView` | `/workspace/testing` | `getDashboard` |
| `TestingRequirementsView` | `/workspace/testing/requirements` | `listRequirements` |
| `TestingPlansView` | `/workspace/testing/plans`, `…/plans/:id` | `listPlans`, `getPlan` |
| `TestingSuitesView` | `/workspace/testing/suites` | `listSuites` |
| `TestingCasesView` | `/workspace/testing/cases` | `listCases` |
| `TestingExecutionView` | `/workspace/testing/executions`, `…/executions/:id` | `listExecutions`, `getExecution` |
| `TestingAutomationView` | `/workspace/testing/automation` | `listAutomationRuns` |
| `TestingEvidenceView` | `/workspace/testing/evidence` | `listEvidence` |
| `TestingCoverageView` | `/workspace/testing/coverage` | `listCoverage` |
| `TestingDefectsView` | `/workspace/testing/defects` | `listDefects` |
| `TestingQualityView` | `/workspace/testing/quality` | `listQualitySummaries` |
| `TestingCertificationView` | `/workspace/testing/certification`, `…/certification/:id` | `listCertifications`, `getCertification` |
| `TestingReleaseReadinessView` | `/workspace/testing/release-readiness` | `listReleaseReadiness` |
| `TestingReportsView` | `/workspace/testing/reports` | `listReportPlaceholders` |
| `TestingAdministrationView` | `/workspace/testing/administration` | `listAdminSettings` |

---

## Dashboard

**Component:** `TestingDashboardView`  
**Displays:**

- Headline and stat cards (plans, cases, executions, certifications, defects, coverage %)
- Recent certifications table (name, state, recommendation, gate count, updated)
- Recent executions table (case, state, result, updated) with navigation to detail

**Interactions:** Row click navigates to certification or execution detail.

---

## Requirements

**Component:** `TestingRequirementsView`  
**Displays:** Searchable table of requirements — key, title, status, priority, updated.

**Data:** Traceability requirements linked to test planning (mock fixture data).

---

## Plans

**Component:** `TestingPlansView`  
**List displays:** Plan name, status, suite count, case count, updated.  
**Detail displays:** Plan metadata, linked suites table, linked cases summary.  
**Create action:** `create_plan` command when `testing.plans.create` granted.

---

## Suites

**Component:** `TestingSuitesView`  
**Displays:** Suite name, plan, status, case count, updated.  
**Create action:** `create_suite` with name + plan ID (defaults to fixture plan ID).

---

## Cases

**Component:** `TestingCasesView`  
**Displays:** Case key, title, suite, priority, automation flag, status, updated.  
**Create action:** `create_case` with title + suite ID (defaults to fixture suite ID).

---

## Manual Execution

**Component:** `TestingExecutionView`  
**List displays:** Execution ID, case, state, result, started, updated.  
**Detail displays:**

- Execution state and result badges
- Step table (order, instruction, expected, actual, status)
- Linked evidence list (metadata)
- `TestingCommandsPanel` (start / pause / resume / submit evidence)

---

## Automation

**Component:** `TestingAutomationView`  
**Displays:** Provider, run label, status, passed/failed/skipped counts, imported timestamp.

**Note:** Ingestion results summary only — no adapter configuration UI.

---

## Evidence

**Component:** `TestingEvidenceView`  
**Displays:** Title, kind, content type, size (formatted bytes), status, created.

**Constraint:** **Metadata only** — no binary upload, download, or preview. Submit via execution commands registers metadata in mock store.

---

## Coverage

**Component:** `TestingCoverageView`  
**Displays:** Scope label, kind, percentage, requirement link, computed timestamp.

---

## Defects

**Component:** `TestingDefectsView`  
**Displays:** External key, title, severity, status, linked case/execution, updated.

**Note:** Defect links only — no external sync UI.

---

## Quality

**Component:** `TestingQualityView`  
**Displays:** Dimension label, score/status, trend indicator, snapshot timestamp.

---

## Certification

**Component:** `TestingCertificationView`  
**List displays:** Name, state, recommendation badge, gate count, updated.  
**Detail displays:**

- State panel (status badge, updated)
- **Recommendation panel** — advisory badge + “Advisory only” disclaimer
- Gates table (name, status, reason, evaluator, evaluated)
- Approval history (stage, decision, actor, decided, comment)
- Audit history (action, actor, at, detail)
- `TestingCommandsPanel` (review / approve / reject / archive)

**Constraint:** Recommendations are **advisory only** — never auto-approve.

---

## Release Readiness

**Component:** `TestingReleaseReadinessView`  
**Displays:** Per-release panel with overall status, updated timestamp, and dimension breakdown table (dimension, status, score, notes).

---

## Reports

**Component:** `TestingReportsView`  
**Displays:** Report placeholder name, format, status, description.

**Constraint:** Placeholder metadata only — no reporting engine or export.

---

## Administration

**Component:** `TestingAdministrationView`  
**Displays:** Setting key, value, category, description (module settings stubs).

---

## Shared UI primitives

Defined in `testing-ui.tsx`:

| Primitive | Purpose |
| --------- | ------- |
| `PageShell` | Title, description, breadcrumbs, actions |
| `LoadingState` | `role="status"` loading panel |
| `EmptyState` | Zero-data messaging |
| `ErrorState` | `role="alert"` with optional retry |
| `StatusBadge` | Normalised status labels |
| `TestingStatCard` | Dashboard metric cards |
| `TestingTable` | Accessible data tables with optional row navigation |
| `FilterBar` | Search/filter grid (`role="search"`) |
| `Panel` | Section panels with `aria-label` |

---

## Related

- [Testing UX Guide](./APZHUB-APZ-TCMS-Testing-UX-Guide.md)
- [Testing Command Catalogue](./APZHUB-APZ-TCMS-Testing-Command-Catalogue.md)
- [Testing Navigation Guide](./APZHUB-APZ-TCMS-Testing-Navigation-Guide.md)
