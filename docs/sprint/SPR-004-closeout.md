# SPR-004 — Sprint Closeout Report

> **Sprint:** SPR-004 — Action Framework  
> **Milestone:** 4 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await owner approval before tag and Sprint 005**

---

## Objective

Close Sprint 004, review the completed Action Framework against approved architecture, prepare Milestone 4 release documentation, and establish the Sprint 005 planning baseline — without implementing Sprint 005 functionality.

---

## Sprint objectives

Sprint 004 delivered the **Action Framework** (`@apzhub/command-framework`): a unified action registration, discovery, permission filtering, and execution layer integrated with the Workbench Framework and Desktop Shell per Document 019.

Primary goals:

1. Establish `@apzhub/command-framework` as a Platform Capability package (ADR-0024)
2. Extend manifests with `workbench.actions` and `workbench.toolbar` (ADR-0025)
3. Implement execution pipeline with actor model and audit hooks (ADR-0026)
4. Deliver Workbench surfaces — Command Palette, global shortcuts, context menu, toolbar
5. Wire application integration in `apps/web` with shared `DefaultActionExecutor`
6. Document architecture, onboarding, and production readiness

---

## Stories completed

| Story  | Title                                   | Status                      |
| ------ | --------------------------------------- | --------------------------- |
| AF-001 | Technical specifications and ADRs       | ✅ Complete                 |
| AF-002 | Package scaffold                        | ✅ Complete                 |
| AF-003 | ActionRegistry core                     | ✅ Complete                 |
| AF-004 | Manifest commands validation            | ✅ Complete                 |
| AF-005 | Server action filter DTO                | ✅ Complete                 |
| AF-006 | CommandExecutor and actor model         | ✅ Complete                 |
| AF-007 | WorkbenchCommandBridge                  | ✅ Complete                 |
| AF-008 | Workbench API bridge integration        | ✅ Complete                 |
| AF-009 | Built-in platform action catalogue      | ✅ Complete                 |
| AF-010 | Client hydration + `useCommandRegistry` | ✅ Complete                 |
| AF-011 | Command Palette UI                      | ✅ Complete                 |
| AF-012 | Palette shortcut + search               | ✅ Complete                 |
| AF-013 | Palette E2E                             | ✅ Complete                 |
| AF-014 | ShortcutRegistry                        | ✅ Complete                 |
| AF-015 | Shell global shortcut listener          | ✅ Complete                 |
| AF-016 | Context menu API + UI                   | ✅ Complete                 |
| AF-017 | Toolbar manifest + UI                   | ✅ Complete                 |
| AF-018 | Automation / AI / voice gateway stubs   | ✅ Complete                 |
| AF-019 | Platform Asset manifest scaffolding     | ✅ Complete                 |
| AF-020 | Application integration                 | ✅ Complete                 |
| AF-021 | Documentation and production readiness  | ✅ Complete                 |
| AF-022 | Sprint closeout                         | ✅ Complete (this document) |

**22 stories delivered.** Completion reports: [docs/sprint/AF-*-completion-report.md](./).

---

## Scope delivered

### Package — `@apzhub/command-framework`

| Subsystem              | Delivered                                                                   |
| ---------------------- | --------------------------------------------------------------------------- |
| ActionRegistry         | Registration, search, context filter, frozen descriptors                    |
| DefaultActionExecutor  | Permission gate, bridge dispatch, actor routing, audit hook                 |
| WorkbenchCommandBridge | Bridge action id → `WorkbenchAction` / `WorkbenchRequest`                   |
| ShortcutRegistry       | Chord normalisation, conflict detection                                     |
| Server bootstrap       | `bootstrapActionRegistry`, `filterActionRegistryDto`, hydration diagnostics |
| Client hydration       | `createCommandRegistryFromDto`, read-only `ClientActionRegistry`            |
| React integration      | `CommandRegistryProvider`, `useCommandRegistry`, `useShortcutRegistry`      |
| Extraction             | Manifest actions, toolbar regions, shortcut population                      |
| Platform catalogue     | Built-in workbench bridge actions                                           |
| Gateways               | AI, voice, automation stubs (NOT_IMPLEMENTED)                               |

### Workbench surfaces — `@apzhub/workspace`

| Surface          | Delivered                                            |
| ---------------- | ---------------------------------------------------- |
| Command Palette  | Ctrl+Shift+P, fuzzy search, permission-filtered list |
| Global shortcuts | Window keydown → `execute(actionId)`                 |
| Context menu     | Selection/context-aware action filtering             |
| Toolbar          | Region-based DTO → UI items                          |

### Platform Assets

| Asset                                | Source                                                             |
| ------------------------------------ | ------------------------------------------------------------------ |
| `platform.theme.toggle`              | `packages/theme/themes/default/theme.yaml`                         |
| `platform.home.navigate`             | `packages/workbench-framework/manifests/platform-home/module.yaml` |
| Workspace toolbar region             | Theme manifest                                                     |
| Shortcuts Ctrl+Shift+T, Ctrl+Shift+H | Manifest `shortcut` fields                                         |

