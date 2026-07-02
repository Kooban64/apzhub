# ADR-0024 — Command Framework Package

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-004 — AF-001  
> **Decided by:** Project owner (Sprint 004 authorisation)  
> **Related:** [ADR-0019](./ADR-0019-workbench-framework-package.md) · [ADR-0020](./ADR-0020-workbench-request-transport.md) · [Document 019](../019-universal-command-palette-action-framework.md) · [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md)

## Problem

Sprint 004 delivers the **Action Framework** — unified command registration, execution, Command Palette, keyboard shortcuts, context menus, and toolbar bindings. Baseline v1.0 establishes Workbench API v1.0, `WorkbenchAction` types, and a `WorkbenchCommandBridge` interface stub in `@apzhub/workbench-framework`.

Two packaging options exist:

1. **Option A** — New `@apzhub/command-framework` package (Platform Capability layer).
2. **Option B** — Extend `@apzhub/workbench-framework` with command registry and executor logic.

Extending workbench-framework would blur the Platform Capability boundary, increase package size, and mix presentation orchestration (Workbench) with command registration and execution policy (Command Framework).

## Decision

Create a **new package**:

| Item           | Value                                                         |
| -------------- | ------------------------------------------------------------- |
| Package path   | `packages/command-framework/`                                 |
| npm name       | `@apzhub/command-framework`                                   |
| Primary export | `@apzhub/command-framework`                                   |
| Server export  | `@apzhub/command-framework/server`                            |
| React export   | `@apzhub/command-framework/react` (optional subpath — AF-010) |

### Package responsibilities

`@apzhub/command-framework` owns:

- **CommandRegistry** — in-memory command index; register, list, get, diagnostics
- **CommandExecutor** — permission-gated execution with actor attribution ([ADR-0026](./ADR-0026-command-execution-model.md))
- **ShortcutRegistry** — key chord → commandId mapping; conflict detection
- **PlatformCommand** types — normalised command envelope
- **Manifest extraction** — `workbench.commands` and `workbench.toolbar` DTOs ([ADR-0025](./ADR-0025-workbench-commands-manifest.md))
- **Server filter** — `filterCommandRegistryDto()` mirroring workbench permission filter
- **WorkbenchCommandBridge** implementation — maps command IDs to `WorkbenchAction`
- **Extension interfaces** — automation, AI, voice gateways (stubs in Sprint 004)
- **Palette query API** — list/filter commands (not palette UI — UI remains shell)

### Package does **not** own

- Workbench Manager or engines (remain `@apzhub/workbench-framework`)
- Platform Runtime orchestration (remains `@apzhub/platform-runtime`)
- Command Palette, context menu, toolbar **UI components** (remain `@apzhub/workspace` / `@apzhub/ui`)
- Authentication implementation (remains `@apzhub/auth`)
- Event Bus audit emission (deferred — hook only)
- Business capability command handlers (Milestone 9+)

### Dependency direction

```text
apps/web
    ↓
@apzhub/workspace · @apzhub/ui          (presentation — palette UI, menus, toolbar)
    ↓
@apzhub/command-framework/react         (hooks — optional)
    ↓
@apzhub/command-framework               (registry, executor, bridge)
    ↓
@apzhub/workbench-framework             (WorkbenchAction, WorkbenchCommandBridge interface)
    ↓
react (react export only)

Server (apps/web hydration, route handlers):
    ↓
@apzhub/command-framework/server
    ↓
@apzhub/platform-runtime/server         (registry read — extraction input)
@apzhub/workbench-framework/server      (shared permission adapter types)
```

**Rules:**

1. `@apzhub/command-framework` **must not** import Workbench Manager or engines — only public Workbench API types and `WorkbenchCommandBridge` interface.
2. `@apzhub/workbench-framework` **must not** depend on `@apzhub/command-framework` in core exports. App bootstrap wires bridge at composition root (AF-008).
3. `@apzhub/platform-runtime` **must not** depend on `@apzhub/command-framework`. Extraction reads registry output; no reverse dependency.
4. `@apzhub/command-framework` core **must not** depend on React. React hooks live in `/react` subpath only.

### Public API surface (planned)

```typescript
// @apzhub/command-framework

export type PlatformCommand = { ... };
export class CommandRegistry { ... }
export class CommandExecutor { ... }
export class ShortcutRegistry { ... }
export class DefaultWorkbenchCommandBridge implements WorkbenchCommandBridge { ... }

export function extractCommandsFromCapabilities(...): CommandDto[];
export function registerBuiltInWorkbenchCommands(registry: CommandRegistry): void;
```

```typescript
// @apzhub/command-framework/server

export function filterCommandRegistryDto(
  commands: readonly CommandDto[],
  adapter: WorkbenchPermissionAdapter,
): CommandDto[];
```

```typescript
// @apzhub/command-framework/react (AF-010)

export function useCommandRegistry(): CommandRegistryHookResult;
export function createCommandRegistryFromDto(dto: CommandRegistryDto): CommandRegistry;
```

### Internal layout (AF-002 onward)

```text
packages/command-framework/src/
├── registry/           CommandRegistry, PlatformCommand types
├── executor/           CommandExecutor, actor model, audit hook
├── shortcuts/          ShortcutRegistry
├── bridge/             DefaultWorkbenchCommandBridge
├── extraction/         Manifest command/toolbar extraction
├── server/             filterCommandRegistryDto
├── react/              useCommandRegistry (AF-010)
├── gateways/           Automation, AI, voice stubs (AF-018)
└── index.ts            Public exports
```

### Relationship to Document 019

Document 019 defines Command Palette UX and philosophy. This package implements the **Action Engine** backend — registration, discovery, execution routing. Shell presents palette; framework supplies command list and executor.

### Relationship to Baseline v1.0 API layering

| Layer          | Sprint 004 addition                                                  |
| -------------- | -------------------------------------------------------------------- |
| Capability API | Manifest `workbench.commands`, `workbench.toolbar`                   |
| Workbench API  | `executeAction()` routes through optional injected executor (AF-008) |
| Runtime API    | Unchanged — no command logic in runtime                              |

Command Framework sits **between** Capability API (manifest declarations) and Workbench API (UI orchestration execution).

## Alternatives

| Alternative                                        | Why rejected                                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Extend `@apzhub/workbench-framework`               | Violates single-responsibility; bloats workbench package; couples Platform Capability to Workbench |
| `@apzhub/sdk` only                                 | SDK is types/helpers; not runtime registry/executor                                                |
| Separate packages per concern (palette, shortcuts) | Premature fragmentation; one cohesive Action Framework preferred for Sprint 004                    |
| Runtime-owned command registry                     | Runtime is UI-agnostic; commands are user-interaction concern                                      |

## Consequences

- AF-002 scaffolds package with no production logic
- AF-003–AF-009 implement core registry, extraction, filter, executor, bridge
- AF-008 adds optional `CommandExecutor` injection to `createWorkbenchAPI()` at app bootstrap — minimal workbench diff, no manager redesign
- AF-010+ adds React subpath
- `apps/web` transpiles `@apzhub/command-framework` in Next.js config (AF-020)
- Architecture Baseline v1.0 is **not modified** — this ADR extends baseline through approved ADR process
- Future Milestone 5 (Search) may query CommandRegistry for palette search fusion — extension point only
