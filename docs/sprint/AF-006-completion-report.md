# AF-006 — Completion Report

> **Story:** AF-006 — DefaultActionExecutor  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-007**

---

## Objective

Implement the first functional Action Executor responsible only for executing registered actions. No UI integration.

---

## Acceptance criteria

| Criterion                                                 | Status |
| --------------------------------------------------------- | ------ |
| `DefaultActionExecutor` implemented                       | ✅     |
| Execution context with future extension points            | ✅     |
| Permission gate via `WorkbenchPermissionAdapter.can()`    | ✅     |
| Actor attribution (`user`, `system`, `ai-agent`, `voice`) | ✅     |
| Structured `ActionResult`                                 | ✅     |
| Audit hook invocation on every attempt                    | ✅     |
| Registry lookup                                           | ✅     |
| Standard execution lifecycle                              | ✅     |
| Execution diagnostics                                     | ✅     |
| No UI, palette, shortcuts, direct Workbench mutation      | ✅     |
| Quality gates pass                                        | ✅     |

---

## Executor API summary

### `DefaultActionExecutor`

| Method                       | Behaviour                                 |
| ---------------------------- | ----------------------------------------- |
| `execute(request)`           | Full execution lifecycle → `ActionResult` |
| `execute(actionId, context)` | Convenience overload                      |
| `getDiagnostics()`           | Aggregate execution metrics               |

### Constructor dependencies

| Dependency          | Required | Purpose                                              |
| ------------------- | -------- | ---------------------------------------------------- |
| `registry`          | Yes      | Action lookup                                        |
| `permissionAdapter` | Yes      | Permission gate (`can()` only)                       |
| `bridge`            | No       | `WorkbenchCommandBridge` — AF-007                    |
| `workbenchExecute`  | No       | Injected callback — avoids direct Workbench mutation |
| `auditHook`         | No       | Defaults to `noOpActionAuditHook`                    |
| `systemAllowList`   | No       | Deny-by-default for `system` actor                   |

### Factory

```typescript
createDefaultActionExecutor(dependencies: DefaultActionExecutorDependencies): ActionExecutor
```

### Package status

`COMMAND_FRAMEWORK_STATUS = "executor"`

---

## Execution lifecycle summary

```text
execute(request)
    ↓
Normalize request (actionId + ActionContext)
    ↓
Generate auditReference, start timer
    ↓
Actor gate
    ├── ai-agent / voice → NOT_IMPLEMENTED
    └── system → require systemAllowList membership
    ↓
Registry lookup → NOT_FOUND if missing
    ↓
Permission gate → adapter.can(permission) → FORBIDDEN if denied
    ↓
Dispatch by handlerKind
    ├── workbench-bridge → bridge.toAction() → workbenchExecute() → SUCCESS | HANDLER_ERROR
    ├── service / event → NOT_IMPLEMENTED
    └── unknown → HANDLER_ERROR
    ↓
Build ActionResult (status, code, duration, diagnostics, auditReference)
    ↓
auditHook.record(entry)
```

### Execution context (`ActionContext`)

Implemented fields used in AF-006: `actor`, `userId`, `sessionId`, `surface`, `selection`, `workbenchContext`, `args`.

Extension points reserved (documented, not consumed): `tenantId`, `correlationId`, `traceId`, `locale`, `timezone`, `cancellationToken`.

### `ActionResult` shape

| Field            | Description                                                                             |
| ---------------- | --------------------------------------------------------------------------------------- |
| `status`         | `"success"` \| `"failure"`                                                              |
| `ok`             | Boolean outcome                                                                         |
| `code`           | `SUCCESS`, `FORBIDDEN`, `NOT_FOUND`, `INVALID_ARGS`, `HANDLER_ERROR`, `NOT_IMPLEMENTED` |
| `message`        | Human-readable detail                                                                   |
| `payload`        | Handler output (e.g. workbench result)                                                  |
| `diagnostics`    | `{ phase, handlerKind? }`                                                               |
| `durationMs`     | Execution duration                                                                      |
| `auditReference` | Correlates audit entry                                                                  |

### Actor model (ADR-0026)

