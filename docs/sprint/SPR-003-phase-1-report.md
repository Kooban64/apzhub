# SPR-003 — Phase 1 Report

> **Date:** 2026-06-28  
> **Sprint:** SPR-003 — Workbench Framework  
> **Phase:** 1 — Workbench Framework Foundation  
> **Prerequisite:** [Phase 0 ADR Report](../reviews/SPR-003-phase-0-adr-report.md) — approved  
> **Recommendation:** **READY FOR PHASE 2** (awaiting architecture review)

---

## Summary

Phase 1 delivers the `@apzhub/workbench-framework` package foundation: **Workbench Manager**, **Request Bus**, **Layout Engine** scaffold, **Panel Engine** scaffold, shared interfaces, workbench state model, dependency injection points, and unit tests.

Terminology adopted per owner refinement: subsystems are **engines** coordinated by the **Workbench Manager**. Capabilities interact only via the **Request Bus** (`publish()`).

**No Desktop Shell changes.** No Navigation, View, Session, Dock, Context, or Selection engine behaviour. No business capabilities.

---

## Architecture compliance

| Rule                                            | Status                                       |
| ----------------------------------------------- | -------------------------------------------- |
| Capabilities publish Workbench Requests only    | ✅ `WorkbenchCapabilityHandle.publish()`     |
| Request Bus is sole capability entry point      | ✅ `WorkbenchRequestBusImpl.publish()`       |
| Workbench Manager routes to engines             | ✅ `REQUEST_ENGINE_MAP` + engine registry    |
| Engines do not depend on each other directly    | ✅ Panel/Layout coordinated by Manager only  |
| No React in capability orchestration path       | ✅ Package has no React dependency           |
| No `@apzhub/platform-runtime` in client exports | ✅ Runtime-free client bundle                |
| No Desktop Shell modifications                  | ✅ `@apzhub/workspace` unchanged             |
| Phase 1 scope boundaries respected              | ✅ Deferred engines return `NOT_IMPLEMENTED` |

### Engine hierarchy (Phase 1)

```text
Request Bus (publish)
        │
        ▼
Workbench Manager
        │
        ├── Layout Engine      ✅ scaffold + region visibility
        ├── Panel Engine       ✅ openPanel / closePanel
        ├── View Engine        ⏸ scaffold only
        ├── Navigation Engine  ⏸ scaffold only
        ├── Session Engine     ⏸ scaffold only
        ├── Dock Engine        ⏸ scaffold only
        ├── Context Engine     ⏸ scaffold only
        └── Selection Engine   ⏸ scaffold only
```

---

## Package delivered

| Item          | Value                                                 |
| ------------- | ----------------------------------------------------- |
| Package       | `@apzhub/workbench-framework`                         |
| Path          | `packages/workbench-framework/`                       |
| Client export | `@apzhub/workbench-framework`                         |
| Server export | `@apzhub/workbench-framework/server` (DTO types only) |
| Singleton     | `Workbench` (default Request Bus)                     |

### Files created

```text
packages/workbench-framework/
  package.json
  tsconfig.json
  src/
    index.ts
    server.ts
    interfaces/
      types.ts
      requests.ts
      permission-adapter.ts
      dependencies.ts
    permission/
      allow-all-adapter.ts
    engines/
      layout-engine/layout-engine.ts
      panel-engine/panel-engine.ts
      scaffold-engines.ts
    workbench-manager/workbench-manager.ts
    request-bus/request-bus.ts
    **/*.test.ts (6 test files)
```

---

## APIs

### Request Bus (capability entry)

```typescript
import { Workbench, createWorkbenchRequestBus } from "@apzhub/workbench-framework";

const result = Workbench.publish({
  type: "openPanel",
  panelId: "context",
  tabKey: "activity",
});
const state = Workbench.getState();
const unsubscribe = Workbench.subscribe((next) => {
  /* render */
});

const { workbench } = Workbench.createCapabilityContext();
workbench.publish({ type: "closePanel", panelId: "sidebar" });
```

### Workbench Manager (internal / shell integration)

```typescript
import { createWorkbenchManager } from "@apzhub/workbench-framework";

const manager = createWorkbenchManager({
  dependencies: { permissionAdapter: myAdapter },
});
manager.handleRequest({ type: "openPanel", panelId: "sidebar" });
```

### Workbench Request types (all defined; Phase 1 routes panel only)

| Request                | Engine     | Phase 1           |
| ---------------------- | ---------- | ----------------- |
| `openPanel`            | Panel      | ✅                |
| `closePanel`           | Panel      | ✅                |
| `openView`             | View       | `NOT_IMPLEMENTED` |
| `closeView`            | View       | `NOT_IMPLEMENTED` |
| `focusView`            | View       | `NOT_IMPLEMENTED` |
| `revealNavigationItem` | Navigation | `NOT_IMPLEMENTED` |
| `setContext`           | Context    | `NOT_IMPLEMENTED` |
| `setSelection`         | Selection  | `NOT_IMPLEMENTED` |

### Dependency injection

```typescript
interface WorkbenchDependencies {
  permissionAdapter: WorkbenchPermissionAdapter;
}

interface CreateWorkbenchOptions {
  dependencies?: Partial<WorkbenchDependencies>;
}
```

