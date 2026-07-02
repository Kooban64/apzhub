# Gateway Architecture Notes (AF-018)

> **Package:** `@apzhub/command-framework`  
> **Authority:** [ADR-0026](../../../docs/adr/ADR-0026-command-execution-model.md)

---

## Purpose

Gateways are **invocation adapters** for non-UI execution origins. They translate external input (intent, utterance, automation payload) into `ActionExecutionRequest` shapes and route through `ActionExecutor`.

---

## Design principles

1. **Single pipeline** — all sources end at `ActionExecutor.execute()`
2. **No bypass** — gateways must not call Workbench engines, services, or handlers directly
3. **Permission parity** — delegated executor calls run the same permission gate as user actions
4. **Audit parity** — executor audit hook records all attempts, including gateway-routed failures
5. **Stub first** — Sprint 004 exports interfaces + stubs returning `NOT_IMPLEMENTED`

---

## Registry

`createDefaultInvocationGatewayRegistry()` bundles:

| Gateway    | Interface                  | Stub factory                           |
| ---------- | -------------------------- | -------------------------------------- |
| AI         | `AiActionGateway`          | `createStubAiActionGateway()`          |
| Voice      | `VoiceActionGateway`       | `createStubVoiceActionGateway()`       |
| Automation | `AutomationCommandGateway` | `createStubAutomationCommandGateway()` |

Inject custom implementations via `CreateInvocationGatewayRegistryOptions`.

---

## Executor integration

```typescript
// DefaultActionExecutor (simplified)
if (isGatewayRoutedActor(actor)) {
  const gateway = actor === "ai-agent" ? gateways.ai : gateways.voice;
  const outcome = gateway.execute(request);
  return finish(outcome.ok, outcome.code, {
    phase: "gateway",
    message: outcome.message,
  });
}
```

`AutomationCommandGateway` is invoked externally (not actor-routed in AF-018). Future automation runners call `executeSystemCommand()` which delegates to executor with `system` actor.

---

## Future production gateway

```typescript
createProductionAiActionGateway({
  delegate: executor,
  policy: agentPolicy,
});
```

Production gateways:

1. Resolve intent → action id (AI milestone)
2. Build `ActionExecutionRequest` with `actor: "ai-agent"`
3. Call `delegate.execute(actionId, context)` — **not** `workbenchExecute` directly
4. Map `ActionResult` → gateway response

---

## Diagnostics

Each gateway tracks:

- `invocationCount`
- `lastInvocationAt`
- `lastActionId`
- `status: "stub" | "ready"`

`DefaultActionExecutor.getDiagnostics()` embeds `buildInvocationGatewayDiagnostics(registry)`.

---

## Related

- [Invocation Source specification](../../../docs/specs/SPR-004-AF-invocation-sources.md)
- [INVOCATION-SOURCES.md](../invocation/INVOCATION-SOURCES.md)
