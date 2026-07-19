# APZ Projects v1.1 — Release Plan

> **Release:** APZ Projects v1.1  
> **Classification:** PRODUCT RELEASE — **Planning only** (no implementation authorised by this document)  
> **Baseline:** APZHUB-PROJECTS-001 Phase 1 — **Production** (with limitations)  
> **Operating model:** [RELEASE-MANAGEMENT-STANDARD](../../operations/RELEASE-MANAGEMENT-STANDARD.md) · [RELEASE-CALENDAR](../RELEASE-CALENDAR.md) · [RELEASE-NAMING-STANDARD](../RELEASE-NAMING-STANDARD.md)  
> **Related:** [Scope](./APZ-PROJECTS-1.1-SCOPE.md) · [Implementation Plan](./APZ-PROJECTS-1.1-IMPLEMENTATION-PLAN.md)  
> **Authority:** Repository evidence — AI-MANIFEST · Product Pack · Reference Implementation · disk Workbench + Platform HTTP  
> **Status:** Awaiting **Owner Approval of recommended scope** before implementation

---

## 1. Owner decision context

- Engineering Foundation **COMPLETE**
- Engineering Operating Model **ACTIVE**
- Repository governance **COMPLETE** (repo-wide governance programmes CLOSED)
- This is the **first Product Release** under Operational Delivery

---

## 2. Objective

Plan (then, only after Owner Approval, implement) **APZ Projects Release 1.1** to extend the existing Production Workbench.

**Hard constraints (Owner):**

| Constraint        | Rule                                                  |
| ----------------- | ----------------------------------------------------- |
| Platform          | No redesign                                           |
| Integration SDK   | No redesign / no public contract change               |
| Platform Services | No redesign                                           |
| Plane adapter     | No modification                                       |
| Capabilities      | Consume existing certified platform capabilities only |

---

## 3. Current baseline (disk)

| Item                          | Evidence                                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Maturity                      | **Production** (Phase 1; documented limitations)                                                                             |
| Workbench                     | `apps/web/components/projects/*` · `apps/web/lib/projects/*`                                                                 |
| Module                        | `services/projects/manifests/projects/module.yaml` — `enabled`                                                               |
| HTTP consumed                 | `/api/v1/projects*`, `/api/v1/tasks*`, `/api/v1/workspaces`, `/api/v1/search/*`, `/api/v1/health`                            |
| Task mutations on disk (HTTP) | PATCH/DELETE task · transition · assignees · sprint set/clear · labels · parent — **not yet wrapped in Workbench client/UI** |
| Sprint list/CRUD HTTP         | **Absent** — no `/api/v1/.../sprints` routes; Phase 1 groups by `task.sprintId`                                              |
| Plane adapter                 | `@apzhub/integration-plane` **0.6.0** — frozen for this release                                                              |
| Integration SDK               | **1.0.0** — frozen                                                                                                           |
| Quality                       | QA-002 **PRODUCTION READY**                                                                                                  |

Sources: [KNOWN-LIMITATIONS](../../products/projects/KNOWN-LIMITATIONS.md) · [BACKLOG](../../products/projects/BACKLOG.md) · [ROADMAP](../../products/projects/ROADMAP.md) · [Reference Implementation](../../products/APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md) · [PROJECTS-001 Completion](../../sprint/APZHUB-PROJECTS-001-completion-report.md)

---

## 4. Release themes (recommended)

Recommended 1.1 is a **Workbench depth** release on existing HTTP:

1. **Task lifecycle in UI** — use existing task HTTP (update, status transition, assign) from Workbench
2. **Project maintenance in UI** — use existing project PATCH/DELETE client methods in Workbench
3. **My Work usability** — reduce friction within Wave 1 `projectId` constraint (session default, persistence)
4. **Honesty & packaging** — clearer roadmap/sprint semantics; navigation/empty-state polish
5. **Certification hardening** — expand Playwright/unit coverage for new mutations

**Deferred to later releases / ADR:** sprint list/CRUD HTTP, cross-project My Work without `projectId`, Plane analytics/webhooks, engine roadmap API.

Full triage and item specs: [APZ-PROJECTS-1.1-SCOPE.md](./APZ-PROJECTS-1.1-SCOPE.md).

---

## 5. Prioritised backlog (summary)

| Priority | ID         | Item                                           | Class                   | Complexity |
| -------- | ---------- | ---------------------------------------------- | ----------------------- | ---------- |
| P0       | PRJ-1.1-01 | Task status transition + update in Workbench   | High · Enhancement      | Medium     |
| P0       | PRJ-1.1-02 | Task assignee set/clear in Workbench           | High · Enhancement      | Medium     |
| P1       | PRJ-1.1-03 | Project edit + archive in Workbench            | High · Enhancement      | Small      |
| P1       | PRJ-1.1-04 | My Work defaults (session user + last project) | High · Enhancement      | Small      |
| P2       | PRJ-1.1-05 | Roadmap / Sprint UX honesty labels             | Medium · Enhancement    | Small      |
| P2       | PRJ-1.1-06 | Search & empty-state packaging polish          | Medium · Enhancement    | Small      |
| P2       | PRJ-1.1-07 | Client wrappers for existing task HTTP         | Medium · Technical Debt | Small      |
| P3       | PRJ-1.1-08 | Expanded UI certification for 1.1 mutations    | Medium · Technical Debt | Medium     |

