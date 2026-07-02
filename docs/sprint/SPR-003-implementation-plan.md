# SPR-003 — Implementation Plan

> **Sprint:** SPR-003 — Workbench Framework  
> **Status:** **Planning — no implementation until approved**  
> **Process:** Phased review gate per ADR-0017  
> **Guide:** [SPR-003-workbench-framework.md](./SPR-003-workbench-framework.md)  
> **Architecture:** [workbench-framework.md](../architecture/workbench-framework.md) · [workbench-manager.md](../architecture/workbench-manager.md)

---

## Executive summary

Sprint 003 delivers the **Workbench Framework** in **nine phases**, organised around the Workbench Manager hierarchy. Each phase has exit criteria before the next begins. Estimated effort: **20–28 engineering days**.

```text
Workbench Framework
        │
        ▼
Workbench Manager
        │
        ├── Layout Manager
        ├── Panel Manager
        ├── View Manager
        ├── Navigation Manager
        ├── Workspace Manager
        ├── Session Manager
        ├── Dock Manager
        ├── Context Manager
        └── Selection Manager
```

### Phase overview

```text
Phase 0  ADRs, Workbench Request model & architecture gate
Phase 1  Package scaffold + Workbench Manager + Layout/Panel managers
Phase 2  Navigation Manager + manifest nav extensions
Phase 3  Registry-driven Activity Bar
Phase 4  Workspace Manager + View Manager
Phase 5  Dock Manager + Session Manager
Phase 6  Context Manager + Selection Manager
Phase 7  Workbench Request API + permission-filtered shell
Phase 8  Testing, documentation & closeout
```

---

## Subsystem responsibilities (planning reference)

Full definitions: [workbench-manager.md](../architecture/workbench-manager.md).

| Subsystem              | Core responsibility                               | Key requests handled                 |
| ---------------------- | ------------------------------------------------- | ------------------------------------ |
| **Workbench Manager**  | Route requests; coordinate state; permission gate | All Workbench Requests               |
| **Layout Manager**     | Shell region geometry and responsive composition  | _(internal)_                         |
| **Panel Manager**      | Panel visibility, collapse, resize                | `openPanel`, `closePanel`            |
| **View Manager**       | View/tab lifecycle in workspace                   | `openView`, `closeView`, `focusView` |
| **Navigation Manager** | Activity Bar, sidebar, deep links                 | `revealNavigationItem`               |
| **Workspace Manager**  | Active workspace context                          | _(internal; triggered by nav)_       |
| **Session Manager**    | Session capture, restore, persistence hooks       | _(internal)_                         |
| **Dock Manager**       | Panel dock geometry, split ratios                 | _(internal)_                         |
| **Context Manager**    | Context panel content orchestration               | `setContext`                         |
| **Selection Manager**  | Platform selection context                        | `setSelection`                       |

### Capability integration model

```text
Capability
    │  publishes Workbench Request
    ▼
Workbench Manager
    │  delegates to sub-manager
    ▼
Sub-manager → UI Update
```

---

## Phase 0 — ADRs & Architecture Gate

> **Status:** Complete — awaiting owner approval for Phase 1

### Objective

Lock architectural decisions before code. Approve Workbench Framework terminology, package boundary, and Workbench Request model.

### Tasks

| #   | Task                               | Description                                                               | ADR                                                          |
| --- | ---------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 0.1 | ADR: Workbench Framework package   | `@apzhub/workbench-framework` vs extend `@apzhub/workspace`               | [ADR-0019](../adr/ADR-0019-workbench-framework-package.md)   |
| 0.2 | ADR: Workbench Request model       | Typed in-process Workbench Request Bus                                    | [ADR-0020](../adr/ADR-0020-workbench-request-transport.md)   |
| 0.3 | ADR: Session persistence strategy  | localStorage + SessionStore abstraction; hybrid later                     | [ADR-0021](../adr/ADR-0021-workbench-session-persistence.md) |
| 0.4 | ADR: Navigation manifest extension | Optional `workbench` block on envelope                                    | [ADR-0022](../adr/ADR-0022-navigation-manifest-extension.md) |
| 0.5 | ADR: Permission adapter            | WorkbenchPermissionAdapter + allow-all dev impl                           | [ADR-0023](../adr/ADR-0023-workbench-permission-adapter.md)  |
| 0.6 | Architecture docs                  | `workbench-framework.md` and `workbench-manager.md`                       | ✅ Complete (refinement)                                     |
| 0.7 | Phase 0 report                     | [SPR-003-phase-0-adr-report.md](../reviews/SPR-003-phase-0-adr-report.md) | ✅ Complete                                                  |

### Exit criteria

- [x] ADRs approved by architecture review
- [x] Package boundary decision recorded
- [x] Workbench Request types defined
- [x] Nav manifest extension schema designed
- [x] Session persistence strategy decided
- [x] Permission integration approach decided
- [ ] Owner approves Phase 1 start

