# SPR-004 — Invocation Source Specification (AF-018)

> **Story:** AF-018 — Invocation Source Gateways  
> **Authority:** [ADR-0026](../adr/ADR-0026-command-execution-model.md) · [Gateway Architecture](../../packages/command-framework/src/gateways/GATEWAY-ARCHITECTURE.md)

---

## Objective

Introduce gateway interfaces and executor routing for non-user invocation sources — **no production AI, automation, or voice functionality**.

---

## Execution pipeline (unchanged)

```text
Invocation Source
        ↓
Workbench API (where applicable)
        ↓
Action Framework (ActionExecutor)
        ↓
Workbench Bridge
        ↓
Workbench
```

Gateway stubs identify the source, supply context, and return `NOT_IMPLEMENTED` until future milestones wire delegates.

---

## Supported invocation sources (AF-018)

| Source     | Actor      | Status       | Entry point                                          |
| ---------- | ---------- | ------------ | ---------------------------------------------------- |
| User       | `user`     | Implemented  | Workbench surfaces, `useCommandRegistry().execute()` |
| System     | `system`   | Implemented  | `ActionExecutor` + allow list                        |
| AI Agent   | `ai-agent` | Stub gateway | `AiActionGateway`                                    |
| Voice      | `voice`    | Stub gateway | `VoiceActionGateway`                                 |
| Automation | `system`*  | Stub gateway | `AutomationCommandGateway`                           |

\*Automation invokes with `system` actor when delegating through the executor in future milestones.

---

## Planned invocation sources (documentation only)

| Source       | Notes                                    |
| ------------ | ---------------------------------------- |
| Scheduler    | Cron / scheduled jobs — future milestone |
| External API | Signed API ingress — future milestone    |
| Webhook      | Event-driven ingress — future milestone  |

See [INVOCATION-SOURCES.md](../../packages/command-framework/src/invocation/INVOCATION-SOURCES.md).

---

## Package layout

| Path                                         | Role                            |
| -------------------------------------------- | ------------------------------- |
| `packages/command-framework/src/invocation/` | Invocation Source abstraction   |
| `packages/command-framework/src/gateways/`   | Gateway interfaces + stub impls |
| `packages/command-framework/src/executor/`   | Actor → gateway routing         |
| `packages/command-framework/src/di/`         | Gateway registry DI             |

---

## Gateway interfaces (ADR-0026)

```typescript
interface AiActionGateway {
  execute(request: ActionExecutionRequest): GatewayRouteOutcome;
  proposeAndExecute(intent: string, context: ActionContext): GatewayRouteOutcome;
}

interface VoiceActionGateway {
  execute(request: ActionExecutionRequest): GatewayRouteOutcome;
  executeUtterance(utterance: string, context: ActionContext): GatewayRouteOutcome;
}

interface AutomationCommandGateway {
  executeSystemCommand(request: ActionExecutionRequest): GatewayRouteOutcome;
}
```

Stub implementations return `{ ok: false, code: "NOT_IMPLEMENTED" }`.

---

## Executor routing

`DefaultActionExecutor` routes:

- `ai-agent` → `gateways.ai.execute(request)`
- `voice` → `gateways.voice.execute(request)`

Results pass through the standard audit hook and diagnostics with `phase: "gateway"`.

---

## Dependency injection

```typescript
const gateways = createDefaultInvocationGatewayRegistry({ delegate: executor });
const context = createActionFrameworkContext({ gateways, executor });
```

Future gateways **must** delegate to `ActionExecutor` — never call handlers or Workbench engines directly.

---

## Architectural constraints

Gateways:

- Identify the invocation source
- Supply context
- Delegate execution (stubs return NOT_IMPLEMENTED)

Gateways must **not**:

- Execute actions directly
- Bypass permissions
- Bypass auditing
- Introduce alternative execution paths

---

## Out of scope (AF-018)

- AI reasoning, voice recognition, workflow engine, scheduler
- Business capabilities
- Application wiring (`apps/web` → AF-020)

---

## Related

- [Gateway architecture notes](../../packages/command-framework/src/gateways/GATEWAY-ARCHITECTURE.md)
- [Workbench Surface Pattern](../architecture/APZHUB-Workbench-Surface-Pattern.md)
