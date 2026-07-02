# @apzhub/command-framework

Action Framework (Command Framework) for APZHUB — unified action registration and execution.

> **Status:** `integrated` (AF-020) — application wiring complete; surfaces enabled in `apps/web`

## Canonical execution pipeline

```text
Action Request
    ↓
Registry Lookup
    ↓
Permission Check (WorkbenchPermissionAdapter)
    ↓
Execution Context
    ↓
Handler Resolution
    ↓
Workbench Command Bridge
    ↓
Workbench Request
    ↓
Workbench Manager
    ↓
Result
```

## Workbench Command Bridge (AF-007)

```typescript
import {
  createDefaultWorkbenchCommandBridge,
  createDefaultActionExecutor,
} from "@apzhub/command-framework";
```

The bridge translates action ids to `WorkbenchAction` / `WorkbenchRequest`. It does not execute UI, evaluate permissions, or modify Runtime state.

## Client hydration (AF-010)

The server remains authoritative. The browser hydrates a **read-only** registry from a permission-filtered DTO.

```typescript
import {
  createCommandRegistryFromDto,
  CommandRegistryProvider,
  useCommandRegistry,
} from "@apzhub/command-framework/react";

const hydration = createCommandRegistryFromDto(serverDto);

// React
<CommandRegistryProvider dto={serverDto} executor={actionExecutor}>
  <Shell />
</CommandRegistryProvider>

const { commands, list, execute, isReady } = useCommandRegistry();
```

| Origin           | Registration                   | Client mutation |
| ---------------- | ------------------------------ | --------------- |
| Server bootstrap | `bootstrapActionRegistry`      | Not allowed     |
| Client hydration | `createCommandRegistryFromDto` | Read-only       |

Future synchronisation (server ↔ client deltas) is documented in `client/synchronisation.ts` — not implemented in AF-010.

## Platform Action Catalogue (AF-009)

Built-in workbench actions are registered automatically at bootstrap via `bootstrapActionRegistry()`.

| Origin               | `source`   | Versioned by                                           |
| -------------------- | ---------- | ------------------------------------------------------ |
| Platform catalogue   | `builtin`  | Platform release (`ACTION_FRAMEWORK_PLATFORM_VERSION`) |
| Capability manifests | `manifest` | Capability `version` field                             |

```typescript
import {
  bootstrapActionRegistry,
  registerPlatformActionCatalogue,
  PLATFORM_ACTION_CATALOGUE,
} from "@apzhub/command-framework";

// Full bootstrap: platform catalogue + capability manifests (atomic per phase)
const result = bootstrapActionRegistry({ capabilityRecords });

// Platform catalogue only
registerPlatformActionCatalogue(registry);
```

`registerBuiltInWorkbenchCommands` is a deprecated alias for `registerPlatformActionCatalogue`.

## Manifest-driven registration

Capabilities declare actions under `workbench.actions` (canonical) or legacy `workbench.commands` (ADR-0025 alias).

```typescript
import {
  bootstrapActionRegistry,
  bootstrapActionRegistryFromCapabilities,
  filterActionRegistryDto,
  mapPlatformCapabilitiesToActionRecords,
  createDefaultActionRegistry,
} from "@apzhub/command-framework/server";
```

Registry list order contract: **order → group → label → id**.

## Action execution (AF-006)

```typescript
import {
  createDefaultActionExecutor,
  createDefaultActionRegistry,
} from "@apzhub/command-framework";
import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

const executor = createDefaultActionExecutor({
  registry: createDefaultActionRegistry(),
  permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
});
```

Permission gate delegates to `WorkbenchPermissionAdapter.can()` — the executor never evaluates permissions directly.

## Stable action identity

- Action ids are immutable after registration.
- Released action ids shall not be reused.
- Replacement occurs through explicit migration.
- Deprecated ids may remain as aliases in future releases where appropriate.

## Exports

| Entry                              | Purpose                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `@apzhub/command-framework`        | Core types, ActionRegistry, DefaultActionExecutor, DI                         |
| `@apzhub/command-framework/server` | Server DTO filter, bootstrap (platform + capabilities), hydration diagnostics |
| `@apzhub/command-framework/react`  | `CommandRegistryProvider`, `useCommandRegistry`, client hydration             |

## ActionRegistry immutability

Registered `ActionDescriptor` values are **deep-frozen**. Do not mutate descriptors in place.
Use `DefaultActionRegistry.replace()` to update metadata for an existing action id.

See [SPR-004 specs](../../docs/specs/SPR-004-spec-index.md).

## Application integration (AF-020)

```typescript
// apps/web — shared executor bundle
import { createAppActionExecutorBundle } from "@/lib/create-app-action-executor";

// Server hydration
import { loadActionRegistryDto } from "@/lib/command-hydration";

// Client shell
import { ActionWorkbenchShellProvider } from "@/app/(platform)/action-workbench-shell-provider";
```

Desktop Shell surfaces require `CommandRegistryProvider` ancestor and `enableCommandPalette` / `enableGlobalShortcuts` / `enableContextMenu` / `enableToolbar` flags.

Health: `GET /api/health` → `commands` field (`ActionFrameworkHealthSummary`).

See [command-framework architecture](../../docs/architecture/command-framework.md) and [onboarding](../../docs/developer/action-framework-onboarding.md).
