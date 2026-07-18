# SPR-004 — Action Framework Engineering Backlog

> **Sprint:** SPR-004 — Action Framework  
> **Milestone:** 4 — Command / Action Framework  
> **Mode:** Implementation Mode (Architecture Baseline v1.0 frozen)  
> **Status:** Backlog approved — **AF-001 complete; await review before AF-002**  
> **Authority:** [SPR-004 sprint guide](../sprint/SPR-004-action-framework.md) · [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) · [019 — Command Palette](../019-universal-command-palette-action-framework.md)

---

## Development workflow

Architecture redesign is no longer part of normal development. All stories comply with the frozen baseline. Baseline changes require ADR.

```text
Product Requirement
        ↓
Technical Specification
        ↓
Implementation
        ↓
Code Review
        ↓
Merge
        ↓
Release
```

### Story process

For every story:

1. **Technical Specification** — story-scoped spec in `docs/specs/` or story section appendix
2. **Implementation** — single PR, single concern
3. **Tests** — unit / integration / E2E as defined below
4. **Documentation** — update guides, CHANGELOG if user-visible
5. **Review** — code review against baseline and acceptance criteria
6. **Close** — mark story done; then begin next story

**Rule:** Complete one story before beginning the next.

### Story principles

| Principle                | Meaning                                                        |
| ------------------------ | -------------------------------------------------------------- |
| Independently buildable  | No partial dependency on unmerged work from a later story      |
| Independently testable   | Tests pass with prior stories merged; story adds its own tests |
| Independently reviewable | PR scope matches one story                                     |
| Independently mergeable  | Green CI; no feature flags required to merge safely            |

### Effort scale

| Label | Estimate  |
| ----- | --------- |
| S     | 0.5–1 day |
| M     | 1–2 days  |
| L     | 2–3 days  |

---

## Story map

```text
AF-001 ADRs & specs
    ↓
AF-002 Package scaffold
    ↓
AF-003 CommandRegistry core ──┬── AF-004 Manifest commands ── AF-005 Server filter
    ↓                         │
AF-006 CommandExecutor        │
    ↓                         │
AF-007 WorkbenchCommandBridge │
    ↓                         │
AF-008 Workbench API wire ────┴── AF-009 Built-in catalogue ── AF-019 Scaffold manifests
    ↓
AF-010 Client hydration + useCommandRegistry
    ↓
AF-011 CommandPalette UI ── AF-012 Search + activation ── AF-013 Palette E2E
    ↓
AF-014 ShortcutRegistry ── AF-015 Shell shortcut listener
    ↓
AF-016 Context menu API + UI
    ↓
AF-017 Toolbar manifest + UI
    ↓
AF-018 Automation / AI / voice stubs
    ↓
AF-020 App integration
    ↓
AF-021 Documentation
    ↓
AF-022 Sprint closeout
```

---

## AF-001 — Technical specifications and ADRs

| Field                | Value                                                                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**        | Authorise Sprint 004 implementation through accepted ADRs and story-level technical specifications                                                               |
| **Scope**            | ADR-0024 (Command Framework package), ADR-0025 (`workbench.commands` manifest block), ADR-0026 (command execution and actor model); spec index for AF-002–AF-022 |
| **Out of scope**     | Production code                                                                                                                                                  |
| **Dependencies**     | Baseline v1.0 approved; SPR-004 sprint guide                                                                                                                     |
| **Estimated effort** | M                                                                                                                                                                |

### Acceptance criteria

- [x] ADR-0024 accepted — `@apzhub/command-framework` as Platform Capability package (Option A)
- [x] ADR-0025 accepted — `workbench.commands` and optional `workbench.toolbar` schema
- [x] ADR-0026 accepted — `CommandExecutor`, actor types (`user`, `system`, `ai-agent`, `voice`), audit hook extension point
- [x] Technical spec template agreed for subsequent stories
- [ ] Owner approval recorded for AF-002 start — pending AF-001 review

### Tests

- N/A (documentation gate)

### Deliverables

- `docs/adr/ADR-0024-command-framework-package.md`
- `docs/adr/ADR-0025-workbench-commands-manifest.md`
- `docs/adr/ADR-0026-command-execution-model.md`
- `docs/specs/SPR-004-spec-index.md` (optional index)

---

## AF-002 — Command Framework package scaffold