Out-of-scope / Future items listed in Scope document.

---

## 6. Risk assessment

| Risk                                                                | Likelihood | Impact   | Mitigation                                                            |
| ------------------------------------------------------------------- | ---------- | -------- | --------------------------------------------------------------------- |
| Scope creep into sprint HTTP / Platform Services                    | Medium     | High     | Hard STOP in Scope; Owner gate before any `/sprints` route work       |
| Wave 1 task transition/assign behaviour differs from UI assumptions | Medium     | Medium   | Contract tests against existing routes; document residual limitations |
| Search empty results confuse users (index not populated)            | Medium     | Low      | Honesty copy; health/diagnostics link retained                        |
| Regression of Phase 1 cert                                          | Low        | High     | Keep `apzhub-projects-001-*` green; add `apzhub-projects-1.1-*` specs |
| Preference persistence unavailable / inconsistent                   | Low        | Low      | Fallback to local session state only; no Preference Service redesign  |
| Accidental adapter/SDK touch                                        | Low        | Critical | Boundary tests; PR checklist; freeze table                            |

**Overall technical risk for recommended scope:** **Low–Medium** (UI + typed client only on existing HTTP).

---

## 7. Testing strategy

| Layer        | Strategy                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Unit         | Extend `lib/projects` API client tests; route tests unchanged unless new paths                    |
| Boundary     | Keep `projects-architecture-boundary.test.ts` — forbid adapter/SDK/gateway imports                |
| Component    | Router + mutation happy/error paths with mocked `/api/v1`                                         |
| Playwright   | Retain Phase 1 suite; add `apzhub-projects-1.1-*.spec.ts` for transition, assign, project edit    |
| Repo gates   | typecheck · lint · targeted Vitest · Playwright product filters · no production `any` / stubs     |
| Architecture | Diff confined to `apps/web` Projects Workbench (+ docs); packages/integrations/services untouched |

Aligns with [DEFINITION-OF-DONE](../../operations/DEFINITION-OF-DONE.md) and [PRODUCT-CERTIFICATION-STANDARD](../../products/PRODUCT-CERTIFICATION-STANDARD.md).

---

## 8. Release acceptance criteria

Release 1.1 may be Owner-accepted only when:

1. Owner-approved scope items **PRJ-1.1-01…08** (or Owner-reduced subset) implemented — **no out-of-scope platform/adapter work**
2. Repository typecheck PASS · lint PASS · tests PASS (repo + product)
3. Playwright Phase 1 suite still PASS; 1.1 cert suite PASS
4. Architecture boundary PASS; engine branding still masked
5. `@apzhub/integration-plane` **0.6.0**, Integration SDK **1.0.0**, Platform Services packages — **unchanged**
6. [KNOWN-LIMITATIONS](../../products/projects/KNOWN-LIMITATIONS.md) updated for residual gaps
7. Product `RELEASES.md` (or release note under `docs/releases/`) records **APZ Projects 1.1.0**
8. Completion + Acceptance evidence filed; KF status updated
9. QA-002 **PRODUCTION READY** baseline held

---

## 9. Versioning & naming

| Artefact                              | Proposed                                                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Product version                       | **APZ Projects 1.1.0**                                                                                                                   |
| Git tag (on production cutover)       | `v` + platform/workspace policy per [RELEASE-NAMING-STANDARD](../RELEASE-NAMING-STANDARD.md); product label recorded in release evidence |
| Branch (when implementation approved) | `feature/apz-projects-1.1-<slug>` or `release/…` per branching standard                                                                  |
| RC                                    | `1.1.0-rc.N` if stabilisation branch used                                                                                                |

---

## 10. Definition of Ready (this release)

| Criterion                            | Status for planning                            |
| ------------------------------------ | ---------------------------------------------- |
| Approved vision                      | Met — product VISION + Owner release objective |
| Architecture                         | Met — no redesign; Workbench → Platform HTTP   |
| Dependencies available               | Met — Wave 1 HTTP on disk                      |
| Acceptance criteria                  | Met — this plan §8 + Scope item ACs            |
| Owner Approval of **implementation** | **Not met** — STOP until Owner Approves scope  |
| Repository quality                   | Met — PRODUCTION READY                         |
| In/out of scope frozen               | Proposed in Scope — freeze on Owner Approval   |

---

## 11. Stop condition

**STOP.** Do **not** implement Release 1.1 until the Owner explicitly Approves the recommended scope (or a revised Owner scope).

This planning delivery does not modify production code.
