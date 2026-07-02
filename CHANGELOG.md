# Changelog

All notable changes to APZHUB are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0-workbench-framework] — Milestone 3 Complete

See [Milestone 3 review](./docs/reviews/MILESTONE-003-workbench-framework-review.md) and [release notes](./docs/releases/v0.3.0-workbench-framework.md).

## [0.4.0-action-framework] — Milestone 4 Complete

See [Production readiness review](./docs/reviews/SPR-004-production-readiness-review.md) and [release notes](./docs/releases/v0.4.0-action-framework.md).

### Added (Sprint 004 summary)

- `@apzhub/command-framework` — ActionRegistry, DefaultActionExecutor, WorkbenchCommandBridge, ShortcutRegistry
- Workbench surfaces — Command Palette, global shortcuts, context menu, toolbar in Desktop Shell
- Platform Action Catalogue and manifest action extraction (`workbench.actions`, `workbench.toolbar`)
- Client hydration — `CommandRegistryProvider`, `useCommandRegistry`, read-only registry
- Server bootstrap — `bootstrapActionRegistry`, `filterActionRegistryDto`, hydration diagnostics
- Invocation sources and gateway stubs (AI, voice, automation)
- Application integration — `ActionWorkbenchShellProvider`, shared executor, health `commands` field
- 672 unit tests, 19 E2E tests, 91.46% coverage
- [AF-021 completion report](./docs/sprint/AF-021-completion-report.md) · [Action Framework architecture](./docs/architecture/command-framework.md)

## [Unreleased] — Sprint 005 DF-001

### Added

- [Knowledge Source Architecture](./docs/specs/SPR-005-KDF-knowledge-sources.md) — specification, taxonomy, registry integration, indexing/search overview, AI extension points
- [SPR-005 spec index](./docs/specs/SPR-005-spec-index.md)
- ADR-0027 — Knowledge & Discovery Framework package (`@apzhub/knowledge-discovery-framework`)
- ADR-0028 — Knowledge Source model and taxonomy
- ADR-0029 — Knowledge discovery execution routing (no new pipeline)
- [SPR-005 backlog](./docs/backlog/SPR-005-knowledge-discovery-framework-backlog.md) — renamed from Discovery Framework
- [DF-001 completion report](./docs/sprint/DF-001-completion-report.md)

## [Unreleased] — Sprint 004 AF-021

### Added

- [Action Framework architecture](./docs/architecture/command-framework.md)
- [Production readiness review](./docs/reviews/SPR-004-production-readiness-review.md) — READY WITH OBSERVATIONS
- [Developer onboarding — Action Framework](./docs/developer/action-framework-onboarding.md)
- [v0.4.0-action-framework release notes](./docs/releases/v0.4.0-action-framework.md)
- Governance guide updates — Engineering Handbook, Workbench, Capability, Runtime guides
- README and docs index — Milestone 4 complete
- [AF-021 completion report](./docs/sprint/AF-021-completion-report.md)

## [Unreleased] — Sprint 004 AF-020

### Added

- Action Framework application integration in `apps/web` — `ActionWorkbenchShellProvider` wires `WorkbenchProvider`, `CommandRegistryProvider`, and shared `DefaultActionExecutor`
- Parallel server hydration — `loadWorkbenchRegistryDto()` + `loadActionRegistryDto()` in `(platform)/layout`
- Workbench surfaces enabled on `DesktopShell` — Command Palette, Global Shortcuts, Context Menu, Toolbar
- `createAppActionExecutorBundle` — shared executor for Workbench API and command registry
- `WorkbenchProvider.resolveActionExecutor` hook in `@apzhub/workbench-framework`
- `createWorkbenchActionExecutorFromActionExecutor` adapter in `@apzhub/command-framework`
- Developer diagnostics — `ActionFrameworkDiagnostics` component (dev only)
- Health endpoint — `commands` field with Action Framework hydration summary (`ActionFrameworkHealthSummary`)
- Production transpilation — `@apzhub/command-framework`, `@apzhub/workbench-framework` in `next.config.ts`
- E2E suite — `spr-004-action-framework.spec.ts`
- 4 new unit tests; monorepo total **672 tests**
- [AF-020 completion report](./docs/sprint/AF-020-completion-report.md)

