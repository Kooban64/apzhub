# SPR-003 — Architecture Refinement Report

> **Review date:** 2026-06-28  
> **Scope:** Architecture refinement before Sprint 003 implementation  
> **Prerequisite:** Milestone 2 complete — `v0.2.0-platform-runtime`  
> **Recommendation:** **READY WITH OBSERVATIONS**

---

## Summary

This report documents the approved architectural refinement replacing **Desktop Framework** with **Workbench Framework** as the standard platform terminology. All Sprint 003 planning documents have been updated. **No production code, Runtime changes, or Desktop Shell changes were made.**

Sprint 003 implementation must **not** begin until the owner approves this report and Phase 0 ADRs are complete.

---

## Updated architecture diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                    Business Data                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                 Business Capabilities                        │
│              (Projects, Support — Milestone 9+)              │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                 Platform Capabilities                        │
│     Command · Search · Notification · Activity (M4–M7)       │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Workbench Framework                         │
│                                                              │
│   Workbench Manager                                          │
│   ├── Layout Manager      ├── Session Manager                │
│   ├── Panel Manager       ├── Dock Manager                   │
│   ├── View Manager        ├── Context Manager                │
│   ├── Navigation Manager  └── Selection Manager              │
│   └── Workspace Manager                                      │
│                                                              │
│   React · Desktop Shell · Workbench Requests                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Platform Runtime                            │
│   UI-agnostic · Manifest · Registry · Lifecycle · Health     │
│   Dependencies: yaml, zod only                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Updated terminology

| Prior term (Sprint 003 planning)  | Standard term                                    |
| --------------------------------- | ------------------------------------------------ |
| Desktop Framework (DEF)           | **Workbench Framework (WBF)**                    |
| `@apzhub/desktop-framework`       | **`@apzhub/workbench-framework`** (proposed)     |
| Navigation Framework (component)  | **Navigation Manager**                           |
| Window Manager                    | **View Manager** (tab/window semantics absorbed) |
| `v0.3.0-desktop-framework`        | **`v0.3.0-workbench-framework`** (proposed)      |
| Direct capability UI manipulation | **Workbench Requests** via Workbench Manager     |

**Note:** Document 005 retains "Desktop Framework (DEF)" as the foundational UX specification. Workbench Framework is the M3+ **implementation architecture** name — not a rewrite of Document 005.

---

## Runtime boundary verification

The Platform Runtime must remain reusable independently of the Workbench Framework.

### Verification results

| Check                       | Result  | Evidence                                                                    |
| --------------------------- | ------- | --------------------------------------------------------------------------- |
| No React dependency         | ✅ Pass | `packages/platform-runtime/package.json` — dependencies: `yaml`, `zod` only |
| No UI dependency            | ✅ Pass | No imports of `@apzhub/ui` in `packages/platform-runtime/src`               |
| No Desktop Shell dependency | ✅ Pass | No imports of `@apzhub/workspace` in `packages/platform-runtime/src`        |
| No React in source          | ✅ Pass | Grep of `packages/platform-runtime` — no `react` references                 |

### Boundary rule (mandatory)

- Platform Runtime orchestrates capabilities, manifests, registry, lifecycle, configuration, and health.
- Workbench Framework consumes Runtime **after** `Runtime.bootstrap()` via server-side registry hydration.
- Runtime public API must not expose React types or UI orchestration concerns.

**Verdict:** Runtime boundary is **verified and documented**. No Runtime changes required for this refinement.

---

## Workbench Framework responsibilities

The Workbench Framework owns **all user interaction infrastructure**:

| Responsibility                      | Owner                       |
| ----------------------------------- | --------------------------- |
| Shell region composition            | Layout Manager              |
| Panel visibility and geometry       | Panel Manager, Dock Manager |
| View/tab lifecycle                  | View Manager                |
| Activity Bar and navigation         | Navigation Manager          |
| Workspace context                   | Workspace Manager           |
| Session state                       | Session Manager             |
| Context panel content               | Context Manager             |
| Platform selection                  | Selection Manager           |
| Request routing and permission gate | Workbench Manager           |

Capabilities **must never** open windows, panels, layouts, or navigation directly.

Full definitions: [workbench-framework.md](../architecture/workbench-framework.md), [workbench-manager.md](../architecture/workbench-manager.md).

---

## Capability interaction model

The only approved UI interaction model:

```text
Capability
    │
    │  publishes Workbench Request
    ▼
Workbench Manager
    │
    │  permission check → delegate to sub-manager
    ▼
Sub-manager (View, Panel, Navigation, Context, Selection, …)
    │
    ▼
UI Update (React / Desktop Shell)
```

### Initial Workbench Request types

| Request                | Handler                  |
| ---------------------- | ------------------------ |
| `openView`             | View Manager             |
| `closeView`            | View Manager             |
| `focusView`            | View Manager             |
| `openPanel`            | Panel Manager            |
| `closePanel`           | Panel Manager            |
| `revealNavigationItem` | Navigation Manager       |
| `setContext`           | Context Manager          |
| `setSelection`         | Selection Manager        |
| `showNotification`     | _(future — Milestone 6)_ |

---

## Deliverables produced