| Field                | Value                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Objective**        | Create `@apzhub/command-framework` monorepo package with build, lint, and test wiring                             |
| **Scope**            | `packages/command-framework/` — `package.json`, `tsconfig.json`, Vitest config, empty public exports, README stub |
| **Out of scope**     | Registry logic, Runtime changes, Workbench changes                                                                |
| **Dependencies**     | AF-001                                                                                                            |
| **Estimated effort** | S                                                                                                                 |

### Acceptance criteria

- [ ] Package added to pnpm workspace
- [ ] `pnpm --filter @apzhub/command-framework test` runs (empty/passing)
- [ ] `pnpm typecheck` includes new package
- [ ] No React dependency in package.json
- [ ] Public entry: `@apzhub/command-framework` and `@apzhub/command-framework/server` (stub)

### Tests

- Placeholder smoke test (`expect(true).toBe(true)` or export existence test)

---

## AF-003 — CommandRegistry core

| Field                | Value                                                                             |
| -------------------- | --------------------------------------------------------------------------------- |
| **Objective**        | Implement in-memory Command Registry with register, lookup, list, and diagnostics |
| **Scope**            | `PlatformCommand` type, `CommandRegistry` class, built-in registration API        |
| **Out of scope**     | Manifest extraction, server filter, UI                                            |
| **Dependencies**     | AF-002                                                                            |
| **Estimated effort** | M                                                                                 |

### Acceptance criteria

- [ ] `PlatformCommand` includes: `id`, `label`, `permission?`, `handler`, `palette?`, `shortcut?`, `source`
- [ ] `CommandRegistry.register()`, `get()`, `list()`, `clear()`, `getDiagnostics()`
- [ ] Duplicate id rejection
- [ ] Handler kinds: `workbench-bridge`, `service` (typed union — no implementation yet for service)
- [ ] Branch coverage ≥ 85% on registry module

### Tests

- Unit: register/get/list, duplicate rejection, diagnostics shape, empty registry

---

## AF-004 — Manifest `workbench.commands` validation and extraction

| Field                | Value                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**        | Validate and extract command declarations from capability manifests per ADR-0025                                                        |
| **Scope**            | Zod schema in command-framework or manifest-engine adapter; extraction from registry capability payloads; unit tests with YAML fixtures |
| **Out of scope**     | Toolbar block (AF-017), server filter (AF-005), UI                                                                                      |
| **Dependencies**     | AF-001, AF-003                                                                                                                          |
| **Estimated effort** | M                                                                                                                                       |

### Acceptance criteria

- [ ] Schema validates required fields: `id`, `label`, `handler`
- [ ] Optional: `permission`, `shortcut`, `palette`, `icon`, `group`
- [ ] `extractCommandsFromCapabilities(capabilities)` returns normalised DTO array
- [ ] Invalid manifests produce structured validation errors
- [ ] No changes to Architecture Baseline document text

### Tests

- Unit: valid fixture, missing id, duplicate ids across capabilities, invalid handler format

---

## AF-005 — Server command filter DTO

| Field                | Value                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Objective**        | Implement `filterCommandRegistryDto()` mirroring workbench registry filter pattern          |
| **Scope**            | `@apzhub/command-framework/server` — permission-aware filter; DTO type for client hydration |
| **Out of scope**     | Client hook, app wiring                                                                     |
| **Dependencies**     | AF-003, AF-004                                                                              |
| **Estimated effort** | M                                                                                           |

### Acceptance criteria

- [ ] `filterCommandRegistryDto(commands, permissionAdapter)` strips disallowed commands
- [ ] Uses same permission adapter interface as workbench (`can(permissionKey)`)
- [ ] Exported from server entry only
- [ ] Unit tests for allow-all and deny-specific-key adapters

### Tests

- Unit: filter with scaffold adapter, mock deny adapter, empty input

---

## AF-006 — CommandExecutor and actor model

| Field                | Value                                                                                |
| -------------------- | ------------------------------------------------------------------------------------ |
| **Objective**        | Implement command execution orchestration with permission gate and actor attribution |
| **Scope**            | `CommandExecutor.execute({ commandId, args, actor })`, result type, error taxonomy   |
| **Out of scope**     | Bridge routing (AF-007), Event Bus audit emission                                    |
| **Dependencies**     | AF-003                                                                               |
| **Estimated effort** | M                                                                                    |

### Acceptance criteria

