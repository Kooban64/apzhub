# SPR-003 — Workbench Framework

> **Sprint:** SPR-003 — Workbench Framework  
> **Milestone:** 3 — Workbench Framework  
> **Status:** **Planning — awaiting approval before implementation**  
> **Authority:** [Workbench Framework](../architecture/workbench-framework.md) · [Workbench Manager](../architecture/workbench-manager.md) · [005 — Desktop Experience](../005-desktop-experience-workspace-framework.md) · [016 — Desktop Shell](../016-desktop-shell-architecture-user-experience-framework.md) · [Platform Roadmap](../architecture/platform-roadmap.md)

---

## Objective

Build the **Workbench Framework** — the permanent user interaction infrastructure that hosts all user-facing capabilities.

Sprint 003 establishes the Workbench Manager and its sub-managers, registry-driven shell integration, session and layout models, and the **Capability → Workbench Request → Workbench Manager → UI Update** interaction model.

Transition APZHUB from **Platform Runtime** (engine) to **Workbench Framework** (experience layer).

> **Terminology:** "Desktop Framework" in prior Sprint 003 planning is superseded by **Workbench Framework**. Document 005 remains authoritative for UX principles; Workbench Framework is the M3+ implementation architecture name.

---

## Platform architecture layers

```text
Platform Runtime
        ↓
Workbench Framework          ← Sprint 003
        ↓
Platform Capabilities        ← Milestones 4–7
        ↓
Business Capabilities        ← Milestone 9+
        ↓
Business Data
```

---

## Scope

Implement **framework infrastructure only**:

| In scope                          | Description                                                 |
| --------------------------------- | ----------------------------------------------------------- |
| Workbench Framework package       | Workbench Manager + sub-managers                            |
| Workbench Request model           | Typed requests from capabilities to Workbench Manager       |
| Layout & Panel managers           | Shell region composition per Document 016                   |
| View & Navigation managers        | Tab lifecycle; registry-driven Activity Bar                 |
| Workspace, Session, Dock managers | Context switching; session model; panel geometry            |
| Context & Selection managers      | Context panel orchestration; platform selection             |
| Permission-filtered shell         | Hide unauthorised UI surfaces per Document 005              |
| Runtime integration               | Consume `Runtime.registry()` server-side; hydrate framework |
| Tests & documentation             | Unit, integration, E2E for framework behaviour              |

---

## Out of scope

Explicitly **not** part of Sprint 003:

| Excluded                                           | Reason                              |
| -------------------------------------------------- | ----------------------------------- |
| Projects, Documents, Support                       | Business capabilities — Milestone 9 |
| Automation, Analytics, Compliance                  | Business workspaces                 |
| Registry UI / administration screens               | Future milestone                    |
| Business functionality                             | Milestone 9                         |
| Command Palette implementation                     | Milestone 4 (Document 019)          |
| Unified Search implementation                      | Milestone 5 (Document 020)          |
| Notification centre implementation                 | Milestone 6 (Document 021)          |
| Event Bus runtime                                  | Separate sprint                     |
| External integrations (Plane, Kimai, Zammad, etc.) | Milestone 9+                        |
| REST Registry API                                  | ADR-0010 prohibits                  |
| Desktop Shell rewrite                              | Incremental enhancement only        |

---

## Workbench Manager subsystems

All subsystems are coordinated by the **Workbench Manager**. Capabilities never call sub-managers directly.

| Subsystem              | Purpose                                       | Primary reference |
| ---------------------- | --------------------------------------------- | ----------------- |
| **Layout Manager**     | Shell region geometry, responsive composition | 016               |
| **Panel Manager**      | Region visibility, collapse, resize           | 016, 005          |
| **View Manager**       | View/tab lifecycle, open/close/focus          | 016, 018          |
| **Navigation Manager** | Activity Bar, sidebar, deep links, reveal     | 017               |
| **Workspace Manager**  | Active workspace context switching            | 005, 017          |
| **Session Manager**    | Session payload, restore, persistence hooks   | 018, 023          |
| **Dock Manager**       | Panel dock geometry, split ratios             | 018               |
| **Context Manager**    | Context panel content orchestration           | 016               |
| **Selection Manager**  | Platform-wide selection context               | 005               |

See [workbench-manager.md](../architecture/workbench-manager.md) for full responsibility definitions.

### Recommended Sprint 003 priority order

1. Workbench Manager scaffold + Layout Manager + Panel Manager
2. Navigation Manager (registry-driven Activity Bar)
3. Workspace Manager + View Manager
4. Dock Manager + Session Manager
5. Context Manager + Selection Manager
6. Workbench Request API + permission integration

---

## Mandatory architectural rule

Capabilities must **never** open windows, panels, layouts, or navigation directly. They publish **Workbench Requests** to the Workbench Manager.

Approved interaction model:

```text
Capability → Workbench Request → Workbench Manager → UI Update
```

---

## Acceptance criteria

Sprint 003 is complete when **all** criteria are met:

