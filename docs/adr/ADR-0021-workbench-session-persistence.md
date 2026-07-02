# ADR-0021 — Workbench Session Persistence

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-003 Phase 0  
> **Decided by:** Project owner (Sprint 003 Phase 0 approval)  
> **Related:** [Document 018](../018-workspace-sessions-window-management-state-persistence-framework.md) · [ADR-0019](./ADR-0019-workbench-framework-package.md)

## Problem

Document 018 defines rich workspace session semantics (tabs, panel sizes, selection, expanded trees, etc.). Sprint 003 must choose where session state lives and how it persists across page reloads, without over-committing to PostgreSQL or server APIs before Milestone 8 IAM and preferences infrastructure exist.

## Decision

### Sprint 003 — localStorage + typed abstraction

Sprint 003 implements session persistence using:

1. **In-memory session store** — authoritative during active browser session; used for SSR initial hydration and tests.
2. **`SessionStore` abstraction** — typed interface decoupling Session Manager from storage backend.
3. **`localStorage` adapter** — default persistence for Sprint 003; survives page reload within same browser/profile.

```typescript
// Conceptual — implementation in Phase 5

interface WorkbenchSessionPayload {
  schemaVersion: "1.0";
  activeWorkspace: string;
  openViews: Array<{ viewId: string; workspace: string; pinned?: boolean }>;
  focusedViewId?: string;
  panels: {
    sidebar?: { collapsed: boolean; width: number };
    context?: { collapsed: boolean; width: number; activeTab?: string };
  };
  dock?: { splitRatios: Record<string, number> };
  selection?: WorkbenchSelection;
  capturedAt: string; // ISO timestamp
}

interface SessionStore {
  load(userId: string): Promise<WorkbenchSessionPayload | null>;
  save(userId: string, payload: WorkbenchSessionPayload): Promise<void>;
  clear(userId: string): Promise<void>;
}
```

### Storage key convention

```text
apzhub:workbench:session:{userId}
```

User id comes from authenticated session (`@apzhub/auth`). Unauthenticated state is not persisted.

### Restore behaviour

| Step                     | Behaviour                                                                  |
| ------------------------ | -------------------------------------------------------------------------- |
| Login / app mount        | Session Manager calls `SessionStore.load(userId)`                          |
| Permission re-validation | Drop tabs, nav items, and views user no longer authorised to access        |
| Capture                  | Debounced save on meaningful state change (tabs, panels, workspace switch) |
| Logout                   | `SessionStore.clear(userId)`                                               |

### Sprint 003 scope boundary

| In scope                                     | Out of scope                                                 |
| -------------------------------------------- | ------------------------------------------------------------ |
| Session payload schema (Document 018 subset) | Full Document 018 payload (filters, command history, drafts) |
| In-memory + localStorage adapters            | PostgreSQL session table                                     |
| Persistence interface                        | Server-side session API                                      |
| Permission re-validation on restore          | Cross-device sync                                            |

### Future — hybrid persistence (post Sprint 003)

Target architecture for Milestone 8+:

```text
SessionStore
    ├── MemorySessionStore      (tests, SSR bootstrap)
    ├── LocalStorageSessionStore (Sprint 003 default — device-local)
    └── ServerSessionStore       (PostgreSQL via preferences API — cross-device)
```

| Storage      | Use case                            | Milestone                                   |
| ------------ | ----------------------------------- | ------------------------------------------- |
| In-memory    | Active session, tests               | Sprint 003                                  |
| localStorage | Same-browser reload persistence     | Sprint 003                                  |
| PostgreSQL   | Cross-device, admin recovery, audit | Milestone 8 (with Document 023 preferences) |

**Hybrid rule:** Server store wins on login when newer `capturedAt` timestamp; local store used offline or as fallback. Not implemented in Sprint 003 — interface only.

## Alternatives

| Alternative            | Why rejected for Sprint 003                                           |
| ---------------------- | --------------------------------------------------------------------- |
| In-memory only         | Poor UX on page reload; owner preference for localStorage             |
| PostgreSQL immediately | Requires session API, migrations, IAM — premature before M8           |
| Server API without DB  | Adds backend surface before preferences architecture exists           |
| sessionStorage only    | Lost when tab closes; localStorage preferred for workbench continuity |

## Consequences

- Phase 5 implements `SessionManager`, `SessionStore` interface, and `LocalStorageSessionStore`
- Session payload versioned with `schemaVersion` for forward-compatible migrations
- E2E tests may use memory adapter to avoid localStorage flakiness
- No platform-runtime changes — session is client-side Workbench Framework concern
- Document 018 full vision tracked as Milestone 8+ enhancement
