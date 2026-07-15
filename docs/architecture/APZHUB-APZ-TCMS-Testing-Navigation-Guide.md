# APZ TCMS — Testing Navigation Guide

**Product:** APZ TCMS  
**Module:** Testing (`testing`)  
**Milestone:** APZTCMS-010  
**Authority:** [017](../017-navigation-framework-workspace-navigation-architecture.md) · [UI Architecture](./APZHUB-APZ-TCMS-UI-Architecture.md) · [Permission Catalogue](./APZHUB-APZ-TCMS-Permission-Catalogue.md)

---

## Activity Bar

| Property | Value |
| -------- | ----- |
| **Label** | Testing |
| **Icon** | `flask-conical` (Lucide) |
| **Order** | 50 |
| **Route** | `/workspace/testing` |
| **Permission** | `testing.view` |
| **Manifest** | `services/testing/manifests/testing/module.yaml` |

The Activity Bar entry is visible only when the user holds `testing.view` (or a matching wildcard). Server-side PermissionService remains authoritative — UI hiding is not security.

Certification is a **sidebar view within Testing**, not a separate Activity Bar entry.

---

## Sidebar sections

All sidebar items are declared on the parent `testing` manifest and mirrored by child manifests under `services/testing/manifests/testing-*/module.yaml`.

| Sidebar ID | Label | Route | Permission | Child manifest |
| ---------- | ----- | ----- | ---------- | -------------- |
| `testing.dashboard` | Dashboard | `/workspace/testing` | `testing.view` | `testing-dashboard` |
| `testing.requirements` | Requirements | `/workspace/testing/requirements` | `testing.requirements.read` | `testing-requirements` |
| `testing.plans` | Plans | `/workspace/testing/plans` | `testing.plans.read` | `testing-plans` |
| `testing.suites` | Suites | `/workspace/testing/suites` | `testing.suites.read` | `testing-suites` |
| `testing.cases` | Cases | `/workspace/testing/cases` | `testing.cases.read` | `testing-cases` |
| `testing.executions` | Manual Execution | `/workspace/testing/executions` | `testing.executions.read` | `testing-executions` |
| `testing.automation` | Automation | `/workspace/testing/automation` | `automation.view` | `testing-automation` |
| `testing.evidence` | Evidence | `/workspace/testing/evidence` | `evidence.read` | `testing-evidence` |
| `testing.coverage` | Coverage | `/workspace/testing/coverage` | `coverage.view` | `testing-coverage` |
| `testing.defects` | Defects | `/workspace/testing/defects` | `defects.view` | `testing-defects` |
| `testing.quality` | Quality | `/workspace/testing/quality` | `quality.view` | `testing-quality` |
| `testing.certification` | Certification | `/workspace/testing/certification` | `certification.view` | `testing-certification` |
| `testing.release-readiness` | Release Readiness | `/workspace/testing/release-readiness` | `release.view` | `testing-release-readiness` |
| `testing.reports` | Reports | `/workspace/testing/reports` | `reporting.view` | `testing-reports` |
| `testing.administration` | Administration | `/workspace/testing/administration` | `testing.admin` | `testing-administration` |

---

## Detail routes

The workspace router resolves additional detail paths:

| Pattern | View | Example |
| ------- | ---- | ------- |
| `/workspace/testing/plans/:planId` | Plan detail | `/workspace/testing/plans/plan_aaa…1` |
| `/workspace/testing/executions/:executionId` | Execution detail | `/workspace/testing/executions/exec_aaa…4` |
| `/workspace/testing/certification/:certificationId` | Certification detail | `/workspace/testing/certification/cert_aaa…7` |

Route resolution is implemented in `apps/web/lib/testing/routes.ts` (`resolveTestingRoute`).

---

## Permission-driven navigation flow

```text
PermissionService (server — authoritative)
        ↓
Module Registry (testing enabled + child manifests)
        ↓
Activity Bar filter (testing.view?)
        ↓
Sidebar filter (per-view read permissions)
        ↓
View render (TestingWorkspaceRouter)
        ↓
Action controls filter (create / execute / approve permissions)
```

### Wildcard support (UI helpers)

`permissions.ts` treats these as granting access for control visibility:

- `*`
- `testing.*`
- `{namespace}.*` (e.g. `certification.*`)
- `{namespace}.{segment}.*` (e.g. `testing.plans.*`)

E2E and dev sessions may pass wildcard permission sets; production must use server-evaluated grants.

---

## Palette commands (manifest)

Declared on parent manifest for future Command Palette (019) integration:

| Command ID | Label | Permission |
| ---------- | ----- | ---------- |
| `testing.open` | Open Testing | `testing.view` |
| `testing.plan.create` | Create Plan | `testing.plans.create` |
| `testing.suite.create` | Create Suite | `testing.suites.create` |
| `testing.case.create` | Create Case | `testing.cases.create` |
| `testing.execution.start` | Start Execution | `testing.executions.execute` |
| `testing.certification.review` | Review Certification | `certification.review` |

Workbench command execution in APZTCMS-010 uses the in-view `TestingCommandsPanel` and `executeTestingCommand` — see [Command Catalogue](./APZHUB-APZ-TCMS-Testing-Command-Catalogue.md).

---

## Deep links

Entity URLs are resolved client-side and permission-revalidated on open per [017](../017-navigation-framework-workspace-navigation-architecture.md). Unknown routes render an empty-state fallback inside the Testing workspace shell.

---

## Related

- [Testing Workbench Architecture](./APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md)
- [Testing View Catalogue](./APZHUB-APZ-TCMS-Testing-View-Catalogue.md)
- [Module Registration Guide](./APZHUB-APZ-TCMS-Module-Registration-Guide.md)
