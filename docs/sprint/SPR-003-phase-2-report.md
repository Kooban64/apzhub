# SPR-003 — Phase 2 Report

> **Date:** 2026-06-28  
> **Sprint:** SPR-003 — Workbench Framework  
> **Phase:** 2 — Navigation Engine  
> **Prerequisite:** [Phase 1 report](./SPR-003-phase-1-report.md) — approved  
> **Recommendation:** **READY FOR PHASE 3** (awaiting architecture review)

---

## Summary

Phase 2 delivers a **fully manifest-driven Navigation Engine**. Capabilities contribute navigation metadata through the additive `workbench.navigation` manifest block. The Navigation Engine consumes contributions and produces the workbench navigation model — **no hardcoded navigation entries**.

Manifest validation is implemented in `@apzhub/platform-runtime`. Registry extraction is available via `PlatformRegistry.getWorkbenchNavigationContributions()`.

**No Activity Bar UI wiring.** No Desktop Shell changes. No Command Framework implementation.

---

## Navigation architecture

```text
Capability manifest (workbench.navigation)
        │
        ▼
Manifest Engine validation (Zod — ADR-0022)
        │
        ▼
Platform Registry extraction (active capabilities)
        │
        ▼
Navigation contributions → Navigation Engine.loadContributions()
        │
        ├── Permission filtering (WorkbenchPermissionAdapter)
        ├── Ordering (manifest order + label)
        ├── Grouping (level + workspace)
        ├── Tree building (parent references)
        └── Diagnostics
        │
        ▼
NavigationState (items, groups, tree, activeWorkspaceId)
```

### Engine responsibilities (Phase 2)

| Responsibility       | Implementation                                          |
| -------------------- | ------------------------------------------------------- |
| Contribution loading | `NavigationEngine.loadContributions()`                  |
| Permission filtering | Hide-not-disable via adapter                            |
| Ordering             | `order` field (default 100), then label                 |
| Grouping             | Groups by `level:workspace`                             |
| Tree hierarchy       | `parent` references                                     |
| Hidden items         | Omitted until `revealNavigationItem`                    |
| Active workspace     | First visible activity-bar workspace (manifest-derived) |
| Diagnostics          | Contribution, visibility, duplicate, orphan counts      |

### Command Framework evolution (planning)

Workbench Requests remain the capability entry point. Phase 2 documents the Sprint 004 bridge:

| Workbench Request      | Future command id (`REQUEST_COMMAND_MAP`) |
| ---------------------- | ----------------------------------------- |
| `revealNavigationItem` | `workbench.navigation.reveal`             |
| `openView`             | `workbench.view.open`                     |
| `openPanel`            | `workbench.panel.open`                    |

Extension points:

- `REQUEST_COMMAND_MAP` in `interfaces/command-evolution.ts`
- `WorkbenchCommandBridge` interface (future — maps command id → Workbench Request)
- Request Bus remains internal transport; Sprint 004 may wrap `publish()` with command metadata

---

## Manifest extensions

### Schema (ADR-0022)

Optional top-level `workbench` block on all capability kinds:

```yaml
workbench:
  navigation:
    id: platform-home # optional; defaults to capability id
    level: activity-bar # activity-bar | sidebar | workspace | context
    workspace: home
    label: Home # optional; defaults to capability name
    icon: home
    route: /workspace/home
    order: 10
    permission: platform.nav.home.view
    parent: platform-home # optional tree parent
    hidden: false
    badge: null
  view: { ... } # validated; View Engine deferred to Phase 4
```

### Validation location

| File                                                                 | Purpose                               |
| -------------------------------------------------------------------- | ------------------------------------- |
| `packages/platform-runtime/src/manifest-engine/schemas/workbench.ts` | Zod schemas                           |
| All kind schemas                                                     | Optional `workbench` field (additive) |

### Scaffold manifests (manifest-driven navigation)

| Manifest                                                                     | Contribution                       |
| ---------------------------------------------------------------------------- | ---------------------------------- |
| `packages/workbench-framework/manifests/platform-home/module.yaml`           | Activity Bar — Home                |
| `packages/workbench-framework/manifests/platform-administration/module.yaml` | Activity Bar — Administration      |
| `packages/workbench-framework/manifests/platform-home-overview/module.yaml`  | Sidebar — Overview (child of Home) |

Discovery root added: `packages/workbench-framework/manifests`

Existing manifests without `workbench` continue to validate unchanged.

---

## APIs

### Platform Runtime

```typescript
import { Runtime } from "@apzhub/platform-runtime/server";

const { contributions, diagnostics } =
  Runtime.registry().getWorkbenchNavigationContributions();

// Alias
Runtime.registry().getWorkbenchNavItems();
Runtime.registry().getWorkbenchNavigationDiagnostics();
```

### Navigation Engine

```typescript
import {
  createNavigationEngine,
  createWorkbenchManager,
  Workbench,
} from "@apzhub/workbench-framework";

const engine = createNavigationEngine({
  permissionAdapter,
  contributions,
});

engine.getState(); // NavigationState
engine.getDiagnostics(); // NavigationDiagnostics
engine.getActivityBarItems();
engine.getSidebarItems(workspace);
engine.getGroupsForLevel("sidebar");
engine.handleRequest({ type: "revealNavigationItem", navId: "..." });

// Via Workbench Manager / Request Bus
Workbench.loadNavigationContributions(contributions);
Workbench.getNavigationDiagnostics();
```

