# SPR-004 — Foundation Technical Specifications (AF-002 – AF-009)

> **Stories:** AF-002 through AF-009  
> **Package:** `@apzhub/command-framework`  
> **ADRs:** [0024](../adr/ADR-0024-command-framework-package.md) · [0025](../adr/ADR-0025-workbench-commands-manifest.md) · [0026](../adr/ADR-0026-command-execution-model.md)

---

## AF-002 — Package scaffold

### Objective

Create monorepo package with build tooling; no business logic.

### Files

```text
packages/command-framework/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── src/
    ├── index.ts              # export COMMAND_FRAMEWORK_STATUS = "scaffold"
    └── index.test.ts
```

### package.json requirements

- `"name": "@apzhub/command-framework"`
- `"exports"`: `"."`, `"./server"`, `"./react"` (react stub re-export or empty)
- Dependencies: `@apzhub/workbench-framework` (types only — bridge interface)
- **No** `react` in core dependencies
- `"type": "module"`

### Acceptance

- Workspace entry in `pnpm-workspace.yaml` (if not globbed)
- `pnpm --filter @apzhub/command-framework test` passes
- Included in root `pnpm typecheck`

---

## AF-003 — CommandRegistry core

### Objective

In-memory command index.

### Types

```typescript
type CommandHandlerKind = "workbench-bridge" | "service" | "event";

interface PlatformCommand {
  readonly id: string;
  readonly label: string;
  readonly handler: string;
  readonly handlerKind: CommandHandlerKind;
  readonly permission?: string;
  readonly shortcut?: string;
  readonly palette?: boolean;
  readonly icon?: string;
  readonly group?: string;
  readonly order?: number;
  readonly contextWhen?: CommandContextPredicate;
  readonly source: "builtin" | "manifest";
  readonly capabilityId?: string;
}

interface CommandRegistryListOptions {
  readonly query?: string;
  readonly palette?: boolean;
  readonly surface?: string;
  readonly selection?: unknown;
  readonly context?: unknown;
}
```

### CommandRegistry methods

- `register(command: PlatformCommand): void` — throws on duplicate id
- `registerMany(commands: PlatformCommand[]): void`
- `get(id: string): PlatformCommand | undefined`
- `list(options?: CommandRegistryListOptions): PlatformCommand[]`
- `clear(): void`
- `getDiagnostics(): CommandRegistryDiagnostics`

### Files

```text
src/registry/types.ts
src/registry/command-registry.ts
src/registry/command-registry.test.ts
```

### Tests

Minimum 12 unit cases: register, duplicate, get, list all, list filter, clear, diagnostics.

Coverage: branch ≥ 85% on registry module.

---

## AF-004 — Manifest commands validation and extraction

### Objective

Validate and extract `workbench.commands` / `workbench.toolbar` from capabilities.

### Manifest Engine change (additive)

File: `packages/platform-runtime/src/manifest-engine/schemas/workbench.ts`

Add Zod schemas per ADR-0025. Extend existing `workbenchSchema` — do not replace navigation/view schemas.

### Extraction

File: `packages/command-framework/src/extraction/extract-commands.ts`

```typescript
function extractCommandsFromCapabilities(
  capabilities: readonly CapabilityLike[],
): CommandDto[];

function extractToolbarFromCapabilities(
  capabilities: readonly CapabilityLike[],
): ToolbarDto[];
```

`CapabilityLike` — minimal interface reading normalised manifest payload; avoid importing full runtime in client bundle. Server extraction receives registry snapshot from runtime.

### Validation behaviour

- Invalid command in capability → collect error; capability skipped or whole manifest rejected per ADR-0013 fail-fast for bootstrap (match existing workbench navigation pattern)
- Duplicate command ids across capabilities → first wins with diagnostic warning OR fail — **decision: fail at extraction with aggregated error** for CI visibility

### Tests

- YAML fixtures in `packages/command-framework/fixtures/manifests/`
- Valid commands, missing label, duplicate ids, toolbar orphan commandId

---

## AF-005 — Server command filter DTO

### Objective

Permission-filter commands before client hydration.

### File

`packages/command-framework/src/server/filter-command-registry-dto.ts`

```typescript
export interface CommandDto {
  /* serialisable subset of PlatformCommand */
}
export interface CommandRegistryDto {
  readonly commands: readonly CommandDto[];
  readonly toolbar: readonly ToolbarDto[];
}

export function filterCommandRegistryDto(
  dto: CommandRegistryDto,
  adapter: WorkbenchPermissionAdapter,
): CommandRegistryDto;
```