- [ ] Actors: `user`, `system` implemented; `ai-agent`, `voice` reserved with typed stubs
- [ ] Permission check before dispatch (command.permission + adapter)
- [ ] Unknown commandId returns structured error
- [ ] `getDiagnostics()` on executor
- [ ] Audit hook interface defined (no-op implementation — Event Bus deferred)

### Tests

- Unit: success path, permission denied, unknown command, actor attribution in result metadata

---

## AF-007 — WorkbenchCommandBridge implementation

| Field                | Value                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**        | Implement bridge mapping command IDs to Workbench Actions via existing `REQUEST_COMMAND_MAP` / `actionToRequest`                 |
| **Scope**            | `packages/command-framework/bridge/` — `DefaultWorkbenchCommandBridge` implementing workbench `WorkbenchCommandBridge` interface |
| **Out of scope**     | Workbench API wiring (AF-008), service handlers                                                                                  |
| **Dependencies**     | AF-003, AF-006                                                                                                                   |
| **Estimated effort** | M                                                                                                                                |

### Acceptance criteria

- [ ] `toAction(commandId, payload)` returns `WorkbenchAction | null` for all built-in workbench command ids
- [ ] Uses `@apzhub/workbench-framework` action types — no engine imports
- [ ] Bridge registered as handler kind `workbench-bridge` in registry
- [ ] Integration test: commandId → action → request shape (no Workbench Manager required)

### Tests

- Unit: each built-in command id in REQUEST_COMMAND_MAP
- Integration: bridge + actionToRequest round-trip

---

## AF-008 — Workbench API bridge integration

| Field                | Value                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**        | Route `WorkbenchAPI.executeAction()` through CommandExecutor + bridge when command framework is configured                        |
| **Scope**            | Minimal change to `create-workbench-api.ts` — inject optional `CommandExecutor`; fallback to direct `actionToRequest` when absent |
| **Out of scope**     | Redesign Workbench Manager; breaking API changes                                                                                  |
| **Dependencies**     | AF-007                                                                                                                            |
| **Estimated effort** | S                                                                                                                                 |

### Acceptance criteria

- [ ] Existing 383 unit tests pass unchanged (fallback path)
- [ ] When executor injected, `executeAction` delegates through executor → bridge → request
- [ ] No new public breaking changes to WorkbenchAPI v1.0
- [ ] ADR-0026 compliance for user actor on UI-initiated actions

### Tests

- Unit: workbench-framework API tests with mock executor
- Regression: full `pnpm test` green

---

## AF-009 — Built-in workbench command catalogue

| Field                | Value                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------- |
| **Objective**        | Register all built-in Workbench Actions as Platform Commands in CommandRegistry at bootstrap |
| **Scope**            | `registerBuiltInWorkbenchCommands(registry)` — metadata from REQUEST_COMMAND_MAP             |
| **Out of scope**     | Manifest-declared commands (AF-019)                                                          |
| **Dependencies**     | AF-003, AF-007                                                                               |
| **Estimated effort** | S                                                                                            |

### Acceptance criteria

- [ ] Every entry in REQUEST_COMMAND_MAP has corresponding PlatformCommand
- [ ] Labels suitable for Command Palette display
- [ ] `palette: true` for user-facing navigation/view/panel commands
- [ ] Commands discoverable via `registry.list({ palette: true })`

### Tests

- Unit: catalogue count matches map; list filter returns built-ins

---

## AF-010 — Client command hydration and `useCommandRegistry`

| Field                | Value                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**        | Hydrate filtered command DTO on client and expose React hook for shell components                                                        |
| **Scope**            | `createCommandRegistryFromDto()`, `useCommandRegistry()` in command-framework React entry (or re-export from workbench if ADR specifies) |
| **Out of scope**     | Palette UI, app wiring                                                                                                                   |
| **Dependencies**     | AF-005, AF-009                                                                                                                           |
| **Estimated effort** | M                                                                                                                                        |

### Acceptance criteria

- [ ] Hook returns `{ commands, list, execute, isReady }`
- [ ] `list({ query })` filters by label (simple substring — fuzzy in AF-012)
- [ ] `execute(commandId, args)` calls CommandExecutor with actor `user`
- [ ] React dependency isolated to optional export path

### Tests

- Unit: DTO hydration, list filter
- Component test: hook with test wrapper (if React testing setup exists)

---

## AF-011 — CommandPalette shell component

