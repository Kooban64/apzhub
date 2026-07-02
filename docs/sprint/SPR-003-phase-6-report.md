# SPR-003 — Phase 6 Report

> **Date:** 2026-06-28  
> **Sprint:** SPR-003 — Workbench Framework  
> **Phase:** 6 — Context Engine, Selection Engine & Permission Adapter Scaffold  
> **Prerequisite:** [Phase 5 report](./SPR-003-phase-5-report.md) — approved  
> **Recommendation:** **READY FOR PHASE 7** (awaiting architecture review)

---

## Summary

Phase 6 delivers the **Context Engine**, **Selection Engine**, and an expanded **Workbench Permission Adapter scaffold** with diagnostics. Context tracks active workspace, view, route, navigation selection, and context panel key. Selection supports per-view state with clear, single, and multi modes. Session restore re-validates selection and avoids restoring inaccessible items.

**Out of scope (as specified):** Full IAM PermissionService, business modules, Command Framework, Search, Notifications, external integrations, Registry UI, advanced multi-window behaviour.

---

## Architecture

```text
Navigation / View change
        │
        ▼
WorkbenchManager.syncDerivedState()
        │
        ├── SelectionEngine.switchActiveView(focusedViewId)
        └── ContextEngine.syncFromWorkbench(navigation, views, selection)

Capability request
        │
        ├── setContext → ContextEngine (activeKey + payload)
        └── setSelection → SelectionEngine (per-view, permission-filtered)

Session restore
        │
        ├── sanitizeSessionForRestore() — views/nav (Phase 5)
        └── sanitizeSelectionForRestore() — selection items (Phase 6)
        │
        ▼
Apply after focused view restored (no invalid context/selection)
```

---

## Context Engine

| Field               | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `activeWorkspaceId` | Current workspace                         |
| `activeViewId`      | Focused view                              |
| `activeRoute`       | Route of focused view                     |
| `selectedNavItemId` | Sidebar item matching route               |
| `selectedItemId`    | First selected platform item              |
| `activeKey`         | Context panel provider key (`setContext`) |
| `payload`           | Optional context payload                  |

**Diagnostics:** `ContextDiagnostics` via `getContextDiagnostics()` / `useContextDiagnostics()`

---

## Selection Engine

| Capability        | Implementation                                      |
| ----------------- | --------------------------------------------------- |
| Per-view storage  | `byView: Record<viewId, items[]>`                   |
| Active slice      | `items` + `mode` for focused view                   |
| Clear             | `setSelection({ mode: "clear", items: [] })`        |
| Single            | First accessible item only                          |
| Multi             | All accessible items                                |
| Permission filter | Via `WorkbenchPermissionAdapter` on set and restore |
| View switch       | `switchActiveView()` restores per-view slice        |

**Diagnostics:** `SelectionDiagnostics` — item/view counts, dropped invalid count

---

## Permission Adapter Scaffold

| Adapter                              | Use                                     |
| ------------------------------------ | --------------------------------------- |
| `AllowAllWorkbenchPermissionAdapter` | Dev/test (unchanged default)            |
| `ScaffoldWorkbenchPermissionAdapter` | Production-oriented scaffold (ADR-0023) |

**Scaffold rules:**

- Items **without** `permission` → allowed
- Items **with** `permission` → require key in context (deny if missing)
- `permissions.has("*")` → allow all declared keys
- Diagnostics: `PermissionDiagnostics` — adapter kind, context, denied/filtered counts

**Not implemented:** Full `@apzhub/auth` PermissionService / `AuthWorkbenchPermissionAdapter` (Phase 7)

---

## Workbench Manager integration

| API                          | Behaviour                                               |
| ---------------------------- | ------------------------------------------------------- |
| `syncDerivedState()`         | Keeps context/selection aligned after state changes     |
| `getContextDiagnostics()`    | Context engine diagnostics                              |
| `getSelectionDiagnostics()`  | Selection engine diagnostics                            |
| `getPermissionDiagnostics()` | Permission adapter diagnostics                          |
| Session restore              | View restored **before** selection; selection sanitized |

