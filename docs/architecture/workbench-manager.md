# Workbench Manager — Architecture

> **Status:** Active (SPR-003 Phase 1 — implemented)  
> **Parent:** [Workbench Framework](./workbench-framework.md)  
> **Package:** `@apzhub/workbench-framework`

---

## 1. Purpose

The **Workbench Manager** is the single coordinating subsystem of the Workbench Framework. It receives **Workbench Requests** from the Request Bus and delegates to specialised **engines**.

No capability interacts with engines directly. All UI orchestration flows through the Workbench Manager.

---

## 2. Architecture hierarchy

```text
Workbench Framework
        │
        ▼
Request Bus                ← capability entry: publish()
        │
        ▼
Workbench Manager          ← handleRequest(), getState(), subscribe()
        │
        ├── Layout Engine
        ├── Panel Engine
        ├── View Engine
        ├── Navigation Engine
        ├── Session Engine
        ├── Dock Engine
        ├── Context Engine
        └── Selection Engine
```

Engines may not depend on each other directly — only through the Workbench Manager or approved interfaces.

---

## 3. Workbench Manager responsibilities

| Responsibility      | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| Request routing     | Accept typed Workbench Requests; validate; route to engine          |
| State coordination  | Aggregate engine state slices into `WorkbenchState`                 |
| Permission gate     | Reject requests user is not authorised to execute                   |
| Layout coordination | Sync layout region visibility when Panel Engine opens/closes panels |
| Event subscription  | Notify subscribers of workbench state changes                       |
| Diagnostics         | Expose workbench state summary for debugging (internal)             |
| Lifecycle           | Initialise after Runtime bootstrap; teardown on session end         |

### Public API (Phase 1)

```typescript
interface WorkbenchManager {
  handleRequest(request: WorkbenchRequest): WorkbenchRequestResult;
  getState(): WorkbenchState;
  subscribe(listener: WorkbenchStateListener): Unsubscribe;
  createCapabilityHandle(): WorkbenchCapabilityHandle;
}

interface WorkbenchRequestBus {
  publish(request: WorkbenchRequest): WorkbenchRequestResult;
  getState(): WorkbenchState;
  subscribe(listener: WorkbenchStateListener): Unsubscribe;
  createCapabilityContext(): WorkbenchCapabilityContext;
}
```

---

## 4. Engine responsibilities

### Layout Engine

**Phase 1:** Scaffold — default shell regions; region visibility coordination.

**Owns:** Shell region geometry and responsive layout composition.

| Responsibility       | Detail                                                              |
| -------------------- | ------------------------------------------------------------------- |
| Region composition   | Header, Activity Bar, Sidebar, Workspace, Context, Status Bar slots |
| Responsive behaviour | Breakpoints per Document 016                                        |
| Layout constraints   | Minimum sizes, overflow rules                                       |
| Integration          | Wraps `@apzhub/ui` ShellLayout without capabilities touching it     |

**Does not:** Open views, manage tabs, or filter navigation.

---

### Panel Engine

**Phase 1:** Scaffold — `openPanel` / `closePanel` requests; sidebar and context geometry.

**Owns:** Panel visibility, collapse, and resize within layout regions.

| Responsibility     | Detail                                 |
| ------------------ | -------------------------------------- |
| Sidebar panel      | Collapse, width, pin state             |
| Context panel      | Show/hide, width, active tab key       |
| Panel visibility   | Which panels are visible per workspace |
| Resize persistence | Delegates geometry to Session Manager  |

**Does not:** Set context panel content (Context Manager) or workspace scope (Workspace Manager).

---

### View Manager

**Owns:** View lifecycle within the workspace region — tabs and active view.

| Responsibility             | Detail                                                 |
| -------------------------- | ------------------------------------------------------ |
| Open / close / focus views | Handles `openView`, `closeView`, `focusView` requests  |
| Tab model                  | Tab strip, pin, reorder                                |
| View registration          | Maps capability view descriptors to React mount points |
| Active view                | Single focus target in workspace                       |

**Does not:** Manipulate layout regions (Layout Manager) or navigation (Navigation Manager).

---

### Navigation Manager

**Owns:** Activity Bar and sidebar navigation items derived from registry.