| Field                | Value                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **Objective**        | Add Command Palette presentation component to Desktop Shell                                            |
| **Scope**            | `@apzhub/workspace` or `@apzhub/ui` — modal/list UI; consumes `useCommandRegistry`; design tokens only |
| **Out of scope**     | Global shortcut (AF-012), search algorithm (AF-012), execution E2E (AF-013)                            |
| **Dependencies**     | AF-010                                                                                                 |
| **Estimated effort** | L                                                                                                      |

### Acceptance criteria

- [ ] Palette renders command list from registry
- [ ] Keyboard navigation: up/down, enter to select, escape to close
- [ ] Accessible: dialog role, focus trap, axe no critical violations
- [ ] Uses design tokens — no hardcoded colours
- [ ] Closed by default; open via prop/callback (activation in AF-012)

### Tests

- Component/unit: render with mock registry
- Accessibility: axe on palette open state

---

## AF-012 — Palette activation shortcut and fuzzy search

| Field                | Value                                                                                |
| -------------------- | ------------------------------------------------------------------------------------ |
| **Objective**        | Wire global palette shortcut (Ctrl+Shift+P / Cmd+Shift+P) and improve command search |
| **Scope**            | Shell key listener; fuzzy match on command labels; palette open/close state          |
| **Out of scope**     | ShortcutRegistry for arbitrary commands (AF-014)                                     |
| **Dependencies**     | AF-011                                                                               |
| **Estimated effort** | M                                                                                    |

### Acceptance criteria

- [ ] Default shortcut opens palette per Document 019
- [ ] Fuzzy search ranks matches (simple score or fuse.js if already in monorepo — ADR if new dep)
- [ ] Shortcut does not conflict with existing shell shortcuts (document conflicts)
- [ ] Search debounced ≤ 100ms

### Tests

- Unit: fuzzy rank function
- Component: shortcut triggers open state

---

## AF-013 — Command Palette E2E

| Field                | Value                                                                            |
| -------------------- | -------------------------------------------------------------------------------- |
| **Objective**        | End-to-end verification of palette open, search, and workbench command execution |
| **Scope**            | Playwright spec `spr-004-command-palette.spec.ts`                                |
| **Out of scope**     | New features                                                                     |
| **Dependencies**     | AF-008, AF-012                                                                   |
| **Estimated effort** | M                                                                                |

### Acceptance criteria

- [ ] E2E: open palette via shortcut
- [ ] E2E: search filters commands
- [ ] E2E: selecting `workbench.navigation.reveal` or view command changes shell state or route
- [ ] `pnpm test:e2e` green
- [ ] No regression in existing 15 E2E tests

### Tests

- E2E: minimum 3 scenarios as above

---

## AF-014 — ShortcutRegistry

| Field                | Value                                                                               |
| -------------------- | ----------------------------------------------------------------------------------- |
| **Objective**        | Central registry mapping key chords to command IDs with conflict detection          |
| **Scope**            | `ShortcutRegistry` in command-framework — register, resolve, conflicts, diagnostics |
| **Out of scope**     | Shell listener (AF-015), user preference overrides (Document 023 — future)          |
| **Dependencies**     | AF-003, AF-006                                                                      |
| **Estimated effort** | M                                                                                   |

### Acceptance criteria

- [ ] Register shortcut from PlatformCommand.shortcut at catalogue build
- [ ] `resolve(keyChord)` returns commandId or null
- [ ] Duplicate chord registration reports conflict in diagnostics
- [ ] Normalisation: Ctrl vs Meta per platform (document behaviour)

### Tests

- Unit: register, resolve, conflict detection, normalisation cases

---

## AF-015 — Shell global shortcut listener

| Field                | Value                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Objective**        | Bind ShortcutRegistry to Desktop Shell keydown handler and execute commands                 |
| **Scope**            | Shell integration; excludes palette shortcut if already handled in AF-012 (shared listener) |
| **Out of scope**     | Context-specific shortcuts                                                                  |
| **Dependencies**     | AF-014, AF-008                                                                              |
| **Estimated effort** | M                                                                                           |

### Acceptance criteria

- [ ] Manifest-declared shortcuts execute via CommandExecutor
- [ ] Built-in workbench shortcuts work when declared on commands
- [ ] Does not bypass Workbench API / bridge
- [ ] E2E or integration test for at least one manifest shortcut (requires AF-019 or test fixture)

### Tests

- Unit/integration: mock keydown → execute
- E2E: optional if AF-019 merged — one shortcut scenario

---

## AF-016 — Context menu registry and shell component

