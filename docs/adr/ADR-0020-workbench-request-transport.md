# ADR-0020 — Workbench Request Transport

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-003 Phase 0  
> **Decided by:** Project owner (Sprint 003 Phase 0 approval)  
> **Related:** [workbench-framework.md](../architecture/workbench-framework.md) · [ADR-0019](./ADR-0019-workbench-framework-package.md)

## Problem

Capabilities must interact with the workbench without manipulating UI directly. The architecture mandates:

```text
Capability → Workbench Request → Workbench Manager → UI Update
```

A transport mechanism is required. Options include direct manager calls, React context, custom events, or an event bus shared with the future Platform Event Bus (Document 029).

## Decision

Sprint 003 uses a **typed in-process Workbench Request Bus**.

### Model

```typescript
// Conceptual — implementation in Phase 1/7

type WorkbenchRequest =
  | {
      type: "openView";
      viewId: string;
      workspace?: string;
      params?: Record<string, unknown>;
    }
  | { type: "closeView"; viewId: string }
  | { type: "focusView"; viewId: string }
  | { type: "openPanel"; panelId: "sidebar" | "context"; tabKey?: string }
  | { type: "closePanel"; panelId: "sidebar" | "context" }
  | { type: "revealNavigationItem"; navId: string }
  | { type: "setContext"; contextKey: string; payload?: Record<string, unknown> }
  | { type: "setSelection"; selection: WorkbenchSelection };

interface WorkbenchRequestResult {
  ok: boolean;
  error?: WorkbenchRequestError;
}

interface WorkbenchRequestBus {
  publish(request: WorkbenchRequest): WorkbenchRequestResult;
  subscribe(listener: (state: WorkbenchState) => void): () => void;
}
```

### Flow

```text
Capability code
    │  bus.publish({ type: "openView", viewId: "..." })
    ▼
WorkbenchRequestBus (singleton, in-process)
    │  validate request shape
    ▼
Workbench Manager.handleRequest()
    │  permission check (ADR-0023)
    │  route to sub-manager
    ▼
Sub-manager updates state → React re-render
```

### Rules

| Rule                         | Detail                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Single entry point           | All UI orchestration requests go through the bus → Workbench Manager                                           |
| No direct sub-manager access | Capabilities must not import LayoutManager, ViewManager, etc.                                                  |
| Synchronous dispatch         | `publish()` returns `WorkbenchRequestResult` synchronously; sub-managers may schedule async UI work internally |
| Typed discriminated union    | Request `type` field drives routing; no stringly-typed action names                                            |
| Idempotent open              | `openView` for an already-open view focuses instead of duplicating                                             |
| Permission gate              | Workbench Manager rejects requests before sub-manager delegation                                               |

### Capability access pattern

Capabilities receive the bus via **injection at registration time** — not global window access:

```typescript
// Conceptual capability bootstrap
registerCapability({
  id: "example-module",
  onActivate(ctx) {
    ctx.workbench.publish({ type: "openView", viewId: "example-home" });
  },
});
```

Exact injection mechanism (React context vs module init callback) is a Phase 1 implementation detail. The contract is: **capabilities call `publish()` only**.

### Future evolution (not Sprint 003)

| Phase                 | Evolution                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| Milestone 4+          | Optional Event Bus bridge: `PlatformEvent` → Workbench Request adapter for cross-capability UI triggers |
| Future desktop client | Replace in-process bus with IPC transport; preserve request type schema                                 |
| `showNotification`    | Add request type when Notification Manager exists (Milestone 6)                                         |

Sprint 003 does **not** implement Event Bus integration. The request type schema is designed to be serialisable for future transport swaps.

## Alternatives

| Alternative                            | Why rejected                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| Direct Workbench Manager calls         | Bypasses single entry point; harder to audit and test                                  |
| DOM custom events                      | Untyped; no permission gate; breaks SSR                                                |
| Platform Event Bus only (Document 029) | Event Bus not implemented; over-engineered for in-browser Sprint 003                   |
| React Context only (no bus)            | Capabilities would need React dependency; bus keeps non-React capability init possible |

## Consequences

- Phase 1 scaffolds `WorkbenchRequestBus` and stub `WorkbenchManager.handleRequest()`
- Phase 7 completes all request types and capability injection API
- Lint/review rule: capabilities must not import `@apzhub/ui` shell internals for orchestration
- Unit tests mock the bus; integration tests verify request → state → UI path
