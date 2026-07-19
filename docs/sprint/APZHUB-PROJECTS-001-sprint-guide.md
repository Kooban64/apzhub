# APZHUB-PROJECTS-001 — Sprint Guide

> **Programme:** APZHUB-PROJECTS-001  
> **Title:** APZ Projects — Workbench Product Implementation (Phase 1)  
> **Classification:** Product Engineering · Implementation  
> **Status:** Owner-approved — implementation authorised  
> **Product:** APZ Projects ([Definition Pack](../products/projects/README.md))  
> **Prerequisite:** PRODUCTS-003 — Implementation Ready · PRODUCTS-002 ACCEPTED · QA-002 PRODUCTION READY

---

## Objective

Deliver the first production-ready APZ Projects Workbench experience that exposes **existing certified Wave 1 Plane platform capabilities** through APZHUB Workbench UI. Build a **product**. Do **not** redesign the platform.

---

## In scope

- Projects Workbench module (enable + wire)
- Navigation (Activity Bar + Sidebar)
- Workbench views: dashboard, list, project detail, tasks, my work, backlog, sprints (task-derived), roadmap (due-date view), search, health/diagnostics
- Project listing + project details via `/api/v1/projects*`
- Task views via `/api/v1/tasks*`
- Search via existing Platform Search (`/api/v1/search/*`, product filter `projects`)
- Provisioning / governance consumption (module enablement; existing platform surfaces)
- Event Bus: mutations via Platform Services (existing event publication — no redesign)
- Product audit / diagnostics / health views (platform health + search diagnostics scoped to product)
- Product documentation, tests, UI certification, completion + acceptance reports

## Out of scope

- Plane adapter changes · Integration SDK changes · Platform Services redesign
- Search / Event Bus / Provisioning / Workflow redesign
- New Plane capabilities outside certified Wave 1
- Kimai · Analytics · Documents · Support · Billing · Licensing · AI Assist

If Wave 1–exceeding Plane capability is required: **STOP**, raise ADR, await Owner.

---

## Architecture

```text
Workbench UI (apps/web/components/projects)
  → /api/v1/projects* · /api/v1/tasks* · /api/v1/workspaces · /api/v1/search/* · /api/v1/health
  → Auth → Authz → Validation
  → PlatformServiceGateway (project-service / task-service)
  → Plane providers → @apzhub/integration-plane (unchanged)
```

**Forbidden in UI:** `@apzhub/integration-plane`, `@apzhub/platform-services`, gateway imports, engine branding.

---

## Stories (themes — no invented engine IDs)

| #   | Theme                             | Outcome                                                                            |
| --- | --------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | Sprint guide + programme tracking | This document; KF milestone updated                                                |
| 2   | Module enablement                 | `module.status: enabled`; nav contributions live                                   |
| 3   | Typed client + routes             | `lib/projects/*` — Platform HTTP only                                              |
| 4   | Workbench router + views          | Dashboard, list, detail, tasks, my-work, backlog, sprints, roadmap, search, health |
| 5   | Shell integration                 | `workbench-page.tsx` wires `ProjectsWorkspaceRouter`                               |
| 6   | Boundary + unit tests             | Vitest + architecture boundary                                                     |
| 7   | UI certification                  | Playwright E2E + cert suite                                                        |
| 8   | Product docs                      | Pack + portfolio maturity → In Development / Production-ready Phase 1              |
| 9   | Quality gates                     | typecheck, lint, tests, audit                                                      |
| 10  | Completion + Acceptance reports   | Await Owner Acceptance                                                             |

---

## Quality gates (before Completion Report)

- [ ] Repository typecheck PASS
- [ ] Repository lint PASS
- [ ] Repository tests PASS
- [ ] Product tests PASS
- [ ] Product UI tests PASS
- [ ] Product certification PASS
- [ ] Repository audit PASS
- [ ] Documentation PASS

No `ts-ignore`, `eslint-disable`, placeholders, stubs, temporary code, or production `any`.

---

## Deliverables

| Artefact          | Path                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| Sprint Guide      | `docs/sprint/APZHUB-PROJECTS-001-sprint-guide.md`                                       |
| Workbench UI      | `apps/web/components/projects/*` · `apps/web/lib/projects/*`                            |
| Module manifest   | `services/projects/manifests/projects/module.yaml`                                      |
| Playwright        | `testing/playwright/e2e/apzhub-projects-001-*.spec.ts`                                  |
| Completion Report | `docs/sprint/APZHUB-PROJECTS-001-completion-report.md`                                  |
| Acceptance Report | `docs/foundation/completion-reports/APZHUB-PROJECTS-001-programme-acceptance-report.md` |

---

## Stop

After Acceptance Report: **await explicit Owner Acceptance**. Do not recommend another programme.
