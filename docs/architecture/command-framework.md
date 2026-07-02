# Action Framework (Command Framework)

> **Package:** `@apzhub/command-framework`  
> **Milestone:** 4 — Action Framework (`v0.4.0-action-framework`)  
> **Authority:** [Document 019](../019-universal-command-palette-action-framework.md) · [ADR-0024](../adr/ADR-0024-command-framework-package.md) · [ADR-0025](../adr/ADR-0025-workbench-commands-manifest.md) · [ADR-0026](../adr/ADR-0026-command-execution-model.md)  
> **Status:** Active — implemented and integrated in `apps/web` (AF-020)

---

## Purpose

The Action Framework is the **single execution model** for user-initiated and automated platform behaviour. Every action — whether triggered from the Command Palette, keyboard shortcut, toolbar, context menu, Workbench API, workflow, AI agent, or voice — flows through one registry, one permission model, and one audit path.

Capabilities declare actions in manifests. The server bootstraps and permission-filters a registry DTO. The client hydrates a read-only registry and executes through a shared `DefaultActionExecutor`.

---

## Architectural position

```text
Business Capabilities (M9+)
        │ manifest workbench.actions
        ▼
Platform Capabilities / Manifest Assets
        │ bootstrapActionRegistry()
        ▼
Action Registry + Shortcut Registry + Toolbar DTO
        │ filterActionRegistryDto() [server]
        ▼
CommandRegistryProvider [client — read-only hydration]
        │
        ├── Command Palette ──┐
        ├── Global Shortcuts ─┤
        ├── Context Menu ─────┼──► useCommandRegistry().execute()
        └── Toolbar ──────────┘
                    │
                    ▼
        DefaultActionExecutor
                    │
        ┌───────────┴───────────┐
        │ workbench-bridge      │ service / event (NOT_IMPLEMENTED)
        ▼                       ▼
WorkbenchCommandBridge    Platform Service (future)
        ▼
Workbench Request Bus → Workbench Manager → Engines
```

**Rule:** No layer bypasses the Workbench API for UI orchestration. Workbench-bridge actions translate to `WorkbenchAction` and publish on the Request Bus — engines are never called directly from shell surfaces.

---

## Action categories

| Category                  | `source`   | Registration                | Example                 |
| ------------------------- | ---------- | --------------------------- | ----------------------- |
| Built-in platform actions | `builtin`  | `PLATFORM_ACTION_CATALOGUE` | `workbench.view.open`   |
| Platform manifest actions | `manifest` | Theme / platform YAML       | `platform.theme.toggle` |
| Capability actions        | `manifest` | Module manifest             | `example.action.demo`   |

Platform Actions (`source: builtin`) are versioned with the platform release. Capability Actions are versioned per capability manifest.

See [Platform Asset specification](../specs/SPR-004-AF-platform-assets.md).

---

## Package structure

```text
packages/command-framework/src/
├── registry/           ActionRegistry, search, context filter
├── executor/           DefaultActionExecutor, actor model
├── bridge/             WorkbenchCommandBridge
├── shortcuts/          ShortcutRegistry, chord normalisation
├── client/             createCommandRegistryFromDto (read-only hydration)
├── react/              CommandRegistryProvider, useCommandRegistry
├── server/             bootstrapActionRegistry, filterActionRegistryDto
├── extraction/         Manifest → descriptors, toolbar regions
├── catalogue/          Platform Action Catalogue
├── gateways/           AI / voice / automation stubs (AF-018)
└── integration/        Workbench executor adapters
```

| Export                             | Purpose                                             |
| ---------------------------------- | --------------------------------------------------- |
| `@apzhub/command-framework`        | Core types, registry, executor, bridge              |
| `@apzhub/command-framework/server` | Server bootstrap, DTO filter, hydration diagnostics |
| `@apzhub/command-framework/react`  | `CommandRegistryProvider`, `useCommandRegistry`     |

---

## Server bootstrap

At authenticated shell startup (`apps/web`):

```text
Runtime.bootstrap()
        ↓
mapPlatformCapabilitiesToActionRecords(registry.findAll())
        ↓
bootstrapActionRegistry({ capabilityRecords })
        ↓
filterActionRegistryDto(dto, permissionAdapter)   ← session-aware
        ↓
ActionRegistryDto → RSC props → CommandRegistryProvider
```

Implementation: `apps/web/lib/command-hydration.ts` — `loadActionRegistryDto()`.

Health reporting (allow-all visibility): `loadActionRegistryHealthSummary()` → `/api/health` `commands` field.

---

## Application integration (AF-020)

```text
(platform)/layout [RSC]
  loadWorkbenchRegistryDto() + loadActionRegistryDto()

ActionWorkbenchShellProvider [client]
  WorkbenchProvider(resolveActionExecutor → createAppActionExecutorBundle)
    CommandRegistryProvider(dto, shared ActionExecutor)
      WorkbenchPage → DesktopShell(
        enableCommandPalette | enableGlobalShortcuts |
        enableContextMenu | enableToolbar
      )
```

`createAppActionExecutorBundle` creates one `DefaultActionExecutor` shared by:

- Workbench API (via `createWorkbenchActionExecutorFromActionExecutor`)
- Command Registry surfaces (via `CommandRegistryProvider`)

---

## Execution pipeline

