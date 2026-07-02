# SPR-003 — Phase 3 Report

> **Date:** 2026-06-28  
> **Sprint:** SPR-003 — Workbench Framework  
> **Phase:** 3 — Navigation Model & Activity Bar Integration  
> **Prerequisite:** [Phase 2 report](./SPR-003-phase-2-report.md) — approved  
> **Recommendation:** **READY FOR PHASE 4** (awaiting architecture review)

---

## Summary

Phase 3 introduces the **platform Navigation Model** and the **Presentation Adapter** abstraction. UI components consume the Navigation Model exclusively — never manifests or registry DTOs directly.

The **Activity Bar** is the first Presentation Adapter consumer. It renders manifest-driven workspace entries (Home, Administration) hydrated from the Platform Registry at server bootstrap.

**Out of scope (as specified):** Sidebar behaviour, Command Framework, Search, Notifications, session persistence, business capabilities, external integrations.

---

## Navigation architecture

```text
Capability Manifest (workbench.navigation)
        │
        ▼
Platform Registry extraction (active capabilities)
        │
        ▼
Server DTO (WorkbenchRegistryDto) — serialisation boundary
        │
        ▼
Client hydration → Navigation Engine.loadContributions()
        │
        ▼
Navigation Model (NavigationModel)
        │
        ▼
Presentation Adapter (ActivityBarPresentationAdapter)
        │
        ▼
Workbench UI (ActivityBar → ShellLayout → DesktopShell)
```

### Layer responsibilities

| Layer                | Package / location                                  | Responsibility                                     |
| -------------------- | --------------------------------------------------- | -------------------------------------------------- |
| Capability Manifest  | `workbench.navigation` in YAML                      | Source of truth for nav metadata                   |
| Navigation Engine    | `@apzhub/workbench-framework`                       | Ordering, grouping, tree, permissions, diagnostics |
| Navigation Model     | `navigation/platform-navigation-model.ts`           | Stable read model for all consumers                |
| Presentation Adapter | `presentation/activity-bar-presentation-adapter.ts` | Maps model → UI-specific shape                     |
| Workbench UI         | `@apzhub/ui`, `@apzhub/workspace`                   | Renders adapter output; no manifest access         |
| App wiring           | `apps/web`                                          | Server hydration + React provider                  |

### ADR alignment

- **ADR-0019:** `@apzhub/workspace` does **not** depend on `@apzhub/workbench-framework`. Wiring is via `apps/web` props.
- **ADR-0022:** Manifest `workbench.navigation` block remains the contribution source.
- **ADR-0023:** Permission filtering via `AllowAllWorkbenchPermissionAdapter` (dev default).

---

## Navigation Model

### Type: `NavigationModel`

Schema version: `NAVIGATION_MODEL_SCHEMA_VERSION = "1.0"`

| Field               | Description                          |
| ------------------- | ------------------------------------ |
| `schemaVersion`     | Model contract version               |
| `activeWorkspaceId` | Current workspace (manifest-derived) |
| `items`             | All visible navigation items         |
| `groups`            | Level/workspace groupings            |
| `tree`              | Parent/child hierarchy               |
| `activityBar`       | Filtered activity-bar slice          |
| `diagnostics`       | Engine diagnostics snapshot          |

### Stable navigation IDs

Navigation item `id` is stable end-to-end:

1. Manifest `workbench.navigation.id` (optional) → defaults to capability `id`
2. Preserved through registry extraction, DTO serialisation, hydration, engine, model, adapter, and Activity Bar `key` / selection

Example scaffold IDs: `platform-home`, `platform-administration`.

### API

```typescript
// Engine / manager / bus
navigationEngine.getNavigationModel(): NavigationModel
Workbench.getNavigationModel(): NavigationModel

// Workbench state integration
Workbench.subscribe(listener)           // re-renders on model change
Workbench.selectActivityBarNavigationItem(navId): WorkbenchRequestResult

// React (@apzhub/workbench-framework/react)
useNavigationModel(): NavigationModel
useActivityBarPresentation(): readonly ActivityBarPresentationItem[]
useWorkbenchNavigationActions(): { selectActivityBarItem, getNavigationDiagnostics }
```