## [Unreleased] — Sprint 004 AF-019

### Added

- Platform Asset manifests — `platform.theme.toggle` + toolbar in `theme.yaml`; `platform.home.navigate` in `platform-home/module.yaml`
- `workbench.toolbar` schema in `@apzhub/platform-runtime` manifest engine
- `extractToolbarRegionsFromCapabilities` — toolbar extraction with orphan filtering
- Auto toolbar extraction wired into `bootstrapActionRegistryFromCapabilities`
- Hydration diagnostics — `toolbarRegionCount`, `toolbarItemCount`, `registeredShortcutCount`
- Platform asset fixtures under `packages/command-framework/fixtures/manifests/`
- Integration test — `Runtime.bootstrap()` → manifest actions, toolbar, shortcuts
- 7 new unit/integration tests; monorepo total **668 tests**
- [AF-019 completion report](./docs/sprint/AF-019-completion-report.md)
- [Platform Asset specification](./docs/specs/SPR-004-AF-platform-assets.md)
- [Platform Asset integration summary](./docs/specs/SPR-004-AF-platform-asset-integration.md)

## [Unreleased] — Sprint 004 AF-018

### Added

- Invocation Source abstraction — `SUPPORTED_INVOCATION_SOURCES`, `PLANNED_INVOCATION_SOURCES`, `resolveInvocationSourceFromActor` in `@apzhub/command-framework`
- Gateway interfaces and stubs — `AiActionGateway`, `VoiceActionGateway`, `AutomationCommandGateway`
- `createDefaultInvocationGatewayRegistry` — DI bundle for gateway stubs
- `DefaultActionExecutor` routes `ai-agent` and `voice` actors through gateways with `phase: "gateway"` diagnostics
- `ActionFrameworkContext.gateways` — composition root gateway injection
- Executor and gateway diagnostics (`buildInvocationGatewayDiagnostics`)
- 11 new unit tests; monorepo total **661 tests**
- [AF-018 completion report](./docs/sprint/AF-018-completion-report.md)
- [Invocation Source specification](./docs/specs/SPR-004-AF-invocation-sources.md)
- [Gateway architecture notes](./packages/command-framework/src/gateways/GATEWAY-ARCHITECTURE.md)

## [Unreleased] — Sprint 004 AF-017

### Added

- Toolbar region filtering — `filterToolbarRegionItems`, `sortToolbarItems` in `@apzhub/command-framework`
- `CommandRegistryProvider` exposes hydrated `toolbar` DTO; `useCommandRegistry()` adds `toolbar` and `get()`
- `Toolbar` presentational component in `@apzhub/ui`
- `ToolbarProvider`, `WorkbenchToolbar` Workbench Surface in `@apzhub/workspace`
- `DesktopShell.enableToolbar` with region and execution callback props
- `buildToolbarDiagnostics` and `TOOLBAR_SURFACE` catalogue entry
- Workbench Surface Pattern documentation (`docs/architecture/APZHUB-Workbench-Surface-Pattern.md`)
- 21 new unit/component tests; monorepo total **650 tests**
- [AF-017 completion report](./docs/sprint/AF-017-completion-report.md)
- [Toolbar specification](./docs/specs/SPR-004-AF-toolbar.md)

## [Unreleased] — Sprint 004 AF-016

### Added

- Context-aware action filtering — `filterActionsByContext`, `matchesActionContextPredicate` in `@apzhub/command-framework`
- Typed `ActionRegistry.list({ surface, selection, context })` options
- `ContextMenu` presentational component in `@apzhub/ui`
- `ContextMenuProvider`, `WorkbenchContextMenu` Workbench Surface in `@apzhub/workspace`
- `DesktopShell.enableContextMenu` with selection/context snapshot props
- `buildContextMenuDiagnostics` and `CONTEXT_MENU_SURFACE` catalogue entry
- Action Visibility extension notes (documentation only)
- 25 new unit/component tests; monorepo total **630 tests**
- [AF-016 completion report](./docs/sprint/AF-016-completion-report.md)
- [Context Menu specification](./docs/specs/SPR-004-AF-context-menu.md)

## [Unreleased] — Sprint 004 AF-015