| Actor      | AF-006 behaviour                                 |
| ---------- | ------------------------------------------------ |
| `user`     | Full dispatch path                               |
| `system`   | Allowed only when `actionId` ∈ `systemAllowList` |
| `ai-agent` | `NOT_IMPLEMENTED` stub                           |
| `voice`    | `NOT_IMPLEMENTED` stub                           |

---

## Files added / modified

| File                                           | Change                         |
| ---------------------------------------------- | ------------------------------ |
| `src/executor/default-action-executor.ts`      | **New** — core executor        |
| `src/executor/default-action-executor.test.ts` | **New** — 9 tests              |
| `src/executor/build-action-result.ts`          | **New** — result builder       |
| `src/executor/action-executor.ts`              | Extended dependencies          |
| `src/types/action-context.ts`                  | Extension point fields         |
| `src/types/action-result.ts`                   | Full structured result         |
| `src/types/action-execution-diagnostics.ts`    | **New**                        |
| `src/types/action-audit.ts`                    | `auditReference`, `durationMs` |
| `src/status.ts`                                | Status → `"executor"`          |
| `src/index.ts`                                 | Public exports                 |

---

## Test results

| Suite                             | Tests                  |
| --------------------------------- | ---------------------- |
| `default-action-executor.test.ts` | 9                      |
| `index.test.ts` (updated)         | 9                      |
| **Package total**                 | **72**                 |
| **Monorepo total**                | **457** (+9 vs AF-005) |

### Scenarios covered

- Successful workbench-bridge execution
- Missing action (`NOT_FOUND`)
- Permission denied (`FORBIDDEN`)
- Audit hook invocation with structured entry
- Structured results (status, code, duration, auditReference, diagnostics)
- Executor aggregate diagnostics
- Service handler `NOT_IMPLEMENTED`
- System actor allow list
- AI/voice actor stubs

---

## Coverage

| Area                                   | Lines | Branches | Threshold |
| -------------------------------------- | ----- | -------- | --------- |
| `command-framework/src/executor/**`    | ~95%  | ~88%     | 80%       |
| `command-framework/src/**` (aggregate) | ~90%  | ~86%     | 80%       |
| Monorepo aggregate                     | ~91%  | ~87%     | —         |

---

## Quality gates

| Gate                 | Result              |
| -------------------- | ------------------- |
| `pnpm lint`          | ✅ Pass             |
| `pnpm typecheck`     | ✅ Pass             |
| `pnpm build`         | ✅ Pass             |
| `pnpm test`          | ✅ Pass — 457 tests |
| `pnpm test:coverage` | ✅ Pass             |
| `pnpm test:e2e`      | ✅ Pass — 15 tests  |

---

## Technical debt

| ID        | Item                                                                                                  | Target                 |
| --------- | ----------------------------------------------------------------------------------------------------- | ---------------------- |
| TD-AF6-01 | `WorkbenchCommandBridge` not implemented — workbench-bridge returns NOT_IMPLEMENTED without injection | AF-007                 |
| TD-AF6-02 | `service` / `event` handlers return NOT_IMPLEMENTED                                                   | Future gateway stories |
| TD-AF6-03 | `createActionFrameworkContext()` still defaults to placeholder executor                               | AF-008 app wiring      |
| TD-AF6-04 | Extension context fields unused (tenant, trace, locale, cancellation)                                 | Future milestones      |
| TD-AF6-05 | Audit hook no-op — Event Bus emission deferred                                                        | Future                 |
| TD-AF6-06 | `ai-agent` / `voice` actor gateways stubbed                                                           | AF-018                 |

---

## Recommendations for AF-007

1. **Implement `DefaultWorkbenchCommandBridge`** — `toAction(commandId, payload)` for all `REQUEST_COMMAND_MAP` ids.

2. **Map payload fields** per foundation spec (`viewId`, `panelId`, `navId`, etc.) — return `null` for invalid payloads.

3. **Register built-in workbench actions** programmatically or document bridge-only resolution path.

4. **Integration test** — bridge + executor + mock `workbenchExecute` round-trip without Workbench Manager.

5. **Do not wire** `createWorkbenchAPI` yet — that is AF-008.

6. **Recommend** INVALID_ARGS when bridge returns null for known id with bad payload.

---

## Stop condition

AF-006 complete. **Do not begin AF-007** until this report is reviewed and approved.

---

_AF-006 Completion Report — Sprint 004 Action Framework._