| Field                | Value                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**        | Query commands by surface/selection context; render context menu in shell                                                         |
| **Scope**            | `CommandRegistry.list({ surface, selection, context })`; ContextMenu component; wire Selection/Context engine read-only snapshots |
| **Out of scope**     | Business capability context predicates                                                                                            |
| **Dependencies**     | AF-006, AF-010, AF-008                                                                                                            |
| **Estimated effort** | L                                                                                                                                 |

### Acceptance criteria

- [ ] Context query filters commands with `contextWhen` predicate (schema in ADR-0025)
- [ ] Right-click workspace region shows filtered menu
- [ ] Menu selection executes via CommandExecutor
- [ ] Accessible menu pattern (keyboard, aria)

### Tests

- Unit: context filter predicates
- Component: render with mock selection snapshot
- E2E: optional — open menu and select item

---

## AF-017 — Toolbar manifest block and shell component

| Field                | Value                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------- |
| **Objective**        | Support `workbench.toolbar` in manifests; render toolbar regions bound to command IDs |
| **Scope**            | Schema validation (ADR-0025), extraction, Toolbar component in workspace shell        |
| **Out of scope**     | Business capability toolbars beyond scaffold                                          |
| **Dependencies**     | AF-004 (pattern), AF-010, AF-008                                                      |
| **Estimated effort** | L                                                                                     |

### Acceptance criteria

- [ ] Toolbar DTO extracted server-side and filtered with commands
- [ ] Workspace toolbar region renders icon buttons from DTO
- [ ] Click executes command via registry
- [ ] Manifest validation tests for toolbar block

### Tests

- Unit: toolbar extraction and filter
- Component: toolbar render + click handler
- E2E: optional toolbar click executes command

---

## AF-018 — Automation, AI, and voice execution stubs

| Field                | Value                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**        | Define extension interfaces for non-UI actors without full implementation                                                                               |
| **Scope**            | `AutomationCommandGateway`, `AiActionGateway`, `VoiceActionGateway` interfaces; stub implementations returning `NOT_IMPLEMENTED`; developer doc section |
| **Out of scope**     | n8n integration, LLM agents, speech pipeline                                                                                                            |
| **Dependencies**     | AF-006                                                                                                                                                  |
| **Estimated effort** | S                                                                                                                                                       |

### Acceptance criteria

- [ ] Interfaces exported from command-framework
- [ ] CommandExecutor accepts actor `ai-agent` and `voice` — routes to stubs
- [ ] Stubs return typed result with `code: "NOT_IMPLEMENTED"`
- [ ] Extension point documented in governance guide

### Tests

- Unit: stub invocation returns expected shape

---

## AF-019 — Scaffold platform command manifests

| Field                | Value                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Objective**        | Add example `workbench.commands` to existing scaffold manifests (theme, navigation)                 |
| **Scope**            | YAML updates in `packages/theme`, `packages/ui`, or services scaffolds — non-business commands only |
| **Out of scope**     | Real theme toggle service implementation if not existing                                            |
| **Dependencies**     | AF-004, AF-005                                                                                      |
| **Estimated effort** | S                                                                                                   |

### Acceptance criteria

- [ ] At least two scaffold manifests declare valid `workbench.commands`
- [ ] Commands appear in filtered DTO after Runtime bootstrap
- [ ] Manifest Engine / discovery pipeline accepts new block without regression
- [ ] Integration test: bootstrap extracts commands

### Tests

- Integration: discovery + extraction count ≥ 2
- Unit: fixture manifests validate

---

## AF-020 — Application integration

| Field                | Value                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Objective**        | Wire command framework into `apps/web` alongside existing workbench hydration                                     |
| **Scope**            | Server: command DTO in hydration payload; Client: providers, CommandExecutor + bridge bootstrap; transpile config |
| **Out of scope**     | New UI components (prior stories)                                                                                 |
| **Dependencies**     | AF-005, AF-008, AF-010, AF-011+                                                                                   |
| **Estimated effort** | M                                                                                                                 |

### Acceptance criteria

- [ ] `apps/web` hydrates commands on authenticated shell load
- [ ] CommandExecutor + bridge injected into WorkbenchAPI
- [ ] Palette and shortcuts functional in dev and production build
- [ ] `pnpm build` succeeds with command-framework transpiled
- [ ] Health/diagnostics optionally expose command count (non-breaking)

### Tests

- Integration: hydration module test
- Full quality gates: lint, typecheck, build, test, test:coverage, test:e2e

