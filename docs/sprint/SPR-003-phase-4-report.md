# SPR-003 — Phase 4 Report

> **Date:** 2026-06-28  
> **Sprint:** SPR-003 — Workbench Framework  
> **Phase:** 4 — Sidebar Presentation & View Engine  
> **Prerequisite:** [Phase 3 report](./SPR-003-phase-3-report.md) — approved  
> **Recommendation:** **READY FOR PHASE 5** (awaiting architecture review)

---

## Summary

Phase 4 delivers the **Sidebar Presentation Adapter**, full **View Engine** implementation, **route mapping**, and **navigation → view activation**. The Sidebar renders exclusively from the Navigation Model. View registration and activation are manifest-driven via `workbench.view` blocks.

The **Activity Bar Presentation Adapter is unchanged** from Phase 3.

A **Workbench Surface** concept is documented as the future abstraction for UI regions that present platform capabilities — no large refactor was performed.

**Out of scope (as specified):** Command Framework, Search, Notifications, Dock behaviour, session persistence, business capabilities, external integrations.

---

## Workbench Surface (future abstraction)

Documented in `packages/workbench-framework/src/presentation/workbench-surface.ts`:

| Surface ID                                                               | Status in Phase 4              |
| ------------------------------------------------------------------------ | ------------------------------ |
| `activity-bar`                                                           | Presentation Adapter (Phase 3) |
| `sidebar`                                                                | Presentation Adapter (Phase 4) |
| `view`                                                                   | View Engine + workspace region |
| `panel`, `dock`, `status-bar`, `inspector`, `breadcrumb`, `context-menu` | Documented only                |

Future phases may unify Presentation Adapters under a Surface registry. Phase 4 keeps the existing adapter pattern.

---

## Architecture

```text
Capability Manifest (workbench.navigation + workbench.view)
        │
        ▼
Platform Registry extraction
        │
        ├── Navigation contributions → Navigation Engine → Navigation Model
        └── View descriptors → View Engine → ViewState
        │
        ▼
Presentation Adapters
        ├── ActivityBarPresentationAdapter (unchanged)
        └── SidebarPresentationAdapter (new)
        │
        ▼
Workbench UI (ShellLayout → DesktopShell)
        │
        ▼
Route sync (Next.js router ↔ activateViewForRoute)
```

---

## Sidebar architecture

### Navigation Model extension

`NavigationModel` now includes a **`sidebar`** slice — items with `level: "sidebar"` scoped to `activeWorkspaceId`.

### Sidebar Presentation Adapter

`SidebarPresentationAdapter` maps `NavigationModel.sidebar` → `SidebarPresentationItem[]`:

| Field       | Source                |
| ----------- | --------------------- |
| `id`        | Stable navigation id  |
| `label`     | Manifest label        |
| `route`     | Manifest route        |
| `workspace` | Active workspace      |
| `parent`    | Tree parent reference |

Active sidebar item decoration is applied in `useSidebarPresentation()` by matching the focused view route — adapter remains Navigation Model–pure.

### Shell integration

- `ShellLayout` forwards `onSidebarSelect` to `Sidebar`
- `DesktopShell` accepts `sidebarItems` + `onSidebarSelect` (no hardcoded entries)
- Permission filtering occurs in Navigation Engine before items reach the model

---

## View Engine architecture

### Responsibilities

| Responsibility       | Implementation                                                |
| -------------------- | ------------------------------------------------------------- |
| View registration    | `ViewEngine.loadDescriptors()`                                |
| View activation      | `openView` request / manager selection helpers                |
| Active view state    | `ViewState.focusedViewId`, `openViews`                        |
| View descriptors     | `ViewDescriptor` from manifest `workbench.view`               |
| View lookup          | `resolveViewIdForRoute()`, `resolveViewIdForNavigationItem()` |
| View lifecycle       | Placeholder (`lifecycle: "placeholder"`)                      |
| Permission filtering | `WorkbenchPermissionAdapter` on registration and open         |

### View descriptor (manifest)

```yaml
workbench:
  view:
    viewId: platform-home-overview # optional; defaults to capability id
    title: Overview
    workspace: home
    route: /workspace/home/overview
    permission: platform.nav.home.view
    default: false
    icon: layout-dashboard
```

### Scaffold manifests updated

| Manifest                  | Navigation   | View               |
| ------------------------- | ------------ | ------------------ |
| `platform-home`           | activity-bar | default home view  |
| `platform-home-overview`  | sidebar      | overview view      |
| `platform-administration` | activity-bar | default admin view |

### Navigation → View activation

| Action              | Behaviour                                                        |
| ------------------- | ---------------------------------------------------------------- |
| Activity bar select | `setActiveWorkspace` → open workspace default or nav-mapped view |
| Sidebar select      | `setActiveWorkspace` → `openView` via route/id resolution        |
| Route load          | `activateViewForRoute(pathname)` → workspace + view activation   |
| Initial hydration   | `activateDefaultViewForActiveWorkspace()` after registry load    |

### Idempotent open

`openView` focuses an already-open view instead of duplicating tabs (ADR-0020 alignment).

---

## APIs

### View Engine / Manager / Bus

