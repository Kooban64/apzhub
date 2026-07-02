# SPR-003 — Phase 7 Report

> **Date:** 2026-06-28  
> **Sprint:** SPR-003 — Workbench Framework  
> **Phase:** 7 — Workbench API & Permission Integration  
> **Prerequisite:** [Phase 6 report](./SPR-003-phase-6-report.md) — approved  
> **Recommendation:** **READY FOR SPRINT 003 CLOSEOUT** (awaiting architecture review)

---

## Summary

Phase 7 delivers the **public Workbench API** — the supported interface between platform capabilities and the Workbench Framework. Capabilities interact via typed `WorkbenchAPI` methods and Workbench Requests/Actions only; engines remain internal to Workbench Manager.

Also delivered: **`AuthWorkbenchPermissionAdapter`**, server-side registry filtering, permission-aware dependency injection, and Sprint 004 command evolution extension points.

**Out of scope (as specified):** Command Palette, keyboard shortcuts, Search, Notifications, business capabilities, external integrations, Registry UI, full IAM PermissionService.

---

## Architecture

```text
Capability bootstrap
        │
        ▼
createWorkbenchCapabilityContext() → WorkbenchAPI
        │
        ├── execute(request)        ─┐
        ├── executeAction(action)   ─┤ Workbench Manager (orchestrator)
        └── views/panels/...        ─┘
                │
                ▼
        Internal engines (not exported to capabilities)
                │
                ▼
        React shell re-render

Server hydration
        │
        ▼
Auth session → AuthWorkbenchPermissionAdapter
        │
        ▼
filterWorkbenchRegistryDto() → client-safe DTO
```

---

## Public Workbench API (`WorkbenchAPI` v1.0)

| Surface                       | Purpose                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `execute(request)`            | Raw Workbench Request dispatch                            |
| `executeAction(action)`       | Workbench Action dispatch (Sprint 004 precursor)          |
| `getState()`                  | Read-only aggregated workbench state                      |
| `subscribe(listener)`         | State change notifications                                |
| `getDiagnostics()`            | Navigation, view, session, context, selection, permission |
| `views.*`                     | Typed open / close / focus                                |
| `panels.*`                    | Typed open / close                                        |
| `navigation.reveal()`         | Reveal hidden nav item                                    |
| `context.set()`               | Context panel key + payload                               |
| `selection.set()` / `clear()` | Selection management                                      |

**Capability injection:**

```typescript
const { workbench } = bus.createCapabilityRegistrationContext();
workbench.views.open("platform-home-overview", { workspace: "home" });
```

**React hook:** `useWorkbenchAPI()` (shell and in-app capabilities)

---

## Workbench Action model (Sprint 004 preparation)

| Workbench Request      | Action id                     |
| ---------------------- | ----------------------------- |
| `openView`             | `workbench.view.open`         |
| `closeView`            | `workbench.view.close`        |
| `focusView`            | `workbench.view.focus`        |
| `openPanel`            | `workbench.panel.open`        |
| `closePanel`           | `workbench.panel.close`       |
| `revealNavigationItem` | `workbench.navigation.reveal` |
| `setContext`           | `workbench.context.set`       |
| `setSelection`         | `workbench.selection.set`     |

Helpers: `actionToRequest()`, `requestToAction()`, `requestToActionId()`

**Sprint 004 extension points (documented, not implemented):**

- `WorkbenchCommandBridge.toAction()` — map Platform Command id → Workbench Action
- `WorkbenchCommandEvolutionMetadata` — palette category, shortcut placeholders
- `REQUEST_COMMAND_MAP` — stable command id registry

Evolution path: **WorkbenchRequest → WorkbenchAction → Platform Command**

---

## Permission integration

| Component                            | Role                                                          |
| ------------------------------------ | ------------------------------------------------------------- |
| `AuthWorkbenchPermissionAdapter`     | Session-backed; deny-by-default for declared keys             |
| `createWorkbenchPermissionAdapter()` | Environment-aware factory (test/dev → allow-all; prod → auth) |
| `filterWorkbenchRegistryDto()`       | Server-side hide-not-disable filtering                        |
| Manager gate                         | Rejects requests before engine delegation                     |
| API gate                             | Action-level `permission` field checked before dispatch       |