### Added

- Global shell shortcut listener — `useGlobalShortcuts` in `@apzhub/workspace`
- `DesktopShell.enableGlobalShortcuts` — ShortcutRegistry integration via `GlobalShortcutsLayer`
- React context wiring — `shortcuts`, `shortcutDiagnostics`, `shortcutConflicts` in `CommandRegistryProvider`
- `useShortcutRegistry()` hook in `@apzhub/command-framework/react`
- `buildGlobalShortcutShellDiagnostics` — shell shortcut surface reporting
- `KEYBOARD_SHORTCUT_SURFACE` — workbench surface marked implemented
- APZHUB Registry Pattern documentation (`docs/architecture/APZHUB-Registry-Pattern.md`)
- 12 new unit/component tests; monorepo total **605 tests**
- [AF-015 completion report](./docs/sprint/AF-015-completion-report.md)
- [Shortcut integration summary](./docs/specs/SPR-004-AF-shortcut-integration.md)

## [Unreleased] — Sprint 004 AF-014

### Added

- `ShortcutRegistry` in `@apzhub/command-framework` — chord → action id mapping with conflict detection
- Chord normalisation (`normaliseChord`, `chordFromKeyboardEvent`) — canonical `Alt+Ctrl+Meta+Shift+Key` form
- `registerShortcutsFromActions` / `bootstrapShortcutRegistry` — manifest `shortcut` field support
- `ActionFrameworkContext.shortcuts` — dependency injection root
- Shortcut hydration in `bootstrapActionRegistry` and `createCommandRegistryFromDto`
- Workbench API integration helpers — `resolveShortcutActionId`, `executeShortcutViaWorkbenchApi`
- Input Framework extension notes (`packages/command-framework/src/shortcuts/INPUT-FRAMEWORK.md`)
- 17 new unit/integration tests; monorepo total **593 tests**
- [AF-014 completion report](./docs/sprint/AF-014-completion-report.md)
- [Shortcut Registry specification](./docs/specs/SPR-004-AF-shortcut-registry.md)

## [Unreleased] — Sprint 004 AF-013

### Added

- Command Palette presentation enhancement — icons, descriptions, shortcut badges, disabled rows, group separators
- Optional pinned actions via `pinnedActionIds` on `WorkbenchCommandPalette`
- Enhanced empty and loading states (`CommandPaletteEmptyState`, `CommandPaletteLoadingState`)
- `buildCommandPaletteRows` — pinned and group section layout in `@apzhub/ui`
- `description` and `disabled` optional fields on `ActionDescriptor` and workbench manifest schema
- Ranking strategy extension documentation (`packages/workspace/src/command-palette/RANKING-STRATEGY.md`)
- 15 new unit/component tests; monorepo total **576 tests**
- [AF-013 completion report](./docs/sprint/AF-013-completion-report.md)

## [Unreleased] — Sprint 004 AF-012

### Added

- Global Command Palette shortcut — `Ctrl+Shift+P` (Windows/Linux) / `Cmd+Shift+P` (macOS)
- `useCommandPaletteShortcut` with focus/input safety for unrelated editable fields
- Fuzzy search ranking (`searchActionDescriptors`) in `@apzhub/command-framework`
- Debounced palette query filtering (`COMMAND_PALETTE_QUERY_DEBOUNCE_MS = 75`)
- 17 new unit/component tests; monorepo total 561 tests
- [AF-012 completion report](./docs/sprint/AF-012-completion-report.md)

## [Unreleased] — Sprint 004 AF-011

### Added

- `CommandPalette` presentational component in `@apzhub/ui` — modal, listbox, keyboard navigation
- `WorkbenchCommandPalette` Workbench Surface in `@apzhub/workspace` — consumes `useCommandRegistry()`
- `useCommandPaletteState` — open/close and query state (controlled/uncontrolled)
- `buildCommandPaletteDiagnostics` — surface execution and registry reporting
- `WORKBENCH_SURFACES` catalogue — Command Palette implemented; toolbar/context menu/etc. planned
- `DesktopShell.enableCommandPalette` — optional palette mount
- 18 new unit/component tests; monorepo total 527 tests
- Post-review correction: +17 workbench-framework branch tests; monorepo total **544 tests**; all coverage gates pass
- [AF-011 completion report](./docs/sprint/AF-011-completion-report.md)

