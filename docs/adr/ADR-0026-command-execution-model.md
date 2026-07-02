# ADR-0026 — Command Execution and Actor Model

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-004 — AF-001  
> **Decided by:** Project owner (Sprint 004 authorisation)  
> **Related:** [ADR-0020](./ADR-0020-workbench-request-transport.md) · [ADR-0023](./ADR-0023-workbench-permission-adapter.md) · [ADR-0024](./ADR-0024-command-framework-package.md) · [Document 019](../019-universal-command-palette-action-framework.md)

## Problem

Baseline v1.0 provides `WorkbenchAPI.executeAction()` which maps `WorkbenchAction` → `WorkbenchRequest` → Request Bus directly. Sprint 004 introduces manifest-declared commands, Command Palette, shortcuts, context menus, toolbar, and future automation/AI/voice execution.

A unified execution model is required that:

- Routes all command invocations through one executor
- Enforces permissions consistently (ADR-0023)
- Attributes execution to an **actor** (user, system, AI, voice)
- Preserves Workbench API v1.0 compatibility
- Provides audit extension point without implementing Event Bus

## Decision

Implement **`CommandExecutor`** as the sole dispatch authority for command execution in `@apzhub/command-framework`. UI surfaces and automation gateways call `CommandExecutor.execute()` — never Workbench engines directly.

### Execution flow

```text
UI / Gateway
        ↓
CommandExecutor.execute({ commandId, args, actor, context? })
        ↓
Permission gate (WorkbenchPermissionAdapter)
        ↓
Resolve PlatformCommand from CommandRegistry
        ↓
Dispatch by handler kind
        ├── workbench-bridge → WorkbenchCommandBridge.toAction() → WorkbenchAPI.executeAction()
        ├── service         → ServiceCommandGateway (stub NOT_IMPLEMENTED in S004)
        ├── event           → EventCommandGateway (stub NOT_IMPLEMENTED in S004)
        └── ai-agent/voice  → Actor-specific gateway stubs (AF-018)
        ↓
CommandExecutionResult
        ↓
AuditHook.record() (no-op stub — Event Bus deferred)
```

### CommandExecutor API

```typescript
type CommandActor = "user" | "system" | "ai-agent" | "voice";

interface CommandExecutionRequest {
  readonly commandId: string;
  readonly args?: Record<string, unknown>;
  readonly actor: CommandActor;
  readonly context?: CommandExecutionContext;
}

interface CommandExecutionContext {
  readonly userId?: string;
  readonly sessionId?: string;
  readonly surface?: string;
  readonly selection?: unknown;
  readonly workbenchContext?: unknown;
}

interface CommandExecutionResult {
  readonly ok: boolean;
  readonly commandId: string;
  readonly actor: CommandActor;
  readonly code: CommandResultCode;
  readonly message?: string;
  readonly workbenchResult?: WorkbenchRequestResult;
}

type CommandResultCode =
  | "SUCCESS"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_ARGS"
  | "HANDLER_ERROR"
  | "NOT_IMPLEMENTED";
```

### Actor model

| Actor      | Sprint 004      | Initiator                                  | Permission context                      |
| ---------- | --------------- | ------------------------------------------ | --------------------------------------- |
| `user`     | **Implemented** | Human via palette, shortcut, menu, toolbar | Current session via adapter             |
| `system`   | **Implemented** | Workflow, cron, server job (interface)     | System policy + explicit permission     |
| `ai-agent` | **Stub**        | AI orchestration (future)                  | Agent policy + user delegation (future) |
| `voice`    | **Stub**        | Speech pipeline (future)                   | Same as user + voice session (future)   |

**Rules:**

1. **`user` actor** — default for all shell UI invocations (`useCommandRegistry().execute()`).
2. **`system` actor** — requires explicit registration of allowed system commands; deny by default for undeclared system execution in production.
3. **`ai-agent` and `voice`** — Sprint 004 stubs return `{ ok: false, code: "NOT_IMPLEMENTED" }`. Interfaces exported for future milestones.

### Permission gate

Before dispatch:

```typescript
if (command.permission && !adapter.can(command.permission, ctx)) {
  return { ok: false, code: "FORBIDDEN", commandId, actor };
}
```

