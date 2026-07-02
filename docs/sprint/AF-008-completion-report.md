# AF-008 — Completion Report

> **Story:** AF-008 — Workbench API Action Framework integration  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-009**

---

## Objective

Integrate the Action Framework into the public Workbench API so capabilities can execute registered Actions through `WorkbenchAPI`, with complete backward compatibility.

---

## Acceptance criteria

| Criterion                                              | Status |
| ------------------------------------------------------ | ------ |
| Optional `ActionExecutor` injection into Workbench API | ✅     |
| Action Invocation abstraction (foundation)             | ✅     |
| Workbench API execution path                           | ✅     |
| Bridge integration via adapter                         | ✅     |
| Request Bus publication via `workbenchExecute`         | ✅     |
| Diagnostics                                            | ✅     |
| Dependency injection                                   | ✅     |
| Backward compatibility without executor                | ✅     |
| No palette, shortcuts, toolbar, AI, workflow           | ✅     |
| Quality gates pass                                     | ✅     |

---

## Workbench integration summary

### Execution paths

| Configuration         | `executeAction` behaviour                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------ |
| No executor (default) | `actionToRequest` → `host.publish` (unchanged)                                             |
| Executor configured   | `ActionInvocation` → `WorkbenchActionExecutor.execute` → bridge → `workbenchExecute` → bus |

### API changes (additive)

```typescript
createWorkbenchAPI(host, {
  actionExecutor?: WorkbenchActionExecutor;
  actionInvocation?: ActionInvocationService;
});
```

`CreateWorkbenchOptions` on `createWorkbenchRequestBus` accepts the same executor/invocation options.

### Capability context fix

`createCapabilityRegistrationContext()` now returns the **same** `WorkbenchAPI` instance as `getWorkbenchAPI()` — executor wiring is shared with capabilities.

### Diagnostics extension

`WorkbenchDiagnosticsSnapshot` adds:

| Field              | Content                                                   |
| ------------------ | --------------------------------------------------------- |
| `actionExecution`  | `executorConfigured`, path counts, success/failure counts |
| `actionInvocation` | `invocationCount`, `lastInvocationAt`                     |

### Command-framework adapter

`createWorkbenchActionExecutorAdapter()` wires:

- `DefaultActionExecutor` + `DefaultWorkbenchCommandBridge`
- `workbenchExecute: (action) => host.publish(actionToRequest(action))`

No circular package dependency — `WorkbenchActionExecutor` interface lives in workbench-framework.

### Package status

`COMMAND_FRAMEWORK_STATUS = "integration"`

---

## Action Invocation summary

### `ActionInvocationService`

| Component                  | Role                                         |
| -------------------------- | -------------------------------------------- |
| `invoke(action, context?)` | Builds normalised `ActionInvocation`         |
| `actionPayload(action)`    | Serialises `WorkbenchAction` → executor args |
| `ActionInvocationContext`  | Extension points (structure only)            |

### Extension points (documented, not consumed in AF-008)

| Field               | Future use               |
| ------------------- | ------------------------ |
| `retry`             | Retry policies           |
| `cancellationToken` | Cooperative cancellation |
| `schedule`          | Deferred execution       |
| `ai`                | AI agent orchestration   |
| `workflow`          | Workflow correlation     |
| `telemetry`         | Trace/correlation ids    |

### Default implementation

`createDefaultActionInvocationService()` — tracks invocation diagnostics.

---

## Canonical execution pipeline

```text
Action Request (WorkbenchAPI.executeAction)
    ↓
Action Invocation (ActionInvocationService)
    ↓
Registry Lookup (ActionExecutor)
    ↓
Permission Check (WorkbenchPermissionAdapter)
    ↓
Execution Context
    ↓
Handler Resolution
    ↓
Workbench Command Bridge
    ↓
Workbench Request (actionToRequest → host.publish)
    ↓
Workbench Manager
    ↓
Result (mapped to WorkbenchRequestResult)
```

---