| Responsibility         | Detail                                                      |
| ---------------------- | ----------------------------------------------------------- |
| Nav item registry      | Maps `PlatformRegistry` + nav manifest metadata → nav model |
| Activity Bar           | Dynamic items; selection state                              |
| Sidebar trees          | Workspace-scoped navigation trees                           |
| Deep links             | Resolve routes to workbench requests                        |
| `revealNavigationItem` | Handles reveal requests                                     |

**Does not:** Switch workspace context (Workspace Manager) or open views directly without View Manager delegation.

---

### Session Manager

**Owns:** Workbench session state capture, restore, and persistence hooks.

| Responsibility           | Detail                                                                    |
| ------------------------ | ------------------------------------------------------------------------- |
| Session payload          | Open tabs, panel sizes, active workspace, selection (Document 018 subset) |
| Capture / restore        | In-memory first; persistence interface for later                          |
| Permission re-validation | Drop unauthorised state on restore                                        |
| Session types            | Default, pinned, temporary (interfaces)                                   |

**Does not:** Authoritative business data storage.

---

### Dock Manager

**Owns:** Panel dock geometry — split ratios, dock/undock state.

| Responsibility | Detail                                    |
| -------------- | ----------------------------------------- |
| Dock positions | Sidebar dock, context dock, future undock |
| Split ratios   | Persisted panel proportions               |
| Dock state     | Delegates persistence to Session Manager  |

**Does not:** Panel content or visibility policy (Panel Manager).

---

### Context Manager

**Owns:** Context panel content orchestration.

| Responsibility               | Detail                                             |
| ---------------------------- | -------------------------------------------------- |
| Context panel tabs           | Activity, properties, history, etc. (Document 016) |
| Active context key           | Which context view is shown                        |
| `setContext` requests        | Switch context panel content                       |
| Capability context providers | Register context renderers via manifest            |

**Does not:** Layout or resize context panel (Panel Manager).

---

### Selection Manager

**Owns:** Platform-wide selection context shared across views and context panel.

| Responsibility          | Detail                                      |
| ----------------------- | ------------------------------------------- |
| Selection model         | Selected entity ids, kind, scope            |
| `setSelection` requests | Update selection from capabilities          |
| Selection events        | Notify subscribers (read-only)              |
| Context coupling        | Inform Context Manager of selection changes |

**Does not:** Business record fetching — selection holds references only.

---

### Workspace Manager

**Owns:** Active workspace context (Activity Bar workspace switching).

| Responsibility     | Detail                                                    |
| ------------------ | --------------------------------------------------------- |
| Active workspace   | Home, Administration scaffold, future business workspaces |
| Workspace scope    | Drives sidebar and nav filtering                          |
| Workspace switch   | Coordinates Navigation + View state on switch             |
| Workspace metadata | Labels, icons from registry                               |

**Does not:** Register nav items (Navigation Manager) or persist session (Session Manager).

---

## 5. Request flow example

```text
User clicks capability action "Open Settings"
        │
        ▼
Capability publishes:
  { type: "openView", viewId: "platform-settings", workspace: "administration" }
        │
        ▼
Workbench Manager
  ├── Permission check ✓
  ├── Workspace Manager → set active workspace if needed
  ├── View Manager → open tab + mount view
  └── Session Manager → record tab in session
        │
        ▼
UI Update: workspace tab visible, view rendered
```

---

## 6. Future subsystems

The Workbench Manager design allows adding sub-managers without breaking the request model:

| Future subsystem     | Milestone | Request types                             |
| -------------------- | --------- | ----------------------------------------- |
| Command Manager      | M4        | `executeCommand`                          |
| Search Manager       | M5        | `openSearch`, `focusSearch`               |
| Notification Manager | M6        | `showNotification`, `dismissNotification` |
| Activity Manager     | M7        | `appendActivity`                          |

---

## 7. Testing strategy (planning)

| Layer             | Test focus                                             |
| ----------------- | ------------------------------------------------------ |
| Workbench Manager | Request routing, permission rejection, state coherence |
| Each sub-manager  | Unit tests in isolation with mocked peers              |
| Integration       | Request → UI state snapshots                           |
| E2E               | Permission-filtered navigation and view open           |

Target: ≥ 80% coverage for `@apzhub/workbench-framework` package.

---

_Workbench Manager architecture — planning only. No implementation until Sprint 003 approved._
