# SPR-003 — Phase 5 Report

> **Date:** 2026-06-28  
> **Sprint:** SPR-003 — Workbench Framework  
> **Phase:** 5 — Session Engine  
> **Prerequisite:** [Phase 4 report](./SPR-003-phase-4-report.md) — approved  
> **Recommendation:** **READY FOR PHASE 6** (awaiting architecture review)

---

## Summary

Phase 5 delivers a **Session Engine** with versioned session schema, **localStorage persistence** (ADR-0021), restore on login/app load, permission re-validation, safe handling of invalid/stale data, and session diagnostics.

Persisted state includes active workspace, focused view, activity bar / sidebar selection, panel preferences, layout region visibility, dock split ratios, and selection snapshot.

**Out of scope (as specified):** Tab bar, multi-session management, shared sessions, workspace templates, business modules, Command Framework, Search, Notifications, external integrations, PostgreSQL sync.

---

## Session architecture

```text
Workbench state change
        │
        ▼
SessionEngine.capture(state, navigation)
        │
        ▼
Debounced SessionStore.save(userId, payload)
        │
        ▼
localStorage key: apzhub:workbench:session:{userId}

Login / client mount
        │
        ▼
SessionStore.load(userId)
        │
        ▼
parseWorkbenchSessionPayload() + sanitizeSessionForRestore()
        │
        ├── Permission adapter re-validation
        ├── Invalid field dropping
        └── Version mismatch → clear + fallback
        │
        ▼
Apply to Navigation / View / Panel / Layout / Dock / Selection engines
```

---

## Session schema (`WorkbenchSessionPayload` v1.0)

| Field                     | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| `schemaVersion`           | `"1.0"` — forward-compatible migrations              |
| `activeWorkspace`         | Active workspace id                                  |
| `focusedViewId`           | Active view                                          |
| `activeActivityBarItemId` | Activity bar selection                               |
| `activeSidebarItemId`     | Sidebar selection                                    |
| `openViews`               | Focused view entry (single-view Phase 5; no tab bar) |
| `panels`                  | Sidebar/context collapse + width + active tab        |
| `layout.regions`          | Shell region visibility preferences                  |
| `dock.splitRatios`        | Basic dock geometry placeholder                      |
| `selection`               | Selection engine snapshot                            |
| `capturedAt`              | ISO timestamp                                        |

Storage key: `apzhub:workbench:session:{userId}`

---

## Session Engine

| Responsibility    | Implementation                                                    |
| ----------------- | ----------------------------------------------------------------- |
| Capture           | `SessionEngine.capture()` via `captureWorkbenchSession()`         |
| Restore           | `SessionEngine.restore()` with engine apply targets               |
| Persist           | `SessionEngine.persist()` → `SessionStore.save()`                 |
| Clear             | `SessionEngine.clear()` on logout                                 |
| Diagnostics       | `SessionDiagnostics` on engine state                              |
| Invalid data      | Parse failure → clear storage, fallback to defaults               |
| Version mismatch  | `schemaVersion !== "1.0"` → clear + diagnostics                   |
| Permission filter | `sanitizeSessionForRestore()` drops unauthorised views/workspaces |

---

## Store abstraction

| Store                      | Use                                         |
| -------------------------- | ------------------------------------------- |
| `SessionStore`             | Typed interface (`load` / `save` / `clear`) |
| `MemorySessionStore`       | Unit tests, injected test doubles           |
| `LocalStorageSessionStore` | Production default in `WorkbenchProvider`   |

PostgreSQL / server sync deferred per ADR-0021.

---

## Workbench Manager integration

| API                                | Behaviour                               |
| ---------------------------------- | --------------------------------------- |
| `restoreSession(userId)`           | Load, sanitize, apply, notify           |
| `enableSessionPersistence(userId)` | Debounced save on state changes (300ms) |
| `disableSessionPersistence()`      | Stop saves on unmount                   |
| `clearSession(userId)`             | Remove persisted session (logout)       |
| `getSessionDiagnostics()`          | Expose restore/persist status           |

---

## App wiring

| File                           | Role                                             |
| ------------------------------ | ------------------------------------------------ |
| `workbench-shell-provider.tsx` | Passes `session?.user.id` to `WorkbenchProvider` |
| `workbench-context.tsx`        | Client-only bus bootstrap; restore + persistence |
| `workbench-page.tsx`           | Clears session on sign-out                       |