## [Unreleased] — Sprint 004 AF-010

### Added

- `createCommandRegistryFromDto()` — hydrate read-only client registry from server DTO
- `ClientActionRegistry` / `ReadOnlyActionRegistry` — no register, replace, or mutation APIs
- `CommandRegistryProvider` + `useCommandRegistry()` React hook (`commands`, `list`, `execute`, `isReady`)
- Client registry diagnostics with platform/capability split and synchronisation extension points
- DTO validation with structured error reporting for invalid payloads
- 19 new unit/component tests; monorepo total 509 tests
- [AF-010 completion report](./docs/sprint/AF-010-completion-report.md)

## [Unreleased] — Sprint 004 AF-009

### Added

- Platform Action Catalogue — 8 built-in workbench actions from `REQUEST_COMMAND_MAP`
- `registerPlatformActionCatalogue` / `bootstrapActionRegistry` — automatic platform bootstrap
- Platform vs capability action distinction in registry and hydration diagnostics
- `version` metadata on `ActionDescriptor` (platform release or capability version)
- `recordPlatformCatalogue` registry diagnostics (`platformActionCount`, `platformActionIds`, etc.)
- 12 new unit tests; monorepo total 490 tests
- [AF-009 completion report](./docs/sprint/AF-009-completion-report.md)

## [Unreleased] — Sprint 004 AF-008

### Added

- Optional `WorkbenchActionExecutor` injection in `createWorkbenchAPI` and `createWorkbenchRequestBus`
- `ActionInvocationService` foundation with documented extension points
- `createWorkbenchActionExecutorAdapter` — bridge + executor + bus publication wiring
- `executeSync` on `DefaultActionExecutor` for synchronous Workbench API contract
- Action execution and invocation diagnostics on `WorkbenchDiagnosticsSnapshot`
- 21 new unit tests; monorepo total 478 tests
- [AF-008 completion report](./docs/sprint/AF-008-completion-report.md)

## [Unreleased] — Sprint 004 AF-007

### Added

- `DefaultWorkbenchCommandBridge` — maps all `REQUEST_COMMAND_MAP` action ids to Workbench actions/requests
- `ActionWorkbenchCommandBridge` interface with `toRequest`, `supports`, diagnostics
- Canonical execution pipeline documentation
- 14 new unit tests; monorepo total 471 tests
- [AF-007 completion report](./docs/sprint/AF-007-completion-report.md)

## [Unreleased] — Sprint 004 AF-006

### Added

- `DefaultActionExecutor` — registry lookup, permission gate, handler dispatch, audit hook
- Structured `ActionResult` with status, code, payload, diagnostics, duration, auditReference
- `ActionContext` extension points (tenant, correlation, trace, locale, timezone, cancellation)
- Actor model: `user` and `system` (allow list); `ai-agent` / `voice` stubs
- 9 new unit tests; monorepo total 457 tests
- [AF-006 completion report](./docs/sprint/AF-006-completion-report.md)

## [Unreleased] — Sprint 004 AF-005

### Added

- `filterActionRegistryDto()` — permission-aware server filter via `WorkbenchPermissionAdapter`
- `bootstrapActionRegistryFromCapabilities()`, `mapPlatformCapabilitiesToActionRecords()`
- `buildActionRegistryHydrationDiagnostics()` — registered, filtered, manifest capability counts
- `apps/web/lib/command-hydration.ts` — bootstrap integration mirroring workbench hydration
- Stable action identity registry contract (documentation)
- 12 new unit tests; monorepo total 448 tests
- [AF-005 completion report](./docs/sprint/AF-005-completion-report.md)

## [Unreleased] — Sprint 004 AF-004

### Added

- `workbench.actions` manifest schema (canonical) with legacy `workbench.commands` alias
- `workbenchActionIdSchema` — dot-notation action ids distinct from capability ids
- `extractActionDescriptorsFromCapabilities`, `populateRegistryFromCapabilities`
- `registerManyAtomic` — atomic batch registration with structured validation errors
- Registry list sort contract: order → group → label → id
- 15 new unit tests; monorepo total 436 tests
- [AF-004 completion report](./docs/sprint/AF-004-completion-report.md)