---

## Phase 1 — Package Scaffold, Workbench Manager, Layout & Panel Engines

> **Status:** Complete — see [Phase 1 report](../sprint/SPR-003-phase-1-report.md)

### Objective

Create Workbench Framework package with Workbench Manager, Request Bus, Layout Engine scaffold, and Panel Engine scaffold.

### Subsystems delivered

| Subsystem         | Deliverable                                                         |
| ----------------- | ------------------------------------------------------------------- |
| Workbench Manager | Request router; engine registry; state aggregation; permission gate |
| Request Bus       | `publish()` API; capability context injection                       |
| Layout Engine     | Default shell regions; region visibility coordination               |
| Panel Engine      | `openPanel` / `closePanel`; sidebar and context geometry            |
| Scaffold engines  | View, Navigation, Session, Dock, Context, Selection — state only    |

### Exit criteria

- [x] Package builds and typechecks
- [x] Workbench Manager routes to Layout/Panel engines
- [x] Request Bus is sole capability entry point
- [x] ≥ 80% coverage for workbench-framework package
- [x] Quality gates pass
- [x] Phase 1 report produced
- [x] Architecture review approves Phase 2

---

## Phase 2 — Navigation Engine & Manifest Nav Extensions

> **Status:** Complete — see [Phase 2 report](../sprint/SPR-003-phase-2-report.md)

### Objective

Extend manifest schema for navigation metadata; implement manifest-driven Navigation Engine.

### Subsystems delivered

| Subsystem          | Deliverable                                                    |
| ------------------ | -------------------------------------------------------------- |
| Manifest Engine    | Optional `workbench.navigation` block (ADR-0022)               |
| Platform Registry  | `getWorkbenchNavigationContributions()`                        |
| Navigation Engine  | Ordering, grouping, tree, permissions, diagnostics             |
| Scaffold manifests | platform-home, platform-administration, platform-home-overview |

### Exit criteria

- [x] Nav metadata validates through Manifest Engine
- [x] Navigation Engine returns items from contributions only
- [x] No breaking change to existing manifests (nav optional)
- [x] Permission filtering via WorkbenchPermissionAdapter
- [x] Phase 2 report produced
- [ ] Architecture review approves Phase 3

---

## Phase 3 — Registry-Driven Activity Bar

### Objective

Replace static Activity Bar with registry-driven items via Navigation Manager.

### Subsystems enhanced

| Subsystem          | Enhancement                                                  |
| ------------------ | ------------------------------------------------------------ |
| Navigation Manager | Activity Bar adapter; server hydration; deep link resolution |

### Tasks

| #   | Task                 | Description                                  |
| --- | -------------------- | -------------------------------------------- |
| 3.1 | Activity Bar adapter | Map nav items → Activity Bar UI model        |
| 3.2 | Server hydration     | Server component loads registry nav items    |
| 3.3 | Client Activity Bar  | Render dynamic items; preserve keyboard/a11y |
| 3.4 | Home fallback        | Default Home workspace when no items match   |

### Exit criteria

- [ ] Activity Bar shows registry-driven items
- [ ] TD-017 Activity Bar manifest utilised in navigation
- [ ] E2E: Activity Bar renders ≥ 1 dynamic item

---

## Phase 4 — Workspace Manager & View Manager

### Objective

Implement workspace context switching and view/tab lifecycle in workspace region.

### Subsystems delivered

| Subsystem         | Deliverable                                             |
| ----------------- | ------------------------------------------------------- |
| Workspace Manager | `setActiveWorkspace()`, workspace scope for sidebar/nav |
| View Manager      | View descriptors; tab open/close/pin/focus; tab bar UI  |

### Tasks

| #   | Task                    | Description                                        |
| --- | ----------------------- | -------------------------------------------------- |
| 4.1 | Workspace Manager       | Active workspace state; React context provider     |
| 4.2 | Sidebar scope           | Sidebar content keyed to active workspace          |
| 4.3 | View Manager            | Register view descriptors; mount/unmount lifecycle |
| 4.4 | View manifest extension | Optional `view` block on capabilities              |
| 4.5 | Tab bar UI              | Workspace tab strip component                      |
| 4.6 | Scaffold demo view      | Framework hello-view (not business)                |

### Exit criteria

- [ ] User can switch workspace via Activity Bar
- [ ] At least one registry-registered view opens in a tab
- [ ] Tab close and focus work
- [ ] View manifest validates through Manifest Engine

---

## Phase 5 — Dock Manager & Session Manager

### Objective

Panel dock geometry persistence and session payload model with in-memory restore.

### Subsystems delivered

| Subsystem       | Deliverable                                                                |
| --------------- | -------------------------------------------------------------------------- |
| Dock Manager    | Split ratios, dock state; delegates persistence to Session Manager         |
| Session Manager | Capture/restore tabs, panel sizes, active workspace; persistence interface |

