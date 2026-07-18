# APZTCMS-010 — Completion Report

**Milestone:** APZTCMS-010 — Workbench UI (core views)  
**Product:** APZ TCMS  
**Date:** 2026-07-12  
**Outcome:** **COMPLETE** — presentation-only Testing workbench; typed client + mock transport; module enabled; shell wired  
**Next:** **APZTCMS-011** — AI Assist (advisory) — **awaiting owner approval**

---

## Executive Summary

APZTCMS-010 delivers the Testing workbench as a **presentation-only** UI inside the APZHUB desktop shell. Sixteen module manifests (parent + 15 children) are **enabled** under `services/testing/manifests/`. The UI talks exclusively through `apps/web/lib/testing` — a typed `TestingClient` with an in-process mock transport. No HTTP APIs, no database access, no business logic in views, no Event Bus, no AI, no binary upload, and no reporting engine.

Domain packages remain at APZTCMS-009 versions: contracts **0.6.0**, persistence **0.7.0**, services **0.5.0**. **117** Vitest tests pass across `lib/testing` and `components/testing`. Playwright E2E (`apztcms-010-testing-workbench.spec.ts`) validates shell load, navigation, certification advisory display, responsive viewports, and axe on dashboard — all against the mock client.

---

## Workbench Architecture

```text
Shell → TestingWorkspaceRouter → View components → testing-api → TestingClient → MockTestingClient
```

| Deliverable           | Location                                 |
| --------------------- | ---------------------------------------- |
| Typed client contract | `apps/web/lib/testing/client.ts`         |
| Mock transport        | `apps/web/lib/testing/mock-client.ts`    |
| API wrappers          | `apps/web/lib/testing/testing-api.ts`    |
| Commands              | `apps/web/lib/testing/commands.ts`       |
| View components       | `apps/web/components/testing/`           |
| Shell wiring          | `apps/web/components/workbench-page.tsx` |
| Boundary test         | `testing-architecture-boundary.test.ts`  |

**Boundary enforced:** no imports of `@apzhub/testing-services`, persistence, repositories, or `/api/v1` from UI code.

---

## Navigation

- Activity Bar: **Testing** (`flask-conical`, `testing.view`, order 50)
- Sidebar: 15 sections from Dashboard through Administration — see [Navigation Guide](../architecture/APZHUB-APZ-TCMS-Testing-Navigation-Guide.md)
- Detail routes: plans, executions, certification by ID
- Manifests: parent `testing` + 15 child manifests, all `status: enabled`

---

## Views

Fifteen sidebar views + dashboard implemented — see [View Catalogue](../architecture/APZHUB-APZ-TCMS-Testing-View-Catalogue.md).

| Category      | Views                                          |
| ------------- | ---------------------------------------------- |
| Planning      | Dashboard, Requirements, Plans, Suites, Cases  |
| Execution     | Manual Execution, Automation, Evidence         |
| Quality       | Coverage, Defects, Quality, Release Readiness  |
| Certification | Certification (list + detail with gates/audit) |
| Admin         | Reports (placeholders), Administration         |

---

## Commands

Eleven workbench commands with permission gating — see [Command Catalogue](../architecture/APZHUB-APZ-TCMS-Testing-Command-Catalogue.md).

| Group         | Commands                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| Catalog       | `create_plan`, `create_suite`, `create_case`                                |
| Execution     | `start_execution`, `pause_execution`, `resume_execution`, `submit_evidence` |
| Certification | `review`, `approve`, `reject`, `archive`                                    |

All delegate to `TestingClient` methods via `executeTestingCommand`.

---

## Permissions

UI helpers in `permissions.ts` gate control visibility. Server PermissionService remains authoritative.

