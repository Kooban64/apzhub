# SPR-003 — Sprint Closeout Report

> **Sprint:** SPR-003 — Workbench Framework  
> **Phase:** 8 — Closeout, Architecture Review & Release Preparation  
> **Date:** 2026-06-28  
> **Status:** Complete — **awaiting owner approval before tag and Sprint 004**

---

## Objective

Close Sprint 003, review the completed Workbench Framework against approved architecture, prepare Milestone 3 release documentation, and establish the Sprint 004 architectural baseline — without implementing Sprint 004 functionality.

---

## Sprint summary

SPR-003 delivered `@apzhub/workbench-framework` across Phases 0–8:

| Phase | Deliverable                                                       | Status |
| ----- | ----------------------------------------------------------------- | ------ |
| 0     | ADRs 0019–0023, architecture refinement                           | ✅     |
| 1     | Workbench Manager, Request Bus, Layout/Panel engines              | ✅     |
| 2     | Navigation Engine, manifest `workbench.navigation`                | ✅     |
| 3     | Shell wiring — Activity Bar, sidebar, registry hydration          | ✅     |
| 4     | View Engine, route mapping, view activation                       | ✅     |
| 5     | Session Engine, localStorage persistence (ADR-0021)               | ✅     |
| 6     | Context Engine, Selection Engine, scaffold permission adapter     | ✅     |
| 7     | Workbench API v1.0, AuthWorkbenchPermissionAdapter, server filter | ✅     |
| 8     | Closeout, reviews, release preparation                            | ✅     |

**Package status:** `WORKBENCH_FRAMEWORK_STATUS = "phase-7-workbench-api"`

---

## Architecture compliance

| Rule / ADR                                                            | Result           |
| --------------------------------------------------------------------- | ---------------- |
| ADR-0019 Workbench Framework package                                  | ✅               |
| ADR-0020 Workbench Request transport (capability → API → Manager)     | ✅               |
| ADR-0021 Session persistence (localStorage, versioned schema)         | ✅               |
| ADR-0022 Navigation manifest extension                                | ✅               |
| ADR-0023 Permission adapter (DI, server filter, restore sanitisation) | ✅               |
| Document 000 §6.1 API layering (Runtime / Workbench / Capability)     | ✅ Added Phase 8 |
| No business modules                                                   | ✅ Confirmed     |
| No Sprint 004 implementation                                          | ✅ Confirmed     |

See [SPR-003 architecture review](../reviews/SPR-003-architecture-review.md).

---

## Quality gates

All gates passed at Phase 8 closeout (2026-06-28):

| Gate                 | Result                                               |
| -------------------- | ---------------------------------------------------- |
| `pnpm lint`          | ✅ Pass                                              |
| `pnpm typecheck`     | ✅ Pass                                              |
| `pnpm build`         | ✅ Pass                                              |
| `pnpm test`          | ✅ Pass — 383 unit tests                             |
| `pnpm test:coverage` | ✅ Pass — workbench-framework branch threshold ≥ 80% |
| `pnpm test:e2e`      | ✅ Pass — 15 E2E tests                               |

---

## Deliverables produced (Phase 8)

| Document            | Path                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Sprint closeout     | [SPR-003-closeout.md](./SPR-003-closeout.md) (this document)                                          |
| Architecture review | [SPR-003-architecture-review.md](../reviews/SPR-003-architecture-review.md)                           |
| Milestone review    | [MILESTONE-003-workbench-framework-review.md](../reviews/MILESTONE-003-workbench-framework-review.md) |
| Release notes       | [v0.3.0-workbench-framework.md](../releases/v0.3.0-workbench-framework.md)                            |

### Documentation updated

- [Platform Roadmap](../architecture/platform-roadmap.md) — Milestone 3 complete
- [CHANGELOG.md](../../CHANGELOG.md) — v0.3.0 entry
- [README.md](../../README.md) — current phase
- [docs/README.md](../README.md) — sprint status table
- [Document 000](../000-apzhub-engineering-constitution.md) — §6.1 API layering model