### Server DTO (hydration)

```typescript
import {
  mapContributionsToRegistryDto,
  mapRegistryDtoToContributions,
} from "@apzhub/workbench-framework/server";
```

---

## Permission model

Navigation items with `permission` keys are filtered by `WorkbenchPermissionAdapter`:

| Stage                  | Behaviour                                           |
| ---------------------- | --------------------------------------------------- |
| Model build            | Items failing `can(permission)` excluded from state |
| `revealNavigationItem` | Target item permission re-checked                   |
| Registry extraction    | All contributions extracted; filtering at engine    |

Default: `AllowAllWorkbenchPermissionAdapter` (ADR-0023). Production `AuthWorkbenchPermissionAdapter` remains Phase 7.

Hide-not-disable: filtered items are omitted, not rendered disabled.

---

## Diagnostics

### Registry extraction (`WorkbenchNavigationExtractionDiagnostics`)

| Field                      | Description                     |
| -------------------------- | ------------------------------- |
| `scannedCapabilities`      | Records scanned                 |
| `contributionCount`        | Unique contributions extracted  |
| `skippedInactive`          | Non-active lifecycle states     |
| `skippedWithoutNavigation` | No `workbench.navigation` block |
| `duplicateIds`             | Duplicate navigation ids        |
| `orphanParents`            | Parent ids not found            |

### Navigation Engine (`NavigationDiagnostics`)

| Field                     | Description               |
| ------------------------- | ------------------------- |
| `contributionCount`       | Loaded contributions      |
| `visibleCount`            | Items in navigation model |
| `hiddenCount`             | Hidden and not revealed   |
| `permissionFilteredCount` | Removed by adapter        |
| `duplicateIds`            | Duplicate ids detected    |
| `orphanParents`           | Missing parent references |
| `activeWorkspaceId`       | Current workspace         |
| `groupCount`              | Navigation groups         |

---

## Test results

| Metric           | Result                       |
| ---------------- | ---------------------------- |
| New unit tests   | +21                          |
| Total unit tests | **305 passed**               |
| E2E tests        | **9 passed** (no regression) |

### Key test files

| File                           | Coverage focus                                |
| ------------------------------ | --------------------------------------------- |
| `navigation-engine.test.ts`    | Ordering, grouping, tree, permissions, reveal |
| `navigation-model.test.ts`     | Group/tree helpers                            |
| `workbench-navigation.test.ts` | Registry extraction                           |
| `validate.test.ts`             | Manifest schema + on-disk scaffolds           |
| `workbench-manager.test.ts`    | Contribution loading, reveal routing          |

---

## Coverage

| Module                         | Lines | Branches |
| ------------------------------ | ----- | -------- |
| navigation-engine              | 83%   | 93%      |
| navigation-model               | 90%   | 89%      |
| workbench-navigation (runtime) | ≥ 80% | ≥ 80%    |
| workbench-framework aggregate  | ≥ 80% | ≥ 80%    |

All repository coverage thresholds pass.

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm test`          | ✅ 305 passed |
| `pnpm test:coverage` | ✅ Pass       |
| `pnpm test:e2e`      | ✅ 9 passed   |

---

## Technical debt

| ID       | Item                                                                                          | Target              |
| -------- | --------------------------------------------------------------------------------------------- | ------------------- |
| TD-P2-01 | Activity Bar UI not wired to Navigation Engine state                                          | Phase 3             |
| TD-P2-02 | `apps/web` does not hydrate Navigation Engine from Runtime at bootstrap                       | Phase 3             |
| TD-P2-03 | `workbench.view` validated but View Engine not implemented                                    | Phase 4             |
| TD-P2-04 | Legacy `module.navigation` block coexists with `workbench.navigation` — migrate in future ADR | Post M3             |
| TD-P2-05 | `WorkbenchCommandBridge` interface documented but not implemented                             | Sprint 004          |
| TD-P2-06 | Server DTO mapping functions partially uncovered                                              | Phase 3 integration |

---

## Recommendation for Phase 3

### **READY FOR PHASE 3** (awaiting architecture review)

Phase 3 should implement:

1. **Server-side registry hydration** — `Runtime.registry().getWorkbenchNavigationContributions()` → client DTO
2. **Activity Bar adapter** — render `NavigationEngine.getActivityBarItems()` in Desktop Shell (minimal diff)
3. **E2E** — authenticated user sees manifest-driven Activity Bar items

### Phase 3 must not

- Implement View Engine tabs (Phase 4)
- Implement Command Palette (Sprint 004)
- Add hardcoded navigation fallbacks

### Stop condition

**Stop after architecture review** before Phase 3 implementation.

---

## Next steps

1. Architecture review of Phase 2 deliverables
2. Owner approves Phase 3 start
3. Execute Phase 3 — Registry-driven Activity Bar
4. Produce Phase 3 report at phase exit

---

_SPR-003 Phase 2 — complete. Awaiting architecture review before Phase 3._
