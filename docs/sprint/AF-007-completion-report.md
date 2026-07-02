# AF-007 — Completion Report

> **Story:** AF-007 — DefaultWorkbenchCommandBridge  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-008**

---

## Objective

Implement the Default Workbench Command Bridge. The bridge translates Action execution into Workbench requests without executing UI logic.

---

## Acceptance criteria

| Criterion                                                       | Status |
| --------------------------------------------------------------- | ------ |
| `DefaultWorkbenchCommandBridge` implemented                     | ✅     |
| Mapping from Action IDs to Workbench actions/requests           | ✅     |
| All `REQUEST_COMMAND_MAP` action ids supported                  | ✅     |
| Request translation via `actionToRequest`                       | ✅     |
| Structured bridge diagnostics                                   | ✅     |
| Error handling for unsupported/invalid mappings (`null`)        | ✅     |
| Dependency injection factory                                    | ✅     |
| Public bridge interfaces                                        | ✅     |
| Canonical execution pipeline documented                         | ✅     |
| No UI, permissions, Runtime mutation, Workbench Manager changes | ✅     |
| Quality gates pass                                              | ✅     |

---

## Bridge API summary

### `ActionWorkbenchCommandBridge`

Extends `WorkbenchCommandBridge` from `@apzhub/workbench-framework`.

| Method                           | Returns                             | Behaviour                                           |
| -------------------------------- | ----------------------------------- | --------------------------------------------------- |
| `supports(actionId)`             | `boolean`                           | Whether id is in `REQUEST_COMMAND_MAP`              |
| `toAction(commandId, payload?)`  | `WorkbenchAction \| null`           | Map payload → action; `null` if unsupported/invalid |
| `toRequest(commandId, payload?)` | `WorkbenchRequest \| null`          | `toAction` + `actionToRequest`                      |
| `getDiagnostics()`               | `WorkbenchCommandBridgeDiagnostics` | Translation metrics                                 |

### Payload requirements

| Action ID                     | Required payload                     |
| ----------------------------- | ------------------------------------ |
| `workbench.view.open`         | `viewId`                             |
| `workbench.view.close`        | `viewId`                             |
| `workbench.view.focus`        | `viewId`                             |
| `workbench.panel.open`        | `panelId` (`sidebar` \| `context`)   |
| `workbench.panel.close`       | `panelId`                            |
| `workbench.navigation.reveal` | `navId`                              |
| `workbench.context.set`       | `contextKey` or `context`            |
| `workbench.selection.set`     | `selection.items` (or `mode: clear`) |

### Factories

| Export                                  | Purpose                   |
| --------------------------------------- | ------------------------- |
| `createDefaultWorkbenchCommandBridge()` | New bridge instance       |
| `defaultWorkbenchCommandBridgeFactory`  | DI factory `{ create() }` |
| `WORKBENCH_BRIDGE_ACTION_IDS`           | Supported id list         |
| `isWorkbenchBridgeActionId(id)`         | Type guard                |

### Package status

`COMMAND_FRAMEWORK_STATUS = "bridge"`

---

## Canonical execution pipeline

Documented in bridge JSDoc, package README, and this report:

```text
Action Request
    ↓
Registry Lookup
    ↓
Permission Check (WorkbenchPermissionAdapter)
    ↓
Execution Context
    ↓
Handler Resolution
    ↓
Workbench Command Bridge
    ↓
Workbench Request
    ↓
Workbench Manager
    ↓
Result
```

The bridge operates at the **Handler Resolution → Workbench Request** boundary. It translates and routes only.

---

## Files added / modified

| File                                                  | Change                                             |
| ----------------------------------------------------- | -------------------------------------------------- |
| `src/bridge/default-workbench-command-bridge.ts`      | **New** — core bridge                              |
| `src/bridge/default-workbench-command-bridge.test.ts` | **New** — 14 tests                                 |
| `src/bridge/workbench-command-bridge.ts`              | **New** — `ActionWorkbenchCommandBridge` interface |
| `src/bridge/bridge-diagnostics.ts`                    | **New** — diagnostics types                        |
| `src/bridge/workbench-bridge-action-ids.ts`           | **New** — id constants                             |
| `src/bridge/index.ts`                                 | **New** — exports                                  |
| `src/index.ts`                                        | Public bridge exports                              |
| `src/status.ts`                                       | Status → `"bridge"`                                |
| `src/executor/default-action-executor.test.ts`        | Uses real bridge in success test                   |
| `README.md`                                           | Pipeline + bridge docs                             |

---

## Test results

| Suite                                       | Tests                   |
| ------------------------------------------- | ----------------------- |
| `default-workbench-command-bridge.test.ts`  | 14                      |
| `default-action-executor.test.ts` (updated) | 9                       |
| **Package total**                           | **86**                  |
| **Monorepo total**                          | **471** (+14 vs AF-006) |

### Scenarios covered

- One test per `REQUEST_COMMAND_MAP` action id
- Unsupported action ids → `null` + diagnostics
- Invalid payloads → `null` + diagnostics
- `toRequest` consistency with `actionToRequest`
- Bridge diagnostics counters
- DI factory
- Executor integration with real bridge

---

## Coverage

| Area                                   | Lines | Branches | Threshold |
| -------------------------------------- | ----- | -------- | --------- |
| `command-framework/src/bridge/**`      | ~95%  | ~90%     | 80%       |
| `command-framework/src/**` (aggregate) | ~91%  | ~87%     | 80%       |
| Monorepo aggregate                     | ~91%  | ~87%     | —         |

---

## Quality gates

| Gate                 | Result              |
| -------------------- | ------------------- |
| `pnpm lint`          | ✅ Pass             |
| `pnpm typecheck`     | ✅ Pass             |
| `pnpm build`         | ✅ Pass             |
| `pnpm test`          | ✅ Pass — 471 tests |
| `pnpm test:coverage` | ✅ Pass             |
| `pnpm test:e2e`      | ✅ Pass — 15 tests  |

---

## Technical debt

| ID        | Item                                                                  | Target                       |
| --------- | --------------------------------------------------------------------- | ---------------------------- |
| TD-AF7-01 | `createWorkbenchAPI` not wired to executor — AF-008                   | AF-008                       |
| TD-AF7-02 | Built-in action catalogue not registered in registry                  | AF-009                       |
| TD-AF7-03 | `workbenchExecute` still injected manually at app boundary            | AF-008                       |
| TD-AF7-04 | Manifest-declared workbench-bridge actions rely on same payload shape | Document in capability guide |
| TD-AF7-05 | Bridge diagnostics not exposed in platform health endpoint            | Future                       |

---

## Recommendations for AF-008

1. **Wire optional `ActionExecutor` into `createWorkbenchAPI()`** — when provided, `executeAction` calls `executor.execute()` instead of direct `bus.publish`.

2. **Define minimal `WorkbenchActionExecutor` interface** in workbench-framework to avoid circular dependency.

3. **Default app wiring** — inject `createDefaultWorkbenchCommandBridge()` + `createDefaultActionExecutor()` with `workbenchExecute` closure calling `bus.publish(actionToRequest(action))`.

4. **Preserve backward compatibility** — existing API tests must pass without executor injection.

5. **Do not modify** Workbench Manager or public WorkbenchAPI method signatures.

6. **Integration test** — mock executor receives execute on `executeAction` when injected.

---

## Stop condition

AF-007 complete. **Do not begin AF-008** until this report is reviewed and approved.

---

_AF-007 Completion Report — Sprint 004 Action Framework._