### Application integration — `apps/web`

| Component                         | Purpose                                        |
| --------------------------------- | ---------------------------------------------- |
| `loadActionRegistryDto()`         | Server bootstrap + session filter              |
| `ActionWorkbenchShellProvider`    | Workbench + Command Registry + shared executor |
| `createAppActionExecutorBundle()` | Shared `DefaultActionExecutor` wiring          |
| `DesktopShell` surface flags      | All four surfaces enabled                      |
| `/api/health` → `commands`        | Hydration summary for operators                |
| `ActionFrameworkDiagnostics`      | Dev-only hydration counts                      |

### ADRs

- ADR-0024 Command Framework Package — Accepted
- ADR-0025 Workbench Commands Manifest Extension — Accepted
- ADR-0026 Command Execution and Actor Model — Accepted

### Documentation (AF-021)

- [command-framework.md](../architecture/command-framework.md)
- [action-framework-onboarding.md](../developer/action-framework-onboarding.md)
- [v0.4.0-action-framework.md](../releases/v0.4.0-action-framework.md)
- Governance guide updates
- 672 unit tests, 91.46% statement coverage

---

## Scope deferred

| Item                                                     | Reason                                      | Target                    |
| -------------------------------------------------------- | ------------------------------------------- | ------------------------- |
| Service handler execution (`handler: service:…`)         | Platform Service wiring not in sprint scope | Theme service / PSL story |
| Handler resolution for manifest action ids vs bridge ids | Documented limitation                       | Post-M4 hardening         |
| Client ↔ server registry synchronisation                 | One-way hydration sufficient for M4         | Future ADR                |
| AI / voice / automation gateway implementation           | Interface-only per sprint plan              | M4+ / Document 012        |
| User shortcut preference overrides                       | Document 023 not implemented                | Preferences milestone     |
| Command history / pinned commands                        | Document 019 optional features              | Future UX                 |
| Search-as-command integration                            | Milestone 5 scope                           | Sprint 005                |
| Full RBAC permission population                          | Milestone 8                                 | Auth session permissions  |
| Event Bus audit trail for actions                        | Event Bus not built                         | Document 012              |
| Business capability actions                              | Milestone 9+                                | Business modules          |
| Production diagnostics UI                                | Dev-only by design                          | Ops via health endpoint   |
| Toolbar regions beyond `workspace`                       | Scaffold scope                              | Platform UX story         |
| Git tag creation                                         | Owner instruction only                      | On approval               |

---

## Technical debt

Consolidated register from AF completion reports (open items):

| ID              | Item                                                     | Priority | Target                          |
| --------------- | -------------------------------------------------------- | -------- | ------------------------------- |
| TD-AF20-01      | Manifest action id vs bridge id in executor dispatch     | Medium   | Handler resolution story        |
| TD-AF20-02      | `platform.theme.toggle` service handler NOT_IMPLEMENTED  | Medium   | Theme service (TD-AF19-01)      |
| TD-AF20-03      | Header theme toggle duplicates toolbar action            | Low      | UX consolidation                |
| TD-AF20-04      | No Vitest integration test for `loadActionRegistryDto()` | Low      | Optional test story             |
| TD-AF20-05      | Health endpoint uses allow-all visibility                | Low      | Ops runbook (documented AF-021) |
| TD-AF19-01      | Theme service handler not implemented                    | Medium   | Theme service                   |
| TD-AF19-02      | Toolbar regions beyond workspace not scaffolded          | Low      | Platform UX                     |
| TD-AF19-03      | Dedicated shortcut manifest block deferred               | Low      | Future ADR                      |
| TD-AF19-05      | Orphan toolbar warnings not in production diagnostics    | Low      | Ops enhancement                 |
| TD-AF18-*       | Gateway stubs only                                       | Expected | Future milestones               |
| TD-AF17-04      | Toolbar customisation / reorder                          | Low      | Document 023                    |
| TD-AF16-03      | Action visibility model server DTO only partial          | Low      | Server filter extension         |
| TD-AF15-02      | Global shortcuts do not pass action args                 | Low      | Context-dependent actions       |
| TD-AF10-05      | Bidirectional synchronisation not implemented            | Low      | Future ADR                      |
| TD-AF9-02       | `registerBuiltInWorkbenchCommands` deprecated alias      | Low      | Cleanup                         |
| TD-M3 carryover | RBAC not populated from auth session                     | Medium   | Milestone 8                     |
| TD-M3 carryover | Tab bar, view mount pipeline                             | Medium   | M9 / UX                         |

Resolved during sprint (no longer open):

- TD-AF10-02/03 — App wiring (AF-020)
- TD-AF15-01, TD-AF16-01, TD-AF17-01/02 — Surface wiring (AF-020)
- TD-AF19-04 — Empty toolbar until AF-020 (resolved)

---

## Lessons learned

### What worked well