## [Unreleased] — Sprint 004 AF-003

### Added

- `DefaultActionRegistry` — in-memory action index with validation, immutability, filtering, diagnostics
- `replace()`, `has()`, registry error types, `freezeActionDescriptor()`
- 25 new unit tests; monorepo total 421 tests
- [AF-003 completion report](./docs/sprint/AF-003-completion-report.md)

## [Unreleased] — Sprint 004 AF-002

### Added

- `@apzhub/command-framework` package scaffold — Action model interfaces, placeholder registry/executor, DI context
- 13 unit tests; monorepo total 396 tests
- [AF-002 completion report](./docs/sprint/AF-002-completion-report.md)

## [Unreleased] — Sprint 004 AF-001

### Added (Documentation — AF-001)

- ADR-0024 Command Framework package (`@apzhub/command-framework`)
- ADR-0025 Workbench commands and toolbar manifest extension
- ADR-0026 Command execution and actor model
- [SPR-004 technical spec index](./docs/specs/SPR-004-spec-index.md) and story specifications AF-002–AF-022
- [AF-001 completion report](./docs/sprint/AF-001-completion-report.md)

## [Unreleased] — Platform Baseline v1.0

### Added (Governance — documentation only)

- [Architecture Baseline v1.0](./docs/architecture/APZHUB-Architecture-Baseline-v1.0.md) — frozen architectural reference
- [Engineering Handbook](./docs/governance/APZHUB-Engineering-Handbook.md)
- [Capability Development Guide](./docs/governance/APZHUB-Capability-Development-Guide.md)
- [Workbench Development Guide](./docs/governance/APZHUB-Workbench-Development-Guide.md)
- [Runtime Development Guide](./docs/governance/APZHUB-Runtime-Development-Guide.md)
- [v1.0 Baseline Review](./docs/reviews/APZHUB-v1.0-Baseline-Review.md)
- [v1.0 Readiness Review](./docs/reviews/APZHUB-v1.0-readiness-review.md) — APPROVED FOR PLATFORM DEVELOPMENT
- [SPR-004 Action Framework planning guide](./docs/sprint/SPR-004-action-framework.md)

## [Unreleased] — Sprint 004 Planning

### Added (Planning — no code)

- Sprint 004 Command Framework extension points documented in [SPR-003 closeout](./docs/sprint/SPR-003-closeout.md)

## [0.3.0-workbench-framework] — Sprint 003 Closeout

- **`@apzhub/workbench-framework`** — Workbench Manager, Request Bus, eight engines, Workbench API v1.0
- **Registry-driven shell** — Activity Bar, sidebar, view activation from manifest `workbench.navigation` / `workbench.view`
- **Session Engine** — versioned localStorage persistence with permission re-validation on restore (ADR-0021)
- **Context & Selection engines** — scaffold state orchestration
- **Permission integration** — `AuthWorkbenchPermissionAdapter`, `filterWorkbenchRegistryDto()` (ADR-0023)
- **Document 000 §6.1** — Runtime / Workbench / Capability API layering model
- ADRs 0019–0023 accepted
- [SPR-003 closeout](./docs/sprint/SPR-003-closeout.md)
- [SPR-003 architecture review](./docs/reviews/SPR-003-architecture-review.md)
- [v0.3.0-workbench-framework release notes](./docs/releases/v0.3.0-workbench-framework.md)

**Recommended tag:** `v0.3.0-workbench-framework` (not created until owner instructs)

### Added (SPR-003 Phases 0–7)

- Phase 0: ADRs 0019–0023, architecture refinement
- Phase 1: Workbench Manager, Request Bus, Layout/Panel engines
- Phase 2: Navigation Engine, manifest validation
- Phase 3: Shell wiring — Activity Bar, sidebar, registry hydration
- Phase 4: View Engine, route mapping
- Phase 5: Session Engine, localStorage persistence
- Phase 6: Context Engine, Selection Engine, scaffold permission adapter
- Phase 7: Workbench API v1.0, auth permission adapter, server registry filter
- 383 unit tests, 15 E2E tests at closeout

