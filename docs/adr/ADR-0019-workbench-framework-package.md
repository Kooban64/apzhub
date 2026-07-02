# ADR-0019 — Workbench Framework Package

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-003 Phase 0  
> **Decided by:** Project owner (Sprint 003 Phase 0 approval)  
> **Related:** [ADR-0018](./ADR-0018-platform-runtime-package.md) · [workbench-framework.md](../architecture/workbench-framework.md)

## Problem

Sprint 003 requires a home for Workbench Manager, sub-managers, and the Workbench Request model. Two options exist:

1. Create a dedicated `@apzhub/workbench-framework` package.
2. Extend `@apzhub/workspace` (Desktop Shell) with manager logic.

`@apzhub/workspace` today is a thin React shell composition layer over `@apzhub/ui`. Mixing behavioural orchestration (managers, request routing, session state) into the shell package would blur boundaries, complicate testing, and create coupling between visual composition and UI orchestration logic.

## Decision

Create a **new package**:

| Item           | Value                           |
| -------------- | ------------------------------- |
| Package path   | `packages/workbench-framework/` |
| npm name       | `@apzhub/workbench-framework`   |
| Primary export | `@apzhub/workbench-framework`   |

### Package responsibilities

`@apzhub/workbench-framework` owns:

- Workbench Manager and all sub-managers (Layout, Panel, View, Navigation, Workspace, Session, Dock, Context, Selection)
- Workbench Request types and in-process request bus ([ADR-0020](./ADR-0020-workbench-request-transport.md))
- Session state abstraction ([ADR-0021](./ADR-0021-workbench-session-persistence.md))
- Workbench permission adapter consumption ([ADR-0023](./ADR-0023-workbench-permission-adapter.md))
- Client-side registry hydration types (WorkbenchRegistryDTO)
- Workbench diagnostics and state subscription APIs

### Package does **not** own

- Platform Runtime orchestration (remains `@apzhub/platform-runtime`)
- Shell visual primitives (remain `@apzhub/ui`)
- Desktop Shell route composition scaffold (remains `@apzhub/workspace`)
- Authentication implementation (remains `@apzhub/auth`)
- Business capabilities

### Dependency direction

```text
apps/web
    ↓
@apzhub/workbench-framework
    ↓
@apzhub/workspace · @apzhub/ui · @apzhub/auth · react
    ↓
(no dependency on @apzhub/platform-runtime in browser bundles)

Server (apps/web instrumentation, RSC, route handlers):
    ↓
@apzhub/platform-runtime/server  →  WorkbenchRegistryDTO  →  client hydration
```

**Rule:** `@apzhub/workbench-framework` must **not** import `@apzhub/platform-runtime` in client-exported modules. Server-side hydration helpers may live in `@apzhub/workbench-framework/server` and import runtime only on the server boundary.

**Rule:** `@apzhub/workspace` must **not** depend on `@apzhub/workbench-framework`. Integration is one-directional: workbench-framework composes workspace shell components; workspace receives props/callbacks from workbench managers.

### Relationship to `@apzhub/workspace`

| Package                       | Role                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `@apzhub/workspace`           | Desktop Shell — permanent layout regions, route scaffold, visual composition |
| `@apzhub/workbench-framework` | Behavioural layer — managers, requests, session, permission filtering        |

Phase 1 will apply **minimal diffs** to `@apzhub/workspace` to accept workbench-driven props. The shell is not rewritten.

### Client/server registry hydration (pattern)

No separate ADR — pattern locked here:

1. **Server:** After `Runtime.bootstrap()`, read `Runtime.registry()` and serialise to a **client-safe `WorkbenchRegistryDTO`** (ids, names, nav metadata, view descriptors — no internal paths or secrets).
2. **Transport:** Pass DTO via React Server Components props or a server API route — not direct manifest file reads on the client.
3. **Client:** Navigation Manager and View Manager hydrate from DTO only.

Security: DTO is filtered server-side by permission adapter before serialisation ([ADR-0023](./ADR-0023-workbench-permission-adapter.md)).

## Alternatives

| Alternative                        | Why rejected                                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Extend `@apzhub/workspace` only    | Conflates shell composition with orchestration; harder to test managers in isolation; violates single-responsibility |
| Merge workbench into `@apzhub/ui`  | UI package must remain presentational; managers are behavioural                                                      |
| Embed workbench in `apps/web` only | Not reusable; blocks future desktop client or Storybook workbench demos                                              |

## Consequences

- New package scaffold required in Phase 1 (not Phase 0)
- `tsconfig.base.json` path alias `@apzhub/workbench-framework`
- `apps/web` adds dependency on workbench-framework
- `@apzhub/workspace` changes limited to prop wiring in later phases
- Milestone 3 release tag: `v0.3.0-workbench-framework` (proposed)