**Auth rules (ADR-0023):**

- Items **without** `permission` → allowed
- Items **with** `permission` → require key in session context
- Empty RBAC until Milestone 8 → administration surfaces hidden in production

**Wiring:**

- `WorkbenchProvider` — injects permission adapter from auth context
- `loadWorkbenchRegistryDto()` — filters registry server-side with session

---

## Dependency injection

| Injection point                                         | Usage                                        |
| ------------------------------------------------------- | -------------------------------------------- |
| `CreateWorkbenchOptions.dependencies.permissionAdapter` | Custom adapter in tests/apps                 |
| `WorkbenchProvider.authPermissionContext`               | Client auth session                          |
| `WorkbenchProvider.permissionMode`                      | Override (`allow-all` / `auth` / `scaffold`) |
| `createWorkbenchCapabilityRegistrationContext()`        | Capability bootstrap                         |

Engines are **not** exposed on public API. `getManager()` remains test/shell-internal only.

---

## Test results

| Metric           | Result         |
| ---------------- | -------------- |
| New unit tests   | +18            |
| Total unit tests | **383 passed** |
| E2E tests        | **15 passed**  |

### Key test files

| File                                | Coverage focus                             |
| ----------------------------------- | ------------------------------------------ |
| `create-workbench-api.test.ts`      | Public API, permission gate, typed helpers |
| `workbench-actions.test.ts`         | Action ↔ request mapping                   |
| `auth-permission-adapter.test.ts`   | Deny-by-default, session updates           |
| `create-permission-adapter.test.ts` | Environment factory                        |
| `server-filter.test.ts`             | Registry DTO filtering                     |
| `request-bus.test.ts`               | Capability registration context            |

---

## Coverage

| Module                       | Lines (approx.) |
| ---------------------------- | --------------- |
| `api/*`                      | ~85%            |
| `permission/auth`            | ~97%            |
| `permission/create`          | ~95%            |
| Repository aggregate         | **~91%**        |
| workbench-framework branches | **≥ 80%**       |

All repository coverage thresholds pass.

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm test`          | ✅ 383 passed |
| `pnpm test:coverage` | ✅ Pass       |
| `pnpm test:e2e`      | ✅ 15 passed  |

---

## Technical debt

| ID       | Item                                                                    | Target             |
| -------- | ----------------------------------------------------------------------- | ------------------ |
| TD-P7-01 | RBAC permissions not populated from `@apzhub/auth` session              | Milestone 8        |
| TD-P7-02 | `WorkbenchCommandBridge` not implemented                                | Sprint 004         |
| TD-P7-03 | `getManager()` still accessible on bus for shell — document as internal | Hardening          |
| TD-P7-04 | Engine classes still exported from package index (legacy)               | Closeout cleanup   |
| TD-P7-05 | Deep link route guard not implemented                                   | Phase 8 / closeout |

---

## Recommendation for Sprint 003 closeout

### **READY FOR SPRINT 003 CLOSEOUT** (awaiting architecture review)

Phase 8 (closeout) should:

1. Coverage audit and E2E suite consolidation (`spr-003-workbench-framework.spec.ts`)
2. Architecture review update and closeout report
3. Recommend `v0.3.0-workbench-framework` tag (when instructed)
4. Optional: restrict engine exports from public package surface

Phase 7 is complete. **Stop here — await architecture review before Sprint 003 closeout.**

---

## Files changed (reference)

| Area          | Files                                                                     |
| ------------- | ------------------------------------------------------------------------- |
| Public API    | `api/workbench-api.ts`, `create-workbench-api.ts`, `workbench-actions.ts` |
| Permission    | `permission/auth-permission-adapter.ts`, `create-permission-adapter.ts`   |
| Server filter | `server.ts` (`filterWorkbenchRegistryDto`)                                |
| Bus / React   | `request-bus.ts`, `react/workbench-context.tsx`                           |
| App wiring    | `apps/web/lib/workbench-hydration.ts`                                     |
| Evolution     | `interfaces/command-evolution.ts`                                         |
| Tests         | `api/*.test.ts`, `permission/*.test.ts`, `server-filter.test.ts`          |