Default: `AllowAllWorkbenchPermissionAdapter` ([ADR-0023](../adr/ADR-0023-workbench-permission-adapter.md)).

### Server DTO (hydration types)

```typescript
import {
  createEmptyWorkbenchRegistryDto,
  type WorkbenchRegistryDto,
} from "@apzhub/workbench-framework/server";
```

---

## State model

Aggregated `WorkbenchState`:

| Slice        | Engine     | Phase 1 content                               |
| ------------ | ---------- | --------------------------------------------- |
| `layout`     | Layout     | Six shell regions; visibility flags           |
| `panels`     | Panel      | Sidebar/context collapse, width, activeTabKey |
| `navigation` | Navigation | `activeWorkspaceId: "home"`, empty items      |
| `views`      | View       | Empty openViews                               |
| `session`    | Session    | `{ hydrated: false, schemaVersion: "1.0" }`   |
| `dock`       | Dock       | Empty splitRatios                             |
| `context`    | Context    | No activeKey                                  |
| `selection`  | Selection  | Empty items                                   |

### Default panel geometry

```typescript
{
  sidebar: { collapsed: false, width: 280 },
  context: { collapsed: true, width: 320 },
}
```

### Layout coordination

When Panel Engine opens/closes a panel, Workbench Manager syncs layout region visibility (`sidebar` / `context`) without direct engine-to-engine calls.

---

## Request Bus

Implementation: `WorkbenchRequestBusImpl` in `src/request-bus/request-bus.ts`.

| Behaviour          | Detail                                                                        |
| ------------------ | ----------------------------------------------------------------------------- |
| Transport          | Typed in-process ([ADR-0020](../adr/ADR-0020-workbench-request-transport.md)) |
| Dispatch           | Synchronous `publish()` → `WorkbenchManager.handleRequest()`                  |
| Permission gate    | Before engine delegation                                                      |
| Subscribers        | Notified when aggregated state changes                                        |
| Capability context | `createCapabilityContext()` exposes publish-only handle                       |

---

## Test results

| Metric                           | Result                       |
| -------------------------------- | ---------------------------- |
| Test files (workbench-framework) | 6                            |
| New unit tests                   | 24                           |
| Total unit tests (repo)          | **284 passed**               |
| E2E tests                        | **9 passed** (no regression) |

### Workbench-framework test coverage

| Module                | Lines     | Functions | Branches  |
| --------------------- | --------- | --------- | --------- |
| layout-engine         | 96.4%     | 87.5%     | 100%      |
| panel-engine          | 97.1%     | 87.5%     | 100%      |
| workbench-manager     | 93.5%     | 93.8%     | 90%       |
| request-bus           | 92.6%     | 87.5%     | 100%      |
| permission adapter    | 100%      | 100%      | 100%      |
| scaffold-engines      | 97.8%     | 96.4%     | 100%      |
| **Package aggregate** | **≥ 80%** | **≥ 80%** | **≥ 80%** |

---

## Quality gates

| Gate                 | Result                   |
| -------------------- | ------------------------ |
| `pnpm lint`          | ✅ Pass                  |
| `pnpm typecheck`     | ✅ Pass                  |
| `pnpm test`          | ✅ 284 passed            |
| `pnpm test:coverage` | ✅ Pass (thresholds met) |
| `pnpm test:e2e`      | ✅ 9 passed              |

---

## Technical debt

| ID       | Item                                                                                             | Target phase           |
| -------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| TD-P1-01 | Desktop Shell not wired to Workbench state                                                       | Phase 1 exit / Phase 2 |
| TD-P1-02 | `apps/web` does not bootstrap `Workbench` singleton                                              | Phase 2–3              |
| TD-P1-03 | Deferred engines return `NOT_IMPLEMENTED`                                                        | Phases 2–7             |
| TD-P1-04 | No manifest `workbench` block validation yet                                                     | Phase 2                |
| TD-P1-05 | `AuthWorkbenchPermissionAdapter` not implemented                                                 | Phase 7                |
| TD-P1-06 | `getManager()` on Request Bus is test/integration escape hatch — document or restrict            | Phase 2                |
| TD-P1-07 | Workspace scope lives in Navigation Engine — update remaining docs referencing Workspace Manager | Ongoing                |

---

## Recommendation for Phase 2

### **READY FOR PHASE 2** (awaiting architecture review)

Phase 2 should implement:

1. **`workbench` manifest block** validation in Manifest Engine ([ADR-0022](../adr/ADR-0022-navigation-manifest-extension.md))
2. **`PlatformRegistry.getWorkbenchNavItems()`** helper (runtime extension)
3. **Navigation Engine** behaviour — registry-driven nav model
4. Scaffold manifest updates with `workbench.navigation` metadata

### Phase 2 must not

- Wire Activity Bar UI (Phase 3)
- Implement View Engine tab behaviour (Phase 4)
- Modify Desktop Shell beyond minimal props (Phase 3)

### Stop condition

**Stop after architecture review** before Phase 2 implementation begins.

---

## Next steps

1. Architecture review of Phase 1 deliverables
2. Owner approves Phase 2 start
3. Execute Phase 2 — Navigation Engine + manifest extensions
4. Produce Phase 2 report at phase exit

---

_SPR-003 Phase 1 — complete. Awaiting architecture review before Phase 2._