| #   | Deliverable                      | Path                                              | Status           |
| --- | -------------------------------- | ------------------------------------------------- | ---------------- |
| 1   | Workbench Framework architecture | `docs/architecture/workbench-framework.md`        | ✅ Created       |
| 2   | Workbench Manager architecture   | `docs/architecture/workbench-manager.md`          | ✅ Created       |
| 3   | Platform roadmap                 | `docs/architecture/platform-roadmap.md`           | ✅ Updated       |
| 4   | Sprint 003 guide                 | `docs/sprint/SPR-003-workbench-framework.md`      | ✅ Created       |
| 5   | Sprint 003 implementation plan   | `docs/sprint/SPR-003-implementation-plan.md`      | ✅ Refactored    |
| 6   | Architecture refinement report   | `docs/reviews/SPR-003-architecture-refinement.md` | ✅ This document |

### Additional updates

| Document                                   | Change                                         |
| ------------------------------------------ | ---------------------------------------------- |
| `docs/sprint/SPR-003-desktop-framework.md` | Superseded — redirect to workbench guide       |
| `docs/reviews/SPR-003-readiness-review.md` | Terminology and deliverable references updated |
| `docs/architecture/platform-runtime.md`    | Layer diagram updated                          |
| `docs/developer/getting-started.md`        | Workbench Framework planning note added        |
| `docs/README.md`                           | Registry entries updated                       |
| `CHANGELOG.md`                             | Planning section updated                       |

---

## Outstanding questions

| #   | Question                                                                          | Owner                  | Blocking Phase 0?       |
| --- | --------------------------------------------------------------------------------- | ---------------------- | ----------------------- |
| Q1  | New package `@apzhub/workbench-framework` or extend `@apzhub/workspace`?          | Architecture           | **Yes**                 |
| Q2  | Workbench Request transport: in-process only or event-based for future Event Bus? | Architecture           | Partial                 |
| Q3  | Session persistence: localStorage, server API, or hybrid?                         | Architecture + Product | Phase 5 — partial       |
| Q4  | Nav metadata: envelope extension vs separate nav manifest file?                   | Architecture           | Phase 2 — **Yes**       |
| Q5  | PermissionService: extend `@apzhub/auth` or framework-local interface?            | Architecture           | Phase 7 — **Yes**       |
| Q6  | Minimum Activity Bar items for Sprint 003 demo                                    | Product                | No                      |
| Q7  | Tag strategy: `v0.3.0-workbench-framework` at Milestone 3 close?                  | Owner                  | Phase 8 — no            |
| Q8  | Should Document 005 be amended to reference Workbench Framework explicitly?       | Owner                  | No — optional follow-up |

---

## Risks

| Risk                                                       | Severity | Mitigation                                             |
| ---------------------------------------------------------- | -------- | ------------------------------------------------------ |
| Terminology confusion (DEF vs WBF)                         | Medium   | Cross-reference in all M3 docs; Document 005 unchanged |
| Capabilities bypass Workbench Request model                | **High** | ADR-0020; lint enforcement; code review gate           |
| Sprint 003 scope expands into Command/Search/Notifications | **High** | Enforced out-of-scope; phase gates                     |
| Incomplete permission model blocks dynamic UI              | **High** | Phase 7 dedicated; scaffold permissions in Phase 3     |
| Manifest schema churn breaks SPR-002 manifests             | Medium   | Optional nav/view blocks only                          |
| Desktop Shell refactor causes E2E regression               | Medium   | Incremental wiring; SPR-001 suite in CI                |
| Window Manager removal causes planning gaps                | Low      | View Manager explicitly owns tab semantics             |
| Team parallelises runtime and framework changes            | Medium   | Freeze runtime public API for Sprint 003               |

---

## Recommendation

### **READY WITH OBSERVATIONS**

The architecture refinement is **complete**. Sprint 003 may proceed to **Phase 0 (ADRs & Architecture Gate)** upon owner approval of this report.

### Conditions for implementation start (Phase 1)

1. Owner approves this architecture refinement report
2. Phase 0 ADRs approved — especially package boundary (Q1), Workbench Request model (Q2), and client/server hydration
3. `v0.2.0-platform-runtime` tag created to lock Milestone 2 baseline (when instructed)
4. Out-of-scope list acknowledged by all contributors
5. Nav manifest extension design approved before Phase 2 merge

### Conditions **not** met for unconditional READY

- Package boundary undecided (Q1)
- Workbench Request transport model open (Q2) — must resolve in Phase 0 ADR
- Permission integration approach undecided (Q5)
- Session persistence strategy open (Q3) — acceptable for Phase 1–4; must resolve before Phase 5

### Stop condition

**Stop all Sprint 003 implementation** after this report until:

1. Owner reviews and approves this refinement report and updated planning documents
2. Phase 0 ADRs are written and approved
3. Explicit instruction to begin Phase 1

---

## Next steps (after owner approval)

1. Owner approves architecture refinement report
2. Execute Phase 0 — ADRs for workbench-framework package, Workbench Request model, registry hydration
3. Create git tag `v0.2.0-platform-runtime` (when instructed)
4. Architecture review gate for Phase 1
5. Begin Phase 1 implementation

---

_SPR-003 architecture refinement — planning complete. Awaiting owner approval before any implementation._