### Framework delivery

- [ ] Workbench Framework package exists with documented public API
- [ ] Workbench Manager routes requests to sub-managers
- [ ] Layout Manager composes all permanent shell regions per Document 016
- [ ] Panel Manager supports collapse, resize, and visibility for sidebar and context panel
- [ ] Navigation Manager registers Activity Bar items from `PlatformRegistry`
- [ ] Workspace Manager switches workspace context without full page reload
- [ ] View Manager hosts at least one dynamic view in workspace tabs
- [ ] Session Manager defines session payload schema and in-memory restore
- [ ] Dock Manager persists panel geometry via Session Manager
- [ ] Context Manager switches context panel content via requests
- [ ] Selection Manager maintains platform selection context

### Capability integration

- [ ] Capabilities publish Workbench Requests — no direct UI manipulation
- [ ] Workbench Request types documented: `openView`, `closeView`, `focusView`, `openPanel`, `revealNavigationItem`, `setContext`, `setSelection`

### Permission & security

- [ ] Shell regions filter visible items based on authenticated user permissions
- [ ] No hardcoded role checks in framework components — consume PermissionService abstraction
- [ ] Deep links to unauthorised views redirect or show standard error surface

### Runtime integration

- [ ] Server-side bootstrap provides registry snapshot to framework hydration
- [ ] No direct manifest file reads from UI — registry only
- [ ] Framework health observable via existing runtime diagnostics path

### Quality

- [ ] Unit test coverage ≥ 80% for workbench-framework package
- [ ] Integration tests for registry-driven navigation and request routing
- [ ] E2E: authenticated user sees permission-filtered Activity Bar
- [ ] SPR-001 E2E suite passes (no regression)
- [ ] All quality gates pass (lint, typecheck, build, test, coverage, E2E)

### Documentation

- [ ] Workbench Framework architecture document
- [ ] Workbench Manager architecture document
- [ ] ADR for package boundary (workbench-framework vs workspace)
- [ ] Sprint 003 closeout report
- [ ] Updated platform roadmap status

---

## Risks

| Risk                                                        | Likelihood | Impact | Mitigation                                       |
| ----------------------------------------------------------- | ---------- | ------ | ------------------------------------------------ |
| Scope creep into Command/Search/Notifications               | High       | High   | Strict out-of-scope list; phase gates            |
| Static shell refactor breaks SPR-001 E2E                    | Medium     | High   | Incremental migration; feature flags             |
| Permission model incomplete for dynamic UI                  | Medium     | High   | Dedicated permission phase; scaffold permissions |
| Session persistence complexity                              | Medium     | Medium | In-memory first; persistence in later phase      |
| Registry lacks nav metadata on manifests                    | Medium     | Medium | Extend manifest schema; migration guide          |
| Capabilities bypass Workbench Request model                 | Medium     | High   | Lint rule / ADR enforcement                      |
| Package boundary dispute (workspace vs workbench-framework) | Low        | Medium | Resolve in Phase 0 ADR before code               |

---

## Dependencies

### Milestone 2 — Platform Runtime (complete)

| Dependency                              | Usage                                    |
| --------------------------------------- | ---------------------------------------- |
| `Runtime.bootstrap()`                   | Server startup                           |
| `Runtime.registry()`                    | `PlatformRegistry` facade                |
| `PlatformRegistry.getComponents()` etc. | Navigation item sources                  |
| Capability lifecycle `active`           | Framework loads only active capabilities |
| Manifest Engine                         | Nav/view manifest extensions             |

### Milestone 1 — Foundation (complete)

| Dependency          | Usage                                        |
| ------------------- | -------------------------------------------- |
| `@apzhub/workspace` | Existing Desktop Shell — extend, not replace |
| `@apzhub/ui`        | Shell layout primitives                      |
| `@apzhub/auth`      | Session and permission context               |
| `@apzhub/theme`     | Token-based theming                          |

### Specification documents

| Document | Relevance                             |
| -------- | ------------------------------------- |
| 005      | UX principles, permission-driven UI   |
| 016      | Shell regions and behaviour           |
| 017      | Navigation hierarchy and registration |
| 018      | Session and window persistence        |
| 023      | User preferences (session categories) |

### Outstanding prerequisites (planning)

| Prerequisite                                      | Required before              |
| ------------------------------------------------- | ---------------------------- |
| ADR: Workbench Framework package boundary         | Phase 1 code                 |
| ADR: Workbench Request model                      | Phase 1 code                 |
| Nav metadata manifest extension                   | Navigation Manager           |
| PermissionService interface for UI filtering      | Permission integration phase |
| Session storage decision (localStorage vs server) | Session persistence phase    |

---

## Success definition

Users authenticate into the same Desktop Shell, but the shell becomes **workbench-driven**: Activity Bar items derive from registered capabilities; workspace tabs host registered views via Workbench Requests; layout state is session-aware. No business screens appear unless registered as framework scaffold demos.

---

_Sprint 003 guide — planning only. No implementation until approved._
