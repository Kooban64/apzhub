# APZHUB-1.1-004 — Architecture Notes

> **Programme:** APZHUB-1.1-004  
> **Date:** 2026-07-20  
> **Related:** [AUTOMATION-ROADMAP](../../../products/AUTOMATION-ROADMAP.md) · [PORTFOLIO-INTEGRATION-STRATEGY](../../../products/PORTFOLIO-INTEGRATION-STRATEGY.md) · Document 012 / 029 · APZHUB-1.1-003

---

## Foundation path

```text
Platform Service mutation (success)
  → DomainEventPublisher.publish(domain.*)   [fail-soft · 1.1-003]
  → Server InProcessEventBus

Automation Foundation (1.1-004)
  → wireEventAutomation(bus, foundation)
  → match AutomationRegistration (eventPattern)
  → platform.handler  → AutomationHandler (e.g. automation.journal)
  → workflow.trigger  → deferred WORKFLOW_EXECUTE_GATED
  → optional WorkflowEventTriggerSource bindings (same deferral)
  → idempotent AutomationExecutionJournal
```

## Design rules preserved

1. **Platform-owned** — no product Zapier / module workflow engines.
2. **Event-mediated** — Style A from PORTFOLIO-INTEGRATION-STRATEGY.
3. **Workflow not redesigned** — trigger metadata / deferred intent only; n8n execute freeze respected.
4. **Identity** — correlation / tenant / actor from event envelope; handlers must re-authorize for mutations.
5. **Reuse** — Event Bus + Notification Foundation + Platform Services; no second bus.

## Honesty

| Claim                                      | Reality                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| Event-driven automation                    | **Yes** — journal / handlers                              |
| Workflow-triggered automation              | **Registration + deferred intent** — not provider execute |
| Cross-product product automations (AU-01…) | **Not** delivered — foundation only                       |