```typescript
ViewEngine.loadDescriptors(descriptors)
ViewEngine.openView(viewId, workspace?, params?)
ViewEngine.resolveViewIdForRoute(route)
ViewEngine.getDefaultViewForWorkspace(workspace)

Workbench.loadViewDescriptors(descriptors)
Workbench.getViewState()
Workbench.getViewDiagnostics()
Workbench.selectSidebarNavigationItem(navId)
Workbench.activateViewForRoute(route)
Workbench.activateDefaultViewForActiveWorkspace()
```

### Platform Runtime

```typescript
Runtime.registry().getWorkbenchViewDescriptors();
extractWorkbenchViewDescriptors(records);
extractViewDescriptor(record);
hasWorkbenchView(manifest);
```

### Server DTO

```typescript
mapWorkbenchRegistryDto(contributions, views);
mapRegistryDtoToViewDescriptors(dto);
hydrateNavigationContributionsFromRegistry(dto); // returns contributions + viewDescriptors
```

### React (`@apzhub/workbench-framework/react`)

```typescript
useViewState(): ViewState
useSidebarPresentation(): readonly (SidebarPresentationItem & { active: boolean })[]
useWorkbenchNavigationActions(): {
  selectActivityBarItem,
  selectSidebarItem,
  activateViewForRoute,
  getNavigationDiagnostics,
  getViewDiagnostics,
}
```

### App routes

| Route                       | View                         |
| --------------------------- | ---------------------------- |
| `/`                         | Redirect → `/workspace/home` |
| `/workspace/home`           | Home view                    |
| `/workspace/home/overview`  | Overview view                |
| `/workspace/administration` | Administration view          |

---

## Test results

| Metric           | Result                                |
| ---------------- | ------------------------------------- |
| New unit tests   | +18                                   |
| Total unit tests | **331 passed**                        |
| E2E tests        | **13 passed** (+2 sidebar/view specs) |

### Key test files

| File                                   | Coverage focus                                      |
| -------------------------------------- | --------------------------------------------------- |
| `view-engine.test.ts`                  | Registration, activation, route lookup, permissions |
| `sidebar-presentation-adapter.test.ts` | Sidebar adapter mapping                             |
| `workbench-view.test.ts`               | Platform view extraction                            |
| `workbench-manager.test.ts`            | Sidebar selection, route activation, openView       |
| `workbench-context.test.tsx`           | Sidebar hook, view hydration, nav→view              |
| `shell-layout.test.tsx`                | Sidebar rendering from Navigation Model             |
| `spr-003-workbench-navigation.spec.ts` | E2E sidebar, route, view heading                    |

---

## Coverage

| Module                         | Lines     | Branches  |
| ------------------------------ | --------- | --------- |
| `view-engine`                  | ≥ 80%     | ≥ 80%     |
| `sidebar-presentation-adapter` | 100%      | 100%      |
| `workbench-view` (runtime)     | ≥ 95%     | ≥ 88%     |
| `workbench-manager`            | 82%       | 78%       |
| Repository aggregate           | **93.8%** | **90.3%** |

All repository coverage thresholds pass.

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm test`          | ✅ 331 passed |
| `pnpm test:coverage` | ✅ Pass       |
| `pnpm test:e2e`      | ✅ 13 passed  |

---

## Technical debt

| ID       | Item                                                                   | Target          |
| -------- | ---------------------------------------------------------------------- | --------------- |
| TD-P4-01 | View lifecycle is placeholder — no mount/unmount/render pipeline       | Phase 5+        |
| TD-P4-02 | No tab bar UI — multiple open views tracked but not rendered as tabs   | Phase 5         |
| TD-P4-03 | View content region shows placeholder text, not capability views       | Phase 5+        |
| TD-P4-04 | Workbench Surface abstraction documented but not enforced in code      | Future refactor |
| TD-P4-05 | Session-backed permission adapter not wired — dev allow-all remains    | Phase 5         |
| TD-P4-06 | `workbench-surface.ts` and interface-only files at 0% line coverage    | Acceptable      |
| TD-P4-07 | Route sync is client-side only — no deep-link SSR view hydration guard | Phase 5         |

---

## Recommendation for Phase 5

### **READY FOR PHASE 5** (awaiting architecture review)

Phase 5 should implement:

1. **Session Engine** — workspace/view persistence across reloads
2. **Session-backed permission adapter** — replace allow-all for production paths
3. **View content mounting** — capability view components in workspace region
4. **Tab bar** (optional) — visualise `openViews` from View Engine state

Phase 4 is complete. **Stop here — await architecture review before Phase 5.**

---

## Files changed (reference)

| Area              | Files                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------- |
| View Engine       | `engines/view-engine/view-engine.ts`                                                      |
| Sidebar adapter   | `presentation/sidebar-presentation-adapter.ts`                                            |
| Workbench Surface | `presentation/workbench-surface.ts`                                                       |
| Navigation Model  | `sidebar` slice in `platform-navigation-model.ts`                                         |
| Platform runtime  | `capability-registry/workbench-view.ts`, `PlatformRegistry.getWorkbenchViewDescriptors()` |
| Hydration         | `hydration/registry-hydration.ts`, `server.ts`, `apps/web/lib/workbench-hydration.ts`     |
| React             | `react/workbench-context.tsx` hooks                                                       |
| Shell             | `ui/shell-layout.tsx`, `workspace/desktop-shell.tsx`                                      |
| App               | `components/workbench-page.tsx`, workspace routes                                         |
| Manifests         | `workbench.view` on scaffold modules                                                      |
| E2E               | `spr-003-workbench-navigation.spec.ts`                                                    |