---

## React hooks

```typescript
useWorkbenchState()
useContextDiagnostics()
useSelectionDiagnostics()
usePermissionDiagnostics()
useWorkbenchNavigationActions().setContext(contextKey, payload?)
useWorkbenchNavigationActions().setSelection(items, { mode?, viewId? })
```

---

## Session interaction

- **Capture:** Full selection state including `byView`
- **Restore:** `sanitizeSelectionForRestore()` drops inaccessible items
- **Order:** Workspace → panels/layout/dock → **focused view** → selection → context sync
- Invalid selection never produces active `selectedItemId` in inaccessible views

---

## Test results

| Metric           | Result                                          |
| ---------------- | ----------------------------------------------- |
| New unit tests   | +11                                             |
| Total unit tests | **358 passed**                                  |
| E2E tests        | **15 passed** (+1 context/session persist spec) |

### Key test files

| File                                          | Coverage focus                                 |
| --------------------------------------------- | ---------------------------------------------- |
| `context-engine.test.ts`                      | setContext, syncFromWorkbench                  |
| `selection-engine.test.ts`                    | single/multi/clear, permission filter, restore |
| `scaffold-permission-adapter.test.ts`         | deny-by-default, diagnostics                   |
| `session-restore.test.ts`                     | Permission-filtered selection on restore       |
| `workbench-manager.test.ts`                   | setContext/setSelection integration            |
| `spr-003-workbench-context-selection.spec.ts` | Persisted context after navigation             |

---

## Coverage

| Module                | Lines (approx.) |
| --------------------- | --------------- |
| `context-engine`      | ~80%            |
| `selection-engine`    | ~82%            |
| `permission/scaffold` | ~85%            |
| Repository aggregate  | **~91%**        |

All repository coverage thresholds pass.

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm test`          | ✅ 358 passed |
| `pnpm test:coverage` | ✅ Pass       |
| `pnpm test:e2e`      | ✅ 15 passed  |

---

## Technical debt

| ID       | Item                                                            | Target             |
| -------- | --------------------------------------------------------------- | ------------------ |
| TD-P6-01 | Context panel UI / manifest providers not wired                 | Phase 7+           |
| TD-P6-02 | `AuthWorkbenchPermissionAdapter` not implemented                | Phase 7            |
| TD-P6-03 | Selection not exposed in shell UI (engine-only)                 | Future UX          |
| TD-P6-04 | Session schema still v1.0 — no dedicated selection version bump | When tab bar lands |
| TD-P6-05 | `setContext` does not auto-open context panel region            | Panel UX polish    |

---

## Recommendation for Phase 7

### **READY FOR PHASE 7** (awaiting architecture review)

Phase 7 should implement:

1. **Complete Workbench Request API** — capability `publish()` injection
2. **`AuthWorkbenchPermissionAdapter`** — session-backed deny-by-default
3. **Permission-filtered shell** — all dynamic surfaces gated at manager boundary

Phase 6 is complete. **Stop here — await architecture review before Phase 7.**

---

## Files changed (reference)

| Area                | Files                                                           |
| ------------------- | --------------------------------------------------------------- |
| Context Engine      | `engines/context-engine/context-engine.ts`                      |
| Selection Engine    | `engines/selection-engine/*`                                    |
| Permission scaffold | `permission/scaffold-permission-adapter.ts`                     |
| Types               | `interfaces/types.ts`, `permission-adapter.ts`, `requests.ts`   |
| Manager / bus       | `workbench-manager.ts`, `request-bus.ts`, `dependencies.ts`     |
| Session             | `session-restore.ts`, `session-capture.ts`, `session-engine.ts` |
| React               | `react/workbench-context.tsx`, `react/index.ts`                 |
| Tests / E2E         | `*.test.ts`, `spr-003-workbench-context-selection.spec.ts`      |