Restore runs after registry hydration. If no session exists, default view activation applies.

---

## React hooks

```typescript
useSessionDiagnostics(): SessionDiagnostics
useWorkbenchNavigationActions().clearSession(userId)
useWorkbenchNavigationActions().getSessionDiagnostics()
```

---

## APIs summary

| Export path                         | Key symbols                                                                                                                                                                                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@apzhub/workbench-framework`       | `SessionEngine`, `createSessionEngine`, `WorkbenchSessionPayload`, `parseWorkbenchSessionPayload`, `captureWorkbenchSession`, `sanitizeSessionForRestore`, `SessionStore`, `MemorySessionStore`, `LocalStorageSessionStore`, `createWorkbenchSessionStorageKey` |
| `@apzhub/workbench-framework/react` | `useSessionDiagnostics`, extended `useWorkbenchNavigationActions`                                                                                                                                                                                               |

---

## Test results

| Metric           | Result                                  |
| ---------------- | --------------------------------------- |
| New unit tests   | +16                                     |
| Total unit tests | **347 passed**                          |
| E2E tests        | **14 passed** (+1 session restore spec) |

### Key test files

| File                                  | Coverage focus                                  |
| ------------------------------------- | ----------------------------------------------- |
| `workbench-session-payload.test.ts`   | Schema parse, version mismatch, invalid payload |
| `session-restore.test.ts`             | Permission-filtered restore                     |
| `memory-session-store.test.ts`        | Save/load/clear, key format                     |
| `local-storage-session-store.test.ts` | localStorage persistence, corrupt data recovery |
| `session-engine.test.ts`              | Restore apply targets, persist capture          |
| `workbench-manager.test.ts`           | End-to-end manager restore                      |
| `workbench-context.test.tsx`          | Provider restore with memory store              |
| `spr-003-workbench-session.spec.ts`   | E2E reload restores Overview view               |

---

## Coverage

| Module               | Lines     | Branches  |
| -------------------- | --------- | --------- |
| `session/*`          | ≥ 90%     | ≥ 85%     |
| `session-engine`     | ≥ 85%     | ≥ 80%     |
| Repository aggregate | **91.8%** | **87.2%** |

All repository coverage thresholds pass.

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm test`          | ✅ 347 passed |
| `pnpm test:coverage` | ✅ Pass       |
| `pnpm test:e2e`      | ✅ 14 passed  |

---

## Technical debt

| ID       | Item                                                                 | Target         |
| -------- | -------------------------------------------------------------------- | -------------- |
| TD-P5-01 | Tab bar not implemented — only focused view persisted                | Future phase   |
| TD-P5-02 | Auth-backed permission adapter still deferred (allow-all in dev)     | Phase 7 / RBAC |
| TD-P5-03 | PostgreSQL / server session store not implemented                    | Milestone 8    |
| TD-P5-04 | Provider returns `null` until client bus ready — brief loading flash | UX polish      |
| TD-P5-05 | Dock split ratios persisted but dock UI not interactive              | Phase 6+       |
| TD-P5-06 | Route sync vs restore ordering may double-navigate on deep links     | Hardening      |

---

## Recommendation for Phase 6

### **READY FOR PHASE 6** (awaiting architecture review)

Phase 6 should implement:

1. **Context Engine** — context panel behaviour per implementation plan
2. **Selection Engine** — selection propagation beyond session snapshot restore
3. **Session-backed permission adapter scaffold** — deny-by-default for undeclared permissions when RBAC data arrives

Phase 5 is complete. **Stop here — await architecture review before Phase 6.**

---

## Files changed (reference)

| Area                 | Files                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------- |
| Session schema       | `session/workbench-session-payload.ts`, `session-capture.ts`, `session-restore.ts`      |
| Stores               | `session/session-store.ts`, `memory-session-store.ts`, `local-storage-session-store.ts` |
| Session Engine       | `engines/session-engine/session-engine.ts`                                              |
| Engine apply helpers | `panel-engine`, `layout-engine`, `view-engine`, `scaffold-engines`                      |
| Manager / bus        | `workbench-manager.ts`, `request-bus.ts`                                                |
| React                | `react/workbench-context.tsx`                                                           |
| App                  | `workbench-shell-provider.tsx`, `workbench-page.tsx`                                    |
| E2E                  | `spr-003-workbench-session.spec.ts`                                                     |