---

## Recommended release

**Tag:** `v0.3.0-workbench-framework`  
**Baseline:** `v0.2.0-platform-runtime`

Do **not** create the Git tag until owner instructs.

---

## Consolidated technical debt

| ID    | Item                                                                | Target                        |
| ----- | ------------------------------------------------------------------- | ----------------------------- |
| TD-01 | Tab bar UI not implemented — single focused view only               | Future UX phase               |
| TD-02 | View content region placeholder — no capability view mount pipeline | Milestone 9+ / capability SDK |
| TD-03 | RBAC permissions not populated from `@apzhub/auth` session          | Milestone 8                   |
| TD-04 | PostgreSQL / server session sync deferred                           | Milestone 8                   |
| TD-05 | `WorkbenchCommandBridge` not implemented                            | Sprint 004                    |
| TD-06 | Context panel UI not wired to manifest providers                    | Post-M3 UX                    |
| TD-07 | Selection engine not exposed in shell UI                            | Future UX                     |
| TD-08 | Deep link route guard / SSR view hydration not implemented          | Hardening                     |
| TD-09 | `getManager()` on Request Bus — internal escape hatch               | Hardening                     |
| TD-10 | Engine classes still exported from package index (legacy)           | Closeout cleanup              |
| TD-11 | Legacy `module.navigation` coexists with `workbench.navigation`     | Future ADR                    |
| TD-12 | Activity bar uses label initial, not icon asset system              | Design system                 |

---

## Sprint 004 preparation (document only — no implementation)

The following extension points are the **architectural baseline** for Sprint 004 (Command Framework). No code was added in Phase 8 beyond existing Phase 7 prep types.

### 1. Command Framework extension points

- **Workbench Actions** (`WorkbenchAction`, `REQUEST_COMMAND_MAP`) — typed action model mapping Workbench Requests to future Platform Commands (Document 019).
- **`WorkbenchCommandBridge`** — interface documented in `@apzhub/workbench-framework`; routes `executeAction()` to Command Framework when Sprint 004 lands.
- **Runtime registry** — capability manifests may declare `workbench.commands` (schema TBD Sprint 004); server filter pattern mirrors navigation/views.

### 2. Workbench Action evolution

- Phase 7: `WorkbenchAPI.executeAction()` accepts `WorkbenchAction` payloads; falls back to direct request routing when bridge absent.
- Sprint 004: bridge connects to Command Registry; actions gain keyboard binding metadata, palette visibility, and permission keys.

### 3. Keyboard shortcut integration points

- **Shell hook:** `@apzhub/ui` / workspace shell listens for key chords; publishes Workbench Requests or Command invocations via Workbench API (not direct engine access).
- **Action metadata:** `WorkbenchAction.shortcut` field reserved in type contract (Sprint 004 population).
- **Conflict resolution:** Command Framework owns shortcut registry; Workbench Manager does not bind keys directly.

### 4. Command Palette integration points

- **Palette host:** Desktop Shell command palette region (Document 019) consumes filtered action list from Workbench API / Command Framework.
- **Discovery:** Actions registered via manifest + runtime registry; permission-filtered server-side (same pattern as `filterWorkbenchRegistryDto()`).
- **Execution path:** Palette selection → Command Framework → WorkbenchCommandBridge → Workbench Manager.

### 5. AI command execution extension points

- **AI agent surface:** Agents invoke Platform Commands through Command Framework API — never Workbench engines directly (Document 000 §6.1).
- **Workbench context:** Selection Engine and Context Engine expose read-only snapshots for AI grounding (Sprint 004+ wiring).
- **Audit:** Command execution events deferred to Event Bus (Milestone 4+ / Document 012).

---

## Stop condition

Sprint 003 is closed. **Do not begin Sprint 004 implementation.**

Await owner approval for:

1. Release tag `v0.3.0-workbench-framework`
2. Sprint 004 planning gate

---

_SPR-003 Workbench Framework — Sprint closeout._