## [0.2.0-platform-runtime] — Milestone 2 Complete

See [Milestone 2 review](./docs/reviews/MILESTONE-002-platform-runtime-review.md) and [release notes](./docs/releases/v0.2.0-platform-runtime.md).

## [0.2.0-platform-runtime] — Sprint 002 Closeout

- **Runtime integration** — unified `Runtime.bootstrap()` flow; capabilities transition to `active` at platform ready
- **Enhanced diagnostics** — configuration, discovery, manifest, dependency, lifecycle, and health summaries in `Runtime.getDiagnostics()`
- **`Runtime.health()`** and **`Runtime.configuration()`** convenience APIs
- **`PlatformRegistry` facade** — kind-specific getters (`getComponents()`, `getThemes()`, etc.) via `Runtime.registry()`
- **`apps/web` integration** — instrumentation bootstrap via `runtime-init.ts`
- Scaffold manifests: Activity Bar (TD-017), default theme, platform registry service, registry-ready event
- [SPR-002 Phase 9 report](./docs/sprint/SPR-002-phase-9-report.md)
- [SPR-002 architecture review](./docs/reviews/SPR-002-architecture-review.md)
- [v0.2.0-platform-runtime release notes](./docs/releases/v0.2.0-platform-runtime.md)

**Recommended tag:** `v0.2.0-platform-runtime` (not created until owner instructs)

### Added (SPR-002 Phase 8)

- **Runtime Health Manager** — provider-based health aggregation; built-in Runtime, Configuration, Registry, and Lifecycle providers
- APIs: `Health.registerProvider()`, `unregisterProvider()`, `check()`, `checkProvider()`, `snapshot()`, `getStatus()`, `getDiagnostics()`
- Runtime Orchestrator health step replaces placeholder; transitions capabilities to `healthy` after evaluation
- [SPR-002 Phase 8 report](./docs/sprint/SPR-002-phase-8-report.md)
- [Health Manager architecture](./docs/architecture/health-manager.md)

### Added (SPR-002 Phase 7)

- **Runtime Configuration Manager** — authoritative runtime configuration; sole `process.env` access point in platform-runtime
- Precedence: defaults → environment variables → runtime overrides
- APIs: `Configuration.load()`, `validate()`, `get()`, `has()`, `snapshot()`, `metadata()`, `getDiagnostics()`
- Runtime Orchestrator updated to load configuration exclusively via Configuration Manager
- [SPR-002 Phase 7 report](./docs/sprint/SPR-002-phase-7-report.md)
- [Configuration Manager architecture](./docs/architecture/configuration-manager.md)

### Added (SPR-002 Phase 6)

- **Runtime Orchestrator** — coordinates platform startup; replaces internal Bootstrap Engine naming
- **Configuration Engine (minimal)** — `loadRuntimeConfiguration()` for orchestrator options
- **`@apzhub/platform-runtime/server`** — `Runtime.bootstrap()`, `initialise()`, `getStatus()`, `getDiagnostics()`, placeholder `shutdown`/`restart`
- End-to-end pipeline: Discovery → Manifest → Dependency Graph → Registry → Lifecycle → Platform Ready
- Health Manager orchestrator step (placeholder)
- [SPR-002 Phase 6 report](./docs/sprint/SPR-002-phase-6-report.md)
- [Runtime Orchestrator architecture](./docs/architecture/runtime-orchestrator.md)

### Added (SPR-002 Phase 5)

- **Lifecycle Manager** — capability lifecycle transition validation, history, diagnostics, snapshots
- Failure states: `failed`, `disabled`, `degraded` on `CapabilityLifecycleState`
- APIs: `transition`, `canTransition`, `getState`, `getHistory`, `reset`, `markFailed`, `markDisabled`, `snapshot`
- [SPR-002 Phase 5 report](./docs/sprint/SPR-002-phase-5-report.md)
- [Lifecycle Manager architecture](./docs/architecture/lifecycle-manager.md)

### Added (SPR-002 Phase 4)

- **Capability Registry** — in-memory register, lookup, snapshot for `dependencies-resolved` capabilities
- Registration rules: lifecycle gate, manifest re-validation, platform version compatibility, duplicate rejection
- Batch registration with rollback; extension point hooks (`beforeRegister`, `afterUnregister`)
- [SPR-002 Phase 4 report](./docs/sprint/SPR-002-phase-4-report.md)
- [Capability Registry architecture](./docs/architecture/capability-registry.md)

