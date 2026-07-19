# APZ Projects v1.1 — Release Scope

> **Release:** APZ Projects v1.1  
> **Classification:** PRODUCT RELEASE — **Planning / recommendation only**  
> **Related:** [Release Plan](./APZ-PROJECTS-1.1-RELEASE-PLAN.md) · [Implementation Plan](./APZ-PROJECTS-1.1-IMPLEMENTATION-PLAN.md)  
> **Rule:** Recommendation only. Implementation requires explicit Owner Approval of this scope.

---

## 1. Scope selection criteria

Items were scored only on:

| Criterion                       | Weighting guidance                                                             |
| ------------------------------- | ------------------------------------------------------------------------------ |
| Business value                  | Delivery-team daily use of Projects                                            |
| User impact                     | Reduces Phase 1 friction without lying about capabilities                      |
| Technical risk                  | Prefer Workbench-only changes                                                  |
| Platform readiness              | Must already exist on certified HTTP / disk                                    |
| Engineering effort / complexity | Prefer Small–Medium                                                            |
| Documented Owner priorities     | Roadmap: deepen Workbench within Wave 1; polish limitations; keep Plane masked |

**Excluded from 1.1 recommendation** if they require Platform Services redesign, new sprint HTTP, adapter/SDK changes, or Wave 1–exceeding engine capabilities.

---

## 2. Backlog triage (complete)

Sources: [BACKLOG.md](../../products/projects/BACKLOG.md) · [KNOWN-LIMITATIONS.md](../../products/projects/KNOWN-LIMITATIONS.md) · [ROADMAP.md](../../products/projects/ROADMAP.md) · Reference Implementation recommendations · Phase 1 completion gaps · disk UI vs HTTP.

| ID   | Theme / item                                                 | Classification        | Priority | 1.1 disposition                                                                                                          |
| ---- | ------------------------------------------------------------ | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| T-01 | Task status transition / update UI (HTTP exists; UI missing) | Enhancement           | High     | **In scope** (PRJ-1.1-01)                                                                                                |
| T-02 | Task assignee set/clear UI (HTTP exists; UI missing)         | Enhancement           | High     | **In scope** (PRJ-1.1-02)                                                                                                |
| T-03 | Project edit / archive UI (client methods exist; UI thin)    | Enhancement           | High     | **In scope** (PRJ-1.1-03)                                                                                                |
| T-04 | My Work: project selection required                          | Bug (UX) / Limitation | High     | **Partial** — defaults only (PRJ-1.1-04); cross-project aggregation **Out of Scope**                                     |
| T-05 | My Work: raw Assignee ID input                               | Enhancement           | High     | **In scope** via session default + clearer UX (PRJ-1.1-04)                                                               |
| T-06 | Typed client incomplete vs task HTTP surface                 | Technical Debt        | Medium   | **In scope** (PRJ-1.1-07)                                                                                                |
| T-07 | Roadmap presented without due-date honesty                   | Enhancement           | Medium   | **In scope** (PRJ-1.1-05)                                                                                                |
| T-08 | Sprints view is task-derived only                            | Limitation            | Medium   | **Honesty polish** (PRJ-1.1-05); CRUD **Future**                                                                         |
| T-09 | Search empty / index dependency                              | Limitation            | Medium   | **Packaging** (PRJ-1.1-06)                                                                                               |
| T-10 | Product packaging / navigation polish                        | Enhancement           | Medium   | **In scope** (PRJ-1.1-06)                                                                                                |
| T-11 | Search publication UX alignment                              | Enhancement           | Medium   | **In scope** light (PRJ-1.1-06)                                                                                          |
| T-12 | Expanded Playwright for mutations                            | Technical Debt        | Medium   | **In scope** (PRJ-1.1-08)                                                                                                |
| T-13 | Register Workbench view descriptors for nested routes        | Enhancement           | Low      | **Future** (shell coordination; not required for 1.1 value)                                                              |
| T-14 | Dedicated sprint list/CRUD HTTP over ProjectService          | Enhancement           | High*    | **Out of Scope / Future** — requires Platform HTTP expansion (Owner forbade Platform Services redesign for this release) |
| T-15 | Cross-project My Work without `projectId`                    | Enhancement           | High*    | **Out of Scope / Future** — Wave 1 list contract limitation                                                              |
| T-16 | Engine roadmap API (vs due-date ordering)                    | Future                | Low      | **Out of Scope / Future** — ADR + Owner                                                                                  |
| T-17 | Plane analytics / webhooks                                   | Future                | Low      | **Out of Scope** — ADR + Owner + adapter                                                                                 |
| T-18 | Engine branding leakage                                      | Critical (if found)   | Critical | **Regression guard** — not a feature; cert asserts none                                                                  |
| T-19 | Notifications / realtime for Projects                        | Future                | Low      | **Out of Scope**                                                                                                         |
| T-20 | Platform / SDK / adapter redesign                            | Out of Scope          | —        | **Out of Scope**                                                                                                         |
| T-21 | Other products (Time, Support, Law, …)                       | Out of Scope          | —        | **Out of Scope**                                                                                                         |