## Files added / modified

| Package             | File                                                   | Change                      |
| ------------------- | ------------------------------------------------------ | --------------------------- |
| workbench-framework | `api/action-invocation.ts`                             | **New**                     |
| workbench-framework | `api/action-payload.ts`                                | **New**                     |
| workbench-framework | `api/workbench-action-executor.ts`                     | **New**                     |
| workbench-framework | `api/action-execution-diagnostics.ts`                  | **New**                     |
| workbench-framework | `api/map-action-executor-result.ts`                    | **New**                     |
| workbench-framework | `api/create-workbench-api.ts`                          | Executor path + diagnostics |
| workbench-framework | `request-bus/request-bus.ts`                           | DI + shared API instance    |
| command-framework   | `integration/workbench-action-executor-adapter.ts`     | **New**                     |
| command-framework   | `executor/default-action-executor.ts`                  | `executeSync`               |
| Tests               | `create-workbench-api.test.ts`, adapter test, bus test | **New/updated**             |

---

## Test results

| Suite                                       | Tests                   |
| ------------------------------------------- | ----------------------- |
| `create-workbench-api.test.ts`              | 8 (+3)                  |
| `action-payload.test.ts`                    | 2                       |
| `request-bus-action-executor.test.ts`       | 1                       |
| `workbench-action-executor-adapter.test.ts` | 1                       |
| **Monorepo total**                          | **478** (+21 vs AF-007) |

### Scenarios covered

- Legacy publish path without executor
- Executor delegation on `executeAction`
- Permission denial at API boundary (both paths)
- Executor failure mapping to `WorkbenchRequestResult`
- Action execution diagnostics
- Request bus DI + shared capability API
- End-to-end adapter → bridge → publish

---

## Coverage

| Area                                   | Lines | Branches | Threshold |
| -------------------------------------- | ----- | -------- | --------- |
| `workbench-framework/src/api/**`       | ~92%  | ~88%     | 80%       |
| `command-framework/src/integration/**` | ~95%  | ~90%     | 80%       |
| Monorepo aggregate                     | ~91%  | ~87%     | —         |

---

## Quality gates

| Gate                 | Result              |
| -------------------- | ------------------- |
| `pnpm lint`          | ✅ Pass             |
| `pnpm typecheck`     | ✅ Pass             |
| `pnpm build`         | ✅ Pass             |
| `pnpm test`          | ✅ Pass — 478 tests |
| `pnpm test:coverage` | ✅ Pass             |
| `pnpm test:e2e`      | ✅ Pass — 15 tests  |

---

## Technical debt

| ID        | Item                                                             | Target                           |
| --------- | ---------------------------------------------------------------- | -------------------------------- |
| TD-AF8-01 | Built-in workbench actions not in ActionRegistry until catalogue | AF-009                           |
| TD-AF8-02 | App bootstrap does not wire executor to RequestBus yet           | AF-020                           |
| TD-AF8-03 | `execute()` raw requests bypass ActionExecutor                   | By design — requests not actions |
| TD-AF8-04 | ActionInvocation extension fields unused                         | Future milestones                |
| TD-AF8-05 | Duplicate permission check (API + executor registry)             | Acceptable defence-in-depth      |

---

## Recommendations for AF-009

1. **Register built-in catalogue** — programmatically register all `REQUEST_COMMAND_MAP` actions in `DefaultActionRegistry` at bootstrap.

2. **Descriptor metadata** — label, handler `workbench-bridge:{id}`, `source: "builtin"`.

3. **Integration test** — catalogue + executor + API `views.open` without manual registry setup in tests.

4. **Do not wire** Command Palette or UI surfaces — AF-009 is catalogue only per backlog.

5. **Consider** auto-registering catalogue when `createWorkbenchActionExecutorStack` is used without pre-populated registry.

---

## Stop condition

AF-008 complete. **Do not begin AF-009** until this report is reviewed and approved.

---

_AF-008 Completion Report — Sprint 004 Action Framework._