1. **Phased story delivery (AF-001 → AF-022)** — Each story independently mergeable; quality gates enforced throughout.
2. **Workbench Surface Pattern** — Separating presentation (`@apzhub/workspace`) from execution (`@apzhub/command-framework`) kept sprint scope clean.
3. **Server-authoritative DTO** — Permission filtering before client hydration matched Workbench patterns from SPR-003.
4. **Shared executor in AF-020** — One `DefaultActionExecutor` for Workbench API and Command Registry avoided duplicate execution paths.
5. **Platform Asset scaffolding (AF-019)** — Real manifests (`theme.yaml`, `platform-home`) validated extraction before app wiring.
6. **Documentation sprint (AF-021)** — Consolidating docs after integration reduced stale references (e.g. removed `workbench-shell-provider`).

### What to improve

1. **Bridge id vs manifest action id** — Should have been resolved in AF-007/008; deferred and now blocks shortcut execution for manifest-only ids.
2. **Service handler stub vs scaffold manifest** — Scaffolding `platform.theme.toggle` before service exists creates user-visible actions that fail silently (`NOT_IMPLEMENTED`).
3. **E2E environment dependency** — Playwright browser install is environmental; CI must pin browser cache for closeout reproducibility.
4. **Duplicate theme controls** — Header button predates toolbar; integration story should have flagged UX consolidation earlier.

### Process observations

- **Stop-after-review gates** between stories prevented scope creep into Sprint 005.
- **672 tests** at closeout (+289 vs M3) demonstrates sustained test investment.
- **91.46% coverage** exceeds 80% thresholds; command-framework package well covered.

---

## Architecture compliance

| Rule / ADR                                      | Result               |
| ----------------------------------------------- | -------------------- |
| ADR-0024 Command Framework package              | ✅                   |
| ADR-0025 Manifest `workbench.actions` / toolbar | ✅                   |
| ADR-0026 Execution and actor model              | ✅                   |
| Document 000 §6.1 API layering                  | ✅ Preserved         |
| No engine bypass from shell surfaces            | ✅                   |
| No business modules                             | ✅ Confirmed         |
| Baseline v1.0 unchanged                         | ✅ No baseline edits |

See [SPR-004 architecture review](../reviews/SPR-004-architecture-review.md) and [Milestone 4 review](../reviews/MILESTONE-004-action-framework-review.md).

---

## Quality gates

All gates passed at Sprint 004 closeout (2026-06-28). **No production code changed since AF-020** (AF-021 and AF-022 are documentation only).

| Gate                 | Result                                                                   |
| -------------------- | ------------------------------------------------------------------------ |
| `pnpm lint`          | ✅ Pass                                                                  |
| `pnpm typecheck`     | ✅ Pass                                                                  |
| `pnpm build`         | ✅ Pass                                                                  |
| `pnpm test`          | ✅ Pass — **672** unit tests                                             |
| `pnpm test:coverage` | ✅ Pass — **91.46%** statements                                          |
| `pnpm test:e2e`      | ✅ Pass — **19** E2E tests (last verified AF-020; no code changes since) |

> **Note:** E2E was not re-run during AF-022 closeout due to Playwright browser unavailability in the closeout environment. Last successful run: AF-020 completion (19/19). No application or framework code changed in AF-021 or AF-022.

---

## Deliverables produced (AF-022)

| Document             | Path                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Sprint closeout      | [SPR-004-closeout.md](./SPR-004-closeout.md) (this document)                                                  |
| Architecture review  | [SPR-004-architecture-review.md](../reviews/SPR-004-architecture-review.md)                                   |
| Milestone review     | [MILESTONE-004-action-framework-review.md](../reviews/MILESTONE-004-action-framework-review.md)               |
| Release notes        | [v0.4.0-action-framework.md](../releases/v0.4.0-action-framework.md) (prepared AF-021)                        |
| Production readiness | [SPR-004-production-readiness-review.md](../reviews/SPR-004-production-readiness-review.md) (prepared AF-021) |

---

## Recommended release

**Tag:** `v0.4.0-action-framework`  
**Baseline:** `v0.3.0-workbench-framework`

**Recommendation:** Proceed with release on owner instruction. See [Milestone 4 review](../reviews/MILESTONE-004-action-framework-review.md) for formal verdict.

Do **not** create the Git tag until owner instructs.

---

## Sprint 005 preparation (document only — no implementation)

Milestone 5 is the **Search Framework** per Document 020 and [platform-roadmap.md](../architecture/platform-roadmap.md).

Recommended Sprint 005 themes (see Milestone 4 review backlog section):

- Search provider registration and orchestration
- Header search UI integration
- Palette ↔ search overlap (commands as search results)
- Handler resolution hardening (TD-AF20-01)
- Theme service implementation (TD-AF20-02)

**Do not begin Sprint 005 until owner approves.**

---

## Stop condition

Sprint 004 is closed.

Await owner approval for:

1. Release tag `v0.4.0-action-framework`
2. Sprint 005 planning gate

---

_SPR-004 Action Framework — Sprint closeout._