| Area          | Key permissions                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Workspace     | `testing.view`                                                                                                                    |
| Read views    | `testing.requirements.read`, `testing.plans.read`, … per sidebar                                                                  |
| Create        | `testing.plans.create`, `testing.suites.create`, `testing.cases.create`                                                           |
| Execute       | `testing.executions.execute`, `evidence.register`                                                                                 |
| Certification | `certification.view`, `certification.review`, `certification.approve`, `certification.reject`, `certification.records.transition` |
| Admin         | `testing.admin`                                                                                                                   |

Vitest covers permission gating; Playwright documents the split (shell/navigation in E2E, permissions in Vitest).

---

## Accessibility

- Semantic headings, tables, breadcrumbs, loading/error roles
- Keyboard-activatable table rows
- Playwright axe: no critical/serious violations on dashboard
- Desktop + mobile viewport E2E
- WCAG AA target per programme standards (015)

See [UX Guide](../architecture/APZHUB-APZ-TCMS-Testing-UX-Guide.md).

---

## Testing

| Suite      | Scope                                                  | Result                     |
| ---------- | ------------------------------------------------------ | -------------------------- |
| Vitest     | `apps/web/lib/testing` + `apps/web/components/testing` | **117** passed (18 files)  |
| Playwright | `apztcms-010-testing-workbench.spec.ts`                | Mock client / no live APIs |
| Boundary   | Architecture import scan                               | **PASS**                   |

Playwright covers: dashboard shell, section navigation, certification advisory + gates, responsive viewports, axe dashboard.

---

## Coverage

| Area                                                   | Lines (scoped) |
| ------------------------------------------------------ | -------------- |
| `apps/web/lib/testing` + `apps/web/components/testing` | **~98.89%**    |

Scoped to APZTCMS-010 presentation layer only. Domain package coverage unchanged from APZTCMS-009.

---

## Quality Gates

| Gate                                     | Result                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| Vitest (010 scope)                       | **PASS** (117)                                                                  |
| Playwright E2E                           | **PASS** (mock client)                                                          |
| Architecture boundary                    | **PASS**                                                                        |
| Domain lint/typecheck (testing packages) | **PASS** (unchanged)                                                            |
| `apps/web` typecheck                     | **FAIL** — pre-existing plane/zammad harness errors (**not introduced by 010**) |
| Business logic in UI                     | **PASS** (none)                                                                 |
| HTTP / DB / Event Bus / AI               | **PASS** (excluded)                                                             |

---

## Technical Debt

1. Mock client not wired to `@apzhub/testing-services` — in-memory only
2. No HTTP API layer (`/api/v1/testing-*`)
3. Catalog create uses fixture plan/suite IDs (`FIXTURE_IDS`) — no entity pickers
4. `apps/web` typecheck fails on pre-existing plane/zammad harness errors unrelated to 010
5. Command Palette manifest commands declared but not fully integrated with UCP (019)
6. Reports and administration are placeholder surfaces

---

## Recommendation for APZTCMS-011

**AI Assist (advisory)** — await explicit owner approval before starting:

1. Governed `AISuggestion` types surfaced in certification and quality views
2. Suggest-only flows — no auto-approve, no override of gate evaluation
3. Wire through Platform Service boundary when HTTP layer exists
4. Keep presentation-only rule; AI orchestration in services not components

Do **not** start APZTCMS-011 without owner approval.

---

## Deliverable checklist

| Item                                            | Status |
| ----------------------------------------------- | ------ |
| Module manifests enabled (parent + 15 children) | ✅     |
| Typed client + mock transport                   | ✅     |
| View components (15 sections + dashboard)       | ✅     |
| Shell wiring (`workbench-page`)                 | ✅     |
| Architecture docs pack (5 guides)               | ✅     |
| Developer Guide APZTCMS-010 section             | ✅     |
| UI Architecture status updated                  | ✅     |
| Vitest 117 tests                                | ✅     |
| Playwright E2E spec                             | ✅     |
| Foundation / backlog / changelog closeout       | ✅     |
| Stop before APZTCMS-011                         | ✅     |