---

## Presentation Adapter design

### Interface

```typescript
interface NavigationPresentationAdapter<TTarget, TPresentation> {
  readonly target: TTarget;
  adapt(model: NavigationModel): TPresentation;
}
```

Targets defined for future consumers: `activity-bar` | `sidebar` | `command` | `search`.

### Activity Bar adapter

`ActivityBarPresentationAdapter` maps `NavigationModel.activityBar` → `ActivityBarPresentationItem[]`:

| Output field | Source                                  |
| ------------ | --------------------------------------- |
| `id`         | Stable navigation id                    |
| `label`      | Manifest label                          |
| `icon`       | Manifest icon                           |
| `route`      | Manifest route                          |
| `workspace`  | Manifest workspace                      |
| `active`     | `workspace === model.activeWorkspaceId` |
| `ariaLabel`  | `{label} workspace`                     |

Default export: `defaultActivityBarPresentationAdapter`.

---

## Activity Bar integration

### UI changes (`@apzhub/ui`)

- `ActivityBar` accepts `items: ActivityBarItem[]` and optional `onItemSelect`
- `ShellLayout` requires `activityBarItems` — **no hardcoded entries**
- Glyph derived from label first character (manifest-driven)

### Shell changes (`@apzhub/workspace`)

- `DesktopShell` accepts `activityBarItems` and `onActivityBarSelect`
- Sidebar left empty (`[]`) — sidebar manifest wiring deferred

### App wiring (`apps/web`)

| File                                          | Role                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `lib/workbench-hydration.ts`                  | Server: `Runtime.registry().getWorkbenchNavigationContributions()` → DTO |
| `app/(platform)/layout.tsx`                   | Async layout loads registry, wraps children                              |
| `app/(platform)/workbench-shell-provider.tsx` | Client `WorkbenchProvider` boundary                                      |
| `app/(platform)/page.tsx`                     | `useActivityBarPresentation()` → `DesktopShell`                          |

---

## Registry hydration

### Server → client flow

```typescript
// Server (apps/web/lib/workbench-hydration.ts)
await ensurePlatformRuntimeReady();
const { contributions } = Runtime.registry().getWorkbenchNavigationContributions();
return mapContributionsToRegistryDto(contributions);

// Client (WorkbenchProvider)
const { contributions } = hydrateNavigationContributionsFromRegistry(registry);
bus.loadNavigationContributions(contributions);
```

### DTO boundary

`WorkbenchRegistryDto` (`@apzhub/workbench-framework/server`) is the serialisation contract. Client code maps DTO → `NavigationContribution[]` via `hydrateNavigationContributionsFromRegistry()`.

---

## Workbench state integration

| Concern          | Implementation                                                                   |
| ---------------- | -------------------------------------------------------------------------------- |
| Initial state    | Contributions loaded in `WorkbenchProvider` on mount                             |
| Active workspace | Navigation Engine resolves default from first activity-bar item                  |
| Selection        | `selectActivityBarNavigationItem(navId)` → `setActiveWorkspace`                  |
| React updates    | `useNavigationModel` subscribes to `Workbench.subscribe()`                       |
| Diagnostics      | Embedded in `NavigationModel.diagnostics`; also via `getNavigationDiagnostics()` |

---

## APIs summary

| Export path                          | Key symbols                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `@apzhub/workbench-framework`        | `NavigationModel`, `buildNavigationModel`, `ActivityBarPresentationAdapter`, `hydrateNavigationContributionsFromRegistry` |
| `@apzhub/workbench-framework/server` | `WorkbenchRegistryDto`, `mapContributionsToRegistryDto`, `mapRegistryDtoToContributions`                                  |
| `@apzhub/workbench-framework/react`  | `WorkbenchProvider`, `useNavigationModel`, `useActivityBarPresentation`, `useWorkbenchNavigationActions`                  |
| `@apzhub/ui`                         | `ActivityBar`, `ActivityBarItem`, `ShellLayout`                                                                           |
| `@apzhub/workspace`                  | `DesktopShell` (activity bar props)                                                                                       |

---

## Test results