```text
Action Request (actionId, actor, args)
        ↓
Registry Lookup
        ↓
Permission Check (WorkbenchPermissionAdapter)
        ↓
Actor routing (user | system | ai-agent | voice)
        ↓
Handler Resolution (handlerKind)
        ↓
  workbench-bridge → WorkbenchCommandBridge.toAction()
                  → workbenchExecute(actionToRequest(action))
  service/event   → NOT_IMPLEMENTED (returns structured failure)
        ↓
ActionResult → WorkbenchActionExecutionResult (API adapter)
```

Built-in bridge action IDs (`workbench.view.open`, `workbench.navigation.reveal`, etc.) match catalogue entries. Manifest actions with `handler: workbench-bridge:…` use the **manifest action id** at lookup; bridge resolution currently expects bridge-compatible ids — see technical debt TD-AF20-01.

---

## Workbench surfaces

Surfaces are **presentation-only** in `@apzhub/workspace`. They consume the read-only registry and call `execute()` — no direct engine access.

| Surface          | Package             | Enable flag             | Spec                                                                           |
| ---------------- | ------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| Command Palette  | `@apzhub/workspace` | `enableCommandPalette`  | [SPR-004-AF-palette](../specs/SPR-004-AF-palette.md)                           |
| Global Shortcuts | `@apzhub/workspace` | `enableGlobalShortcuts` | [SPR-004-AF-shortcut-integration](../specs/SPR-004-AF-shortcut-integration.md) |
| Context Menu     | `@apzhub/workspace` | `enableContextMenu`     | [SPR-004-AF-context-menu](../specs/SPR-004-AF-context-menu.md)                 |
| Toolbar          | `@apzhub/workspace` | `enableToolbar`         | [SPR-004-AF-toolbar](../specs/SPR-004-AF-toolbar.md)                           |

Pattern: [APZHUB Workbench Surface Pattern](./APZHUB-Workbench-Surface-Pattern.md).

Default palette shortcut: **Ctrl+Shift+P** (shell-owned, not Action Registry).

---

## Manifest declaration

Canonical block: `workbench.actions` (ADR-0025; legacy alias `workbench.commands`).

```yaml
workbench:
  actions:
    - id: example.action.demo
      label: Run Demo
      handler: workbench-bridge:workbench.navigation.reveal
      permission: example.action.demo
      shortcut: Ctrl+Shift+D
      palette: true
      group: Example
      icon: play
      order: 10
      description: Reveal example navigation item.
  toolbar:
    - region: workspace
      items:
        - commandId: example.action.demo
          icon: play
          label: Run Demo
          order: 10
```

Toolbar regions reference `commandId` values registered in the action registry. Orphan toolbar items are omitted at extraction with diagnostics.

---

## Permission model

- Server: `filterActionRegistryDto(dto, permissionAdapter)` strips disallowed actions before client hydration.
- Executor: `permissionAdapter.can(descriptor.permission)` before dispatch.
- Health endpoint: allow-all adapter for platform-wide counts (not session-filtered).

Same `WorkbenchPermissionAdapter` instance is shared between Workbench and Action Framework in `ActionWorkbenchShellProvider`.

---

## Invocation sources and gateways

| Actor        | Route                                    | Status          |
| ------------ | ---------------------------------------- | --------------- |
| `user`       | DefaultActionExecutor → bridge / handler | ✅              |
| `system`     | Executor with allow-list                 | ✅ structure    |
| `ai-agent`   | AiActionGateway stub                     | NOT_IMPLEMENTED |
| `voice`      | VoiceActionGateway stub                  | NOT_IMPLEMENTED |
| `automation` | AutomationCommandGateway stub            | NOT_IMPLEMENTED |

See [Invocation Sources](../specs/SPR-004-AF-invocation-sources.md) and [Gateway Architecture](../../packages/command-framework/src/gateways/GATEWAY-ARCHITECTURE.md).

---

## Diagnostics

| Location                                    | Data                                              |
| ------------------------------------------- | ------------------------------------------------- |
| `ActionRegistry.getDiagnostics()`           | Registered counts, platform vs capability ids     |
| `buildActionRegistryHydrationDiagnostics()` | Registered vs filtered counts, toolbar, shortcuts |
| `ActionFrameworkDiagnostics` (dev UI)       | Hidden span with `data-*` counts                  |
| `/api/health` → `commands`                  | `ActionFrameworkHealthSummary`                    |

Production UI diagnostics are dev-only. Operators use the health endpoint.

---

## Testing

| Layer       | Focus                                                     |
| ----------- | --------------------------------------------------------- |
| Registry    | Extraction, validation, filter, search                    |
| Executor    | Permission, bridge routing, gateway stubs                 |
| Surfaces    | Palette, shortcuts, context menu, toolbar component tests |
| Integration | `Runtime.bootstrap()` → bootstrap → DTO                   |
| App         | `createAppActionExecutorBundle`, diagnostics component    |
| E2E         | `spr-004-action-framework.spec.ts`                        |

Quality gates: `pnpm lint`, `typecheck`, `build`, `test`, `test:coverage`, `test:e2e`.

---

## Related documentation

| Document                                                                   | Topic                     |
| -------------------------------------------------------------------------- | ------------------------- |
| [Workbench Framework](./workbench-framework.md)                            | Request Bus, engines, API |
| [SPR-004 spec index](../specs/SPR-004-spec-index.md)                       | Story specifications      |
| [Action Framework onboarding](../developer/action-framework-onboarding.md) | How to add actions        |
| [AF-020 completion report](../sprint/AF-020-completion-report.md)          | Application wiring        |
| [v0.4.0 release notes](../releases/v0.4.0-action-framework.md)             | Milestone summary         |

---

_Action Framework architecture — Milestone 4 complete (SPR-004)._