### Tasks

| #   | Task                  | Description                                 |
| --- | --------------------- | ------------------------------------------- |
| 5.1 | Dock Manager          | Panel dock geometry; split ratio state      |
| 5.2 | Session schema        | Types per Document 018 subset               |
| 5.3 | Session Manager       | Capture/restore; in-memory store            |
| 5.4 | Restore on login      | Rehydrate session; re-validate permissions  |
| 5.5 | Persistence interface | Extension point for future localStorage/API |

### Exit criteria

- [ ] Session restores tabs and panel state within same browser session
- [ ] Unauthorised tabs dropped on restore
- [ ] Dock geometry persisted via Session Manager
- [ ] Persistence interface documented; no server write

---

## Phase 6 — Context Manager & Selection Manager

### Objective

Context panel orchestration and platform-wide selection context.

### Subsystems delivered

| Subsystem         | Deliverable                                                   |
| ----------------- | ------------------------------------------------------------- |
| Context Manager   | Context panel tabs; active context key; provider registration |
| Selection Manager | Selection model; events to Context Manager                    |

### Tasks

| #   | Task                       | Description                                   |
| --- | -------------------------- | --------------------------------------------- |
| 6.1 | Context Manager            | Context panel tab model; `setContext` handler |
| 6.2 | Selection Manager          | Selection model; `setSelection` handler       |
| 6.3 | Context/selection coupling | Selection changes inform context panel        |
| 6.4 | Capability providers       | Register context renderers via manifest       |

### Exit criteria

- [ ] Context panel switches content via Workbench Request
- [ ] Selection state shared across views
- [ ] Context Manager and Selection Manager unit tested

---

## Phase 7 — Workbench Request API & Permission-Filtered Shell

### Objective

Complete Workbench Request model; wire PermissionService to filter all dynamic shell surfaces.

### Subsystems enhanced

| Subsystem         | Enhancement                                           |
| ----------------- | ----------------------------------------------------- |
| Workbench Manager | Full request routing; permission gate on all requests |
| All sub-managers  | Reject unauthorised operations at manager boundary    |

### Tasks

| #   | Task                          | Description                                                                                                           |
| --- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 7.1 | Workbench Request types       | `openView`, `closeView`, `focusView`, `openPanel`, `closePanel`, `revealNavigationItem`, `setContext`, `setSelection` |
| 7.2 | Capability request API        | Public publish API for capabilities                                                                                   |
| 7.3 | PermissionService integration | Filter nav, views, context providers                                                                                  |
| 7.4 | Deep link guard               | Middleware or route guard for workspace routes                                                                        |
| 7.5 | Hide-not-disable policy       | Document 005 compliance                                                                                               |

### Exit criteria

- [ ] Capabilities publish requests — no direct UI manipulation
- [ ] All dynamic shell items permission-filtered
- [ ] No hardcoded role checks in framework code
- [ ] Deep link to unauthorised view handled gracefully

---

## Phase 8 — Testing, Documentation & Closeout

### Objective

Meet Sprint 003 acceptance criteria; produce closeout report; recommend Milestone 3 tag.

### Tasks

| #   | Task                | Description                              |
| --- | ------------------- | ---------------------------------------- |
| 8.1 | Coverage audit      | workbench-framework ≥ 80%                |
| 8.2 | E2E suite           | `spr-003-workbench-framework.spec.ts`    |
| 8.3 | Architecture review | Update MILESTONE-003 review doc          |
| 8.4 | Closeout report     | `docs/sprint/SPR-003-closeout-report.md` |
| 8.5 | Roadmap update      | Mark Milestone 3 complete                |
| 8.6 | CHANGELOG           | Sprint 003 entry                         |

### Exit criteria

- [ ] All Sprint 003 acceptance criteria met
- [ ] Quality gates pass
- [ ] Closeout report approved
- [ ] Recommend `v0.3.0-workbench-framework` tag (not created until instructed)

---

## Phase dependency graph

```text
Phase 0 (ADRs + Workbench Request model)     ← current gate
    ↓
Phase 1 (Workbench Manager + Layout/Panel)
    ↓
Phase 2 (Navigation Manager + nav schema)
    ↓
Phase 3 (Activity Bar)
    ↓
Phase 4 (Workspace + View managers)
    ↓
Phase 5 (Dock + Session managers)
    ↓
Phase 6 (Context + Selection managers)
    ↓
Phase 7 (Workbench Requests + permissions)
    ↓
Phase 8 (Closeout)
```

---

## Files summary (approximate)

| Category                    | New files |
| --------------------------- | --------- |
| ADRs & architecture         | 4–5       |
| workbench-framework package | 30–40     |
| Manifest extensions         | 2–3       |
| Workspace/UI integration    | 5–8       |
| Tests                       | 25–35     |
| Documentation               | 6–8       |

---

_Implementation plan — planning only. Await approval before Phase 0 execution._