\*High user desire, but blocked by Owner 1.1 platform constraints or Wave 1 contract.

---

## 3. Recommended in-scope items (detail)

### PRJ-1.1-01 — Task status transition & update in Workbench

| Field                      | Detail                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Problem**                | Users can create tasks (detail view) but cannot change status or fields from Workbench; certified HTTP already exposes task PATCH and `/tasks/{id}/transition`.                 |
| **Business value**         | Completes the daily delivery loop inside APZHUB without opening the engine.                                                                                                     |
| **Dependencies**           | Existing `/api/v1/tasks/[taskId]` · `/transition` · permissions `projects.task.*`                                                                                               |
| **Platform services used** | Project/task path via gateway (unchanged)                                                                                                                                       |
| **Workbench impact**       | Tasks view + project detail tasks tab — actions; typed client methods                                                                                                           |
| **Testing required**       | Unit client · component mutation · Playwright transition happy path · branding assert                                                                                           |
| **Acceptance criteria**    | Authenticated user with permission can transition a task status and see updated status without page-breaking errors; failures show sanitized Platform errors; no engine strings |
| **Complexity**             | **Medium**                                                                                                                                                                      |

---

### PRJ-1.1-02 — Task assignee set / clear in Workbench

| Field                      | Detail                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Problem**                | Assignees HTTP exists (`/tasks/{id}/assignees`); Workbench has no assign UI (My Work requires typing Assignee ID).  |
| **Business value**         | Enables assignment workflows for PMs and engineers in-product.                                                      |
| **Dependencies**           | Existing assignees routes · task list fields                                                                        |
| **Platform services used** | Task assign path via gateway (unchanged)                                                                            |
| **Workbench impact**       | Task row/detail actions; My Work can deep-link or reflect assignee filter                                           |
| **Testing required**       | Client + Playwright assign/clear · permission denied path                                                           |
| **Acceptance criteria**    | User can set and clear assignee on a task via UI; list/My Work refresh shows change when filtered; errors sanitized |
| **Complexity**             | **Medium**                                                                                                          |

---

### PRJ-1.1-03 — Project edit & archive in Workbench

| Field                      | Detail                                                                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Problem**                | `updateProject` / `archiveProject` exist in `projects-api.ts` but Workbench lacks edit/archive UX.                                                                    |
| **Business value**         | Lifecycle management without leaving APZHUB.                                                                                                                          |
| **Dependencies**           | Existing `/api/v1/projects/{id}` PATCH/DELETE · `projects.manage`                                                                                                     |
| **Platform services used** | ProjectService via gateway (unchanged)                                                                                                                                |
| **Workbench impact**       | Detail overview + optional list actions                                                                                                                               |
| **Testing required**       | Unit · Playwright edit name · archive confirmation                                                                                                                    |
| **Acceptance criteria**    | Permitted user can edit project name/description/status fields supported by API and archive a project; list updates; unauthorized users see no action or denied state |
| **Complexity**             | **Small**                                                                                                                                                             |

---

### PRJ-1.1-04 — My Work usability defaults

| Field                      | Detail                                                                                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Problem**                | My Work requires project selection + manual Assignee ID; high friction for the primary personal view.                                                                                                                |
| **Business value**         | Faster personal task triage within Wave 1 constraints.                                                                                                                                                               |
| **Dependencies**           | Existing `listTasks({ projectId, assigneeId })` · session identity from platform auth (read-only) · optional last-project persistence (session/local; Preference Service only if already available without redesign) |
| **Platform services used** | Tasks + Projects HTTP; Auth session (no IAM redesign)                                                                                                                                                                |
| **Workbench impact**       | `projects-my-work-view.tsx` defaults and copy                                                                                                                                                                        |
| **Testing required**       | Component tests for defaults; Playwright with mocked session/API                                                                                                                                                     |
| **Acceptance criteria**    | On load, assignee defaults to current user id when available; last selected project restored when available; user can still override; **no claim** of cross-project aggregation                                      |
| **Complexity**             | **Small**                                                                                                                                                                                                            |

---

### PRJ-1.1-05 — Roadmap & Sprint honesty labels