| Metric           | Result                     |
| ---------------- | -------------------------- |
| New unit tests   | +8                         |
| Total unit tests | **313 passed**             |
| E2E tests        | **11 passed** (+2 SPR-003) |

### Key test files

| File                                        | Coverage focus                             |
| ------------------------------------------- | ------------------------------------------ |
| `platform-navigation-model.test.ts`         | Model generation, stable IDs               |
| `activity-bar-presentation-adapter.test.ts` | Presentation Adapter mapping               |
| `registry-hydration.test.ts`                | DTO → contributions hydration              |
| `workbench-context.test.tsx`                | Provider hydration, workspace selection    |
| `navigation-engine.test.ts`                 | `getNavigationModel()`                     |
| `workbench-manager.test.ts`                 | Model exposure, activity bar selection     |
| `shell-layout.test.tsx`                     | Activity Bar renders from Navigation Model |
| `spr-003-workbench-navigation.spec.ts`      | E2E manifest-driven Activity Bar           |

---

## Coverage

| Module                              | Lines     | Branches  |
| ----------------------------------- | --------- | --------- |
| `platform-navigation-model`         | 100%      | 100%      |
| `registry-hydration`                | 100%      | 100%      |
| `activity-bar-presentation-adapter` | 100%      | 100%      |
| `react/workbench-context`           | 96%       | 92%       |
| `navigation-engine`                 | 87%       | 90%       |
| `workbench-manager`                 | 90%       | 89%       |
| Repository aggregate                | **95.2%** | **91.4%** |

All repository coverage thresholds pass (≥ 80% workbench-framework gate).

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm test`          | ✅ 313 passed |
| `pnpm test:coverage` | ✅ Pass       |
| `pnpm test:e2e`      | ✅ 11 passed  |

---

## Technical debt

| ID       | Item                                                                   | Target                     |
| -------- | ---------------------------------------------------------------------- | -------------------------- |
| TD-P3-01 | Sidebar not wired to Navigation Model (Presentation Adapter TBD)       | Phase 4                    |
| TD-P3-02 | Activity bar glyph uses label initial, not icon asset system           | Phase 4 / design system    |
| TD-P3-03 | Workspace selection does not navigate to manifest `route`              | Phase 4 (View Engine)      |
| TD-P3-04 | `mapNavigationItemsToRegistryDto` partially uncovered                  | Low priority               |
| TD-P3-05 | `navigation-presentation-adapter.ts` interface-only (0% line coverage) | Acceptable — type contract |
| TD-P3-06 | `WorkbenchCommandBridge` not implemented                               | Sprint 004                 |
| TD-P3-07 | Session persistence for active workspace not implemented               | Phase 5+                   |

---

## Recommendation for Phase 4

### **READY FOR PHASE 4** (awaiting architecture review)

Phase 4 should implement:

1. **Sidebar Presentation Adapter** — consume `NavigationModel` sidebar slice; wire `DesktopShell` sidebar from adapter output (not manifests)
2. **View Engine** — manifest `workbench.view` contributions; open views on workspace/route selection
3. **Route integration** — Activity Bar / sidebar selection navigates to manifest routes
4. **Permission-aware UI** — replace allow-all adapter with session-backed permissions where applicable

Phase 3 is complete. **Stop here — await architecture review before Phase 4.**

---

## Files changed (reference)

| Area                   | Files                                                                          |
| ---------------------- | ------------------------------------------------------------------------------ |
| Navigation Model       | `packages/workbench-framework/src/navigation/platform-navigation-model.ts`     |
| Presentation           | `packages/workbench-framework/src/presentation/*`                              |
| Hydration              | `packages/workbench-framework/src/hydration/registry-hydration.ts`             |
| React                  | `packages/workbench-framework/src/react/*`                                     |
| Engine / manager / bus | `getNavigationModel()`, `selectActivityBarNavigationItem()`                    |
| UI                     | `packages/ui/src/components/shell-layout.tsx`                                  |
| Shell                  | `packages/workspace/src/desktop-shell.tsx`                                     |
| App                    | `apps/web/lib/workbench-hydration.ts`, `app/(platform)/layout.tsx`, `page.tsx` |
| E2E                    | `testing/playwright/e2e/spr-003-workbench-navigation.spec.ts`                  |