---

## AF-021 — Documentation

| Field                | Value                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| **Objective**        | Document Action Framework for engineers and update sprint artefacts                                     |
| **Scope**            | `docs/architecture/command-framework.md`; update Capability/Workbench guides; CHANGELOG; package README |
| **Out of scope**     | Architecture Baseline v1.0 edits                                                                        |
| **Dependencies**     | AF-020 (or parallel if stories AF-011–AF-017 complete)                                                  |
| **Estimated effort** | M                                                                                                       |

### Acceptance criteria

- [ ] Architecture doc for command-framework subsystems
- [ ] Capability guide updated with `workbench.commands` example
- [ ] Workbench guide updated with bridge integration section
- [ ] CHANGELOG Unreleased section updated
- [ ] `docs/README.md` indexes command-framework doc

### Tests

- N/A (documentation review)

---

## AF-022 — Sprint 004 closeout

| Field                | Value                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Objective**        | Close Sprint 004 with reviews, release notes, and recommended tag                                                      |
| **Scope**            | `docs/sprint/SPR-004-closeout.md`, architecture review, Milestone 4 review, `docs/releases/v0.4.0-action-framework.md` |
| **Out of scope**     | Sprint 005 work                                                                                                        |
| **Dependencies**     | AF-001 through AF-021                                                                                                  |
| **Estimated effort** | M                                                                                                                      |

### Acceptance criteria

- [ ] All AF-001–AF-021 acceptance criteria met
- [ ] Quality gates pass
- [ ] Milestone 4 verdict documented
- [ ] Recommended tag: `v0.4.0-action-framework` (not created until owner instructs)
- [ ] Technical debt register updated

### Tests

- Full CI suite green at closeout

---

## Summary table

| Story  | Title                             | Effort | Depends on              |
| ------ | --------------------------------- | ------ | ----------------------- |
| AF-001 | Technical specifications and ADRs | M      | —                       |
| AF-002 | Package scaffold                  | S      | AF-001                  |
| AF-003 | CommandRegistry core              | M      | AF-002                  |
| AF-004 | Manifest commands validation      | M      | AF-001, AF-003          |
| AF-005 | Server command filter DTO         | M      | AF-003, AF-004          |
| AF-006 | CommandExecutor and actor model   | M      | AF-003                  |
| AF-007 | WorkbenchCommandBridge            | M      | AF-003, AF-006          |
| AF-008 | Workbench API bridge integration  | S      | AF-007                  |
| AF-009 | Built-in command catalogue        | S      | AF-003, AF-007          |
| AF-010 | Client hydration + hook           | M      | AF-005, AF-009          |
| AF-011 | CommandPalette UI                 | L      | AF-010                  |
| AF-012 | Palette shortcut + fuzzy search   | M      | AF-011                  |
| AF-013 | Palette E2E                       | M      | AF-008, AF-012          |
| AF-014 | ShortcutRegistry                  | M      | AF-003, AF-006          |
| AF-015 | Shell shortcut listener           | M      | AF-014, AF-008          |
| AF-016 | Context menu API + UI             | L      | AF-006, AF-010, AF-008  |
| AF-017 | Toolbar manifest + UI             | L      | AF-004, AF-010, AF-008  |
| AF-018 | Automation / AI / voice stubs     | S      | AF-006                  |
| AF-019 | Scaffold command manifests        | S      | AF-004, AF-005          |
| AF-020 | Application integration           | M      | AF-005, AF-008, AF-010+ |
| AF-021 | Documentation                     | M      | AF-020                  |
| AF-022 | Sprint closeout                   | M      | AF-001–AF-021           |

**Total estimated effort:** ~28–38 engineer-days (sequential); parallelisation possible only where dependency graph allows.

---

## Out of scope (entire sprint)

- Business capability commands (Milestone 9+)
- Full RBAC population from auth session (Milestone 8)
- Event Bus audit emission
- Unified Search in palette (Milestone 5)
- User shortcut preference overrides (Document 023)
- Voice pipeline implementation
- Workbench engine redesign
- Architecture Baseline v1.0 modifications

---

## Stop condition

Backlog complete. **Do not implement AF-001** until owner approves.

Next step upon approval:

1. Execute **AF-001** (Technical specifications and ADRs)
2. Record owner approval on AF-001 close
3. Proceed sequentially per dependency graph

---

_SPR-004 Action Framework — Engineering Backlog._