| Field                      | Detail                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Problem**                | Roadmap is due-date ordering; Sprints are task-derived — risk of users assuming full sprint/roadmap engines.                         |
| **Business value**         | Trust / honesty rule; fewer support misconceptions.                                                                                  |
| **Dependencies**           | None beyond UI copy                                                                                                                  |
| **Platform services used** | None new                                                                                                                             |
| **Workbench impact**       | Roadmap + Sprints (+ detail tabs) descriptions                                                                                       |
| **Testing required**       | Playwright asserts honesty strings present; no engine names                                                                          |
| **Acceptance criteria**    | Views state clearly that roadmap = tasks with due dates; sprints = grouping by task sprint field; KNOWN-LIMITATIONS remains accurate |
| **Complexity**             | **Small**                                                                                                                            |

---

### PRJ-1.1-06 — Search & empty-state packaging polish

| Field                      | Detail                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Problem**                | Search depends on index population; empty states are thin; packaging polish called out in backlog/roadmap.                      |
| **Business value**         | Clearer ops/user guidance; professional Production polish.                                                                      |
| **Dependencies**           | Existing search HTTP · health view                                                                                              |
| **Platform services used** | Platform Search (unchanged)                                                                                                     |
| **Workbench impact**       | Search empty/error copy; links to Health; minor nav/dashboard consistency                                                       |
| **Testing required**       | Playwright empty search path; snapshot not required                                                                             |
| **Acceptance criteria**    | Empty search explains index dependency and points to Health; dashboard/list empty states consistent with Design System patterns |
| **Complexity**             | **Small**                                                                                                                       |

---

### PRJ-1.1-07 — Typed client coverage for existing task HTTP

| Field                      | Detail                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Problem**                | `projects-api.ts` omits wrappers for task get/update/transition/assignees/sprint set-clear though routes exist. |
| **Business value**         | Enables 01/02 safely; reduces ad-hoc `fetch` in views.                                                          |
| **Dependencies**           | Existing route handlers under `apps/web/app/api/v1/tasks/**`                                                    |
| **Platform services used** | Unchanged                                                                                                       |
| **Workbench impact**       | `lib/projects/*` only (+ consumers)                                                                             |
| **Testing required**       | Unit tests for new client methods                                                                               |
| **Acceptance criteria**    | Client exports typed methods for transition, update, assignees; views use client only; boundary test still PASS |
| **Complexity**             | **Small**                                                                                                       |

---

### PRJ-1.1-08 — Expanded UI certification

| Field                      | Detail                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------- |
| **Problem**                | Phase 1 cert covers list/detail/search/health; mutations need regression safety.        |
| **Business value**         | Protects Production Ready baseline for 1.1.                                             |
| **Dependencies**           | PRJ-1.1-01…03                                                                           |
| **Platform services used** | Mocked Platform API in Playwright (same pattern as Phase 1)                             |
| **Workbench impact**       | `testing/playwright/e2e/apzhub-projects-1.1-*.spec.ts` (+ helpers)                      |
| **Testing required**       | Itself                                                                                  |
| **Acceptance criteria**    | New specs PASS in CI filter; Phase 1 specs still PASS; engine branding asserts retained |
| **Complexity**             | **Medium**                                                                              |

---

## 4. Explicitly out of scope (1.1)

| Item                                           | Reason                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Sprint list/CRUD HTTP (`/api/v1/.../sprints`)  | Requires Platform HTTP / service exposure expansion — Owner: no Platform Services redesign |
| Cross-project My Work without `projectId`      | Wave 1 task list contract limitation                                                       |
| Plane adapter / Integration SDK changes        | Owner hard exclusion                                                                       |
| Platform Services redesign                     | Owner hard exclusion                                                                       |
| Engine analytics, webhooks, native roadmap API | Beyond Wave 1; ADR + Owner                                                                 |
| Notifications, AI, other products              | Outside product release                                                                    |
| Preference Service / IAM redesign              | Not required; use session/local only                                                       |
| Architecture / monorepo restructuring          | Owner exclusion                                                                            |

---

## 5. Residual limitations after recommended 1.1

Even if all in-scope items ship, the following **remain** (honesty rule):

- No dedicated sprint entity HTTP UI (task-derived sprints)
- Roadmap remains due-date task ordering
- My Work remains project-scoped
- Search depends on Platform Search index population
- Connector ops remain platform-owned (Health view)
- Engine branding must remain masked

---

## 6. Owner decision needed

Approve one of:

1. **Recommended scope** PRJ-1.1-01…08 as above
2. **Reduced scope** (Owner lists IDs)
3. **Expanded scope** (Owner must explicitly authorise any Out-of-Scope item, especially sprint HTTP)

**Until then: no implementation.**