Same adapter as Workbench ([ADR-0023](./ADR-0023-workbench-permission-adapter.md)). No duplicate permission logic in executor beyond this gate.

### Workbench API integration (AF-008)

`createWorkbenchAPI()` accepts optional `CommandExecutor`:

```typescript
interface CreateWorkbenchAPIOptions {
  bus: WorkbenchRequestBus;
  executor?: CommandExecutor;  // new — optional
}

// When executor present:
executeAction(action) {
  const commandId = action.id;
  return executor.execute({ commandId, args: actionToArgs(action), actor: "user" });
}

// When executor absent (tests, backward compat):
executeAction(action) {
  return bus.publish(actionToRequest(action));
}
```

**No breaking change** to WorkbenchAPI v1.0 surface — injection is optional at bootstrap.

### WorkbenchCommandBridge

Bridge implementation lives in `@apzhub/command-framework` ([ADR-0024](./ADR-0024-command-framework-package.md)):

```typescript
class DefaultWorkbenchCommandBridge implements WorkbenchCommandBridge {
  toAction(
    commandId: string,
    payload?: Record<string, unknown>,
  ): WorkbenchAction | null;
}
```

Maps:

- Built-in ids from `REQUEST_COMMAND_MAP` values
- Payload fields to WorkbenchAction discriminated union members (`viewId`, `panelId`, `navId`, etc.)

Bridge **does not** publish to Request Bus — returns action only. Executor calls `workbenchAPI.executeAction(action)` or falls back to `actionToRequest` + bus in test mode.

### Audit hook extension point

```typescript
interface CommandAuditHook {
  record(entry: CommandAuditEntry): void;
}

interface CommandAuditEntry {
  readonly commandId: string;
  readonly actor: CommandActor;
  readonly timestamp: string;
  readonly ok: boolean;
  readonly code: CommandResultCode;
  readonly userId?: string;
}

// Sprint 004 default:
const noOpAuditHook: CommandAuditHook = { record: () => {} };
```

Future Event Bus integration replaces hook implementation — no executor redesign.

### Gateway interfaces (AF-018)

```typescript
interface AutomationCommandGateway {
  executeSystemCommand(
    request: CommandExecutionRequest,
  ): Promise<CommandExecutionResult>;
}

interface AiActionGateway {
  proposeAndExecute(
    intent: string,
    context: CommandExecutionContext,
  ): Promise<CommandExecutionResult>;
}

interface VoiceActionGateway {
  executeUtterance(
    utterance: string,
    context: CommandExecutionContext,
  ): Promise<CommandExecutionResult>;
}
```

Sprint 004: export interfaces + stub implementations returning `NOT_IMPLEMENTED`.

### Error policy

| Code              | User-visible behaviour (Sprint 004)                                       |
| ----------------- | ------------------------------------------------------------------------- |
| `FORBIDDEN`       | Silent fail or console diagnostic — no toast unless shell scaffold exists |
| `NOT_FOUND`       | Console diagnostic                                                        |
| `NOT_IMPLEMENTED` | Console diagnostic                                                        |
| `HANDLER_ERROR`   | Console diagnostic; E2E must not throw unhandled                          |

Document 019 rich error UX deferred to UX polish story.

## Alternatives

| Alternative                                | Why rejected                                        |
| ------------------------------------------ | --------------------------------------------------- |
| Palette calls WorkbenchAPI directly        | Bypasses permission and audit; fragments execution  |
| Executor inside Workbench Manager          | Violates package boundary (ADR-0024)                |
| No actor model                             | Cannot distinguish automation/AI audit requirements |
| Implement Event Bus in Sprint 004          | Out of scope; hook sufficient                       |
| Breaking change to executeAction signature | Violates Baseline v1.0 API stability                |

## Consequences

- AF-006 implements CommandExecutor with user and system actors
- AF-007 implements DefaultWorkbenchCommandBridge
- AF-008 wires optional executor into createWorkbenchAPI
- AF-010 useCommandRegistry().execute() uses actor `user`
- AF-018 exports gateway stubs
- All E2E command flows verify executor path when wired
- Milestone 8 RBAC uses existing adapter — no executor change
- Event Bus milestone replaces AuditHook only