### Added (SPR-002 Phase 3)

- **Discovery Engine** — recursive filesystem scan, YAML load, `discovered` capability definitions
- Configurable discovery roots and ignore rules
- Structured `DiscoveryResult` with diagnostics
- [SPR-002 Phase 3 report](./docs/sprint/SPR-002-phase-3-report.md)

### Added (SPR-002 Phase 2)

- **Capability** runtime abstraction — kind, manifest, metadata, dependencies, lifecycle, health, version
- **Dependency Graph** — missing dependency detection, cycle detection, topological ordering
- Platform seed capabilities (`identity`, `config`, `theme`)
- `resolveCapabilityDependencies()` gate: `VALIDATED` → `DEPENDENCIES_RESOLVED`
- [SPR-002 Phase 2 report](./docs/sprint/SPR-002-phase-2-report.md)

### Added (SPR-002 Phase 1)

- `@apzhub/platform-runtime` — Manifest Engine (14 capability kind schemas, YAML validation)
- Version Manager — semver and platform version constraint checks
- Unified envelope migration for 7 SPR-001 UI `component.yaml` files (ADR-0011)
- Registry test fixtures in `testing/fixtures/registry/`
- `@apzhub/sdk` re-exports capability manifest types and validators
- [SPR-002 Phase 1 report](./docs/sprint/SPR-002-phase-1-report.md)

### Added (SPR-002 Phase 0)

- ADR-0008 through ADR-0017 — Sprint 002 architectural decisions
- ADR-0018 — Platform Runtime package (supersedes ADR-0008)
- `packages/platform-runtime/` package charter
- Phased implementation review gate (ADR-0017)
- [SPR-002 Phase 0 report](./docs/sprint/SPR-002-phase-0-report.md)
- [Architecture update report ARCH-002](./docs/reviews/ARCH-002-platform-runtime-update.md)

### Changed

- Architecture update: `platform-core` renamed to `platform-runtime` (ADR-0018)
- Platform startup lifecycle extended (ADR-0014)
- SPR-002 planning docs aligned to approved decisions (platform-runtime, no REST API, unified manifest envelope)
- ESLint ignores `storybook-static/` build output

## [0.1.0-foundation] — 2026-06-29

### Added

- Docker Compose dev stack (PostgreSQL, Redis, Caddy) on approved ports
- Drizzle migrations and RBAC role seed scaffold
- Better Auth (email/password, sessions, dev registration gate)
- Server-side session validation in middleware (ADR-0003)
- Design tokens including semantic success/warning colours
- `@apzhub/ui` primitives and shell components with Storybook
- Minimal Desktop Shell (Header, Activity Bar, Sidebar, Workspace, Status Bar)
- `GET /api/health` platform health endpoint
- Vitest with 80% coverage gates, Playwright E2E, axe accessibility tests
- Storybook build validation in CI
- Husky pre-commit and commit-msg hooks (lint, typecheck, tests)
- CSP Report-Only and production HSTS security headers
- ADR-0001 through ADR-0007 in `docs/adr/`
- [SPR-001 architecture review](./docs/reviews/SPR-001-architecture-review.md)
- [SPR-001 closeout report](./docs/reviews/SPR-001-closeout.md)

### Changed

- Status Bar connection colours use theme tokens (no hardcoded Tailwind palette)
- Middleware validates sessions via Better Auth get-session (not cookie presence only)
- Root Git repository initialised; nested `apps/web/.git` removed

### Excluded (deferred to Sprint 002+)

- Business modules and OSS engine integrations
- Command palette, search, notifications, context panel, Event Bus runtime
- OAuth, SSO, enforced CSP, Redis session/rate-limit usage
- RBAC enforcement beyond schema

## [0.0.0] — SPR-001 initial

### Added

- Monorepo bootstrap per BUILD-001
- Foundation sprint implementation per SPR-001 guide

[0.1.0-foundation]: https://github.com/apzhub/apz-portal/releases/tag/v0.1.0-foundation