Import `WorkbenchPermissionAdapter` from `@apzhub/workbench-framework` server export or permission module — match existing `filterWorkbenchRegistryDto` import path.

### Server export

`packages/command-framework/src/server/index.ts` — no React, no DOM.

### Tests

- Allow-all adapter passes all
- Mock adapter denying `platform.theme.manage` filters matching commands
- Toolbar items referencing filtered commands removed

---

## AF-006 — CommandExecutor and actor model

### Objective

Unified execution with permission gate and audit hook.

### File

`packages/command-framework/src/executor/command-executor.ts`

Constructor dependencies:

```typescript
interface CommandExecutorDependencies {
  readonly registry: CommandRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly bridge: WorkbenchCommandBridge;
  readonly workbenchExecute: (action: WorkbenchAction) => WorkbenchRequestResult;
  readonly auditHook?: CommandAuditHook;
  readonly serviceGateway?: ServiceCommandGateway; // stub default
}
```

`workbenchExecute` injected to avoid circular package dependency on full WorkbenchAPI — app provides closure calling `bus.publish(actionToRequest(action))` or API method.

### Actor handling

| Actor      | Sprint 004 behaviour                                                      |
| ---------- | ------------------------------------------------------------------------- |
| `user`     | Full dispatch                                                             |
| `system`   | Dispatch only if command id in `systemAllowList` (config); else FORBIDDEN |
| `ai-agent` | Route to AiActionGateway stub                                             |
| `voice`    | Route to VoiceActionGateway stub                                          |

### Tests

- Success: workbench-bridge command
- FORBIDDEN: permission denied
- NOT_FOUND: unknown id
- NOT_IMPLEMENTED: service handler
- Audit hook called on every attempt

---

## AF-007 — WorkbenchCommandBridge

### Objective

Map command IDs to WorkbenchAction.

### File

`packages/command-framework/src/bridge/default-workbench-command-bridge.ts`

Implement `WorkbenchCommandBridge` from `@apzhub/workbench-framework`.

Mapping table derived from `REQUEST_COMMAND_MAP` — for each command id, define payload field mapping:

| commandId                     | Required payload fields |
| ----------------------------- | ----------------------- |
| `workbench.view.open`         | `viewId`                |
| `workbench.view.close`        | `viewId`                |
| `workbench.view.focus`        | `viewId`                |
| `workbench.panel.open`        | `panelId`               |
| `workbench.panel.close`       | `panelId`               |
| `workbench.navigation.reveal` | `navId`                 |
| `workbench.context.set`       | `context`               |
| `workbench.selection.set`     | `selection`             |

Return `null` for unknown ids.

### Tests

- One test per built-in command id
- Invalid payload returns null or throws per spec (recommend null + executor INVALID_ARGS)

---

## AF-008 — Workbench API bridge integration

### Objective

Optional CommandExecutor injection in `createWorkbenchAPI`.

### File change

`packages/workbench-framework/src/api/create-workbench-api.ts`

Add optional parameter:

```typescript
interface CreateWorkbenchAPIOptions {
  bus: WorkbenchRequestBus;
  executor?: Pick<CommandExecutor, "execute">; // minimal interface to avoid hard dep
}
```

When `executor` provided, `executeAction` calls:

```typescript
executor.execute({ commandId: action.id, args: actionPayload(action), actor: "user" });
```

When absent, existing `actionToRequest` + `bus.publish` path unchanged.

**Dependency note:** Use interface type defined in workbench-framework or duplicate minimal interface to avoid command-framework ↔ workbench-framework circular dependency at build time. Preferred: define `WorkbenchActionExecutor` interface in workbench-framework `interfaces/command-evolution.ts` accepting generic execute signature.

### Tests

- Existing API tests pass without executor
- New test: mock executor receives execute on executeAction

### Scope limit

**Do not** modify Workbench Manager. **Do not** change public WorkbenchAPI method signatures.

---

## AF-009 — Built-in command catalogue

### Objective

Register all `REQUEST_COMMAND_MAP` commands at bootstrap.

### File

`packages/command-framework/src/registry/built-in-commands.ts`

```typescript
export function registerBuiltInWorkbenchCommands(registry: CommandRegistry): void;
```

Each command:

- `id` from map values
- `label` — human-readable (e.g. "Open View")
- `handler`: `workbench-bridge:{id}`
- `handlerKind`: `workbench-bridge`
- `palette`: true for user-facing; false for internal diagnostics if any
- `source`: `builtin`

### Tests

- Count equals `Object.values(REQUEST_COMMAND_MAP).length`
- All ids unique
- list({ palette: true }) includes navigation/view commands

---

_Foundation specifications — implement AF-002 through AF-009 sequentially._
