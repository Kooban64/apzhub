# APZHUB-1.1-004 — Completion Report

> **Programme:** APZHUB-1.1-004  
> **Title:** Release 1.1 — Cross-Product Automation Foundation  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** Complete — **Awaiting Acceptance**  
> **Date:** 2026-07-20  
> **Standard:** [Platform Delivery Standard](../../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)

---

## Prerequisites closed

| Prerequisite                                          | Status                                                   |
| ----------------------------------------------------- | -------------------------------------------------------- |
| APZHUB-1.1-003 (Event Bus & Notification Foundation)  | **ACCEPTED** (Owner Decision authorising this programme) |
| Platform 1.0.0 Production Baseline                    | Held                                                     |
| Named Owner Approval for R11-XPR-01 / P0-4 foundation | This programme                                           |

---

## Delivered

### Platform foundation (reusable)

1. **`AutomationFoundation`** in `@apzhub/platform-services` — register / list / enable / handlers / journal.
2. **Event-driven automation** — `wireEventAutomation` + `handleDomainEvent` with pattern match (`exact` / `.*` prefix).
3. **Workflow-triggered automation** — `workflow.trigger` action kind + `registerWorkflowTriggerAsAutomation` + optional `WorkflowEventTriggerSource`; executions **deferred** with `WORKFLOW_EXECUTE_GATED` (honest: n8n execute not certified).
4. **Built-in `automation.journal` handler** — proves event path without product engines.
5. **Default Support registrations** — `support.request.*` / `support.article.created` → journal.
6. **`service.yaml`** — `services/platform-automation/service.yaml`.
7. **Event manifest** — `events/platform/automation-executed/event.yaml`.
8. **Gateway wire** — server domain Event Bus + shared foundation in `createPlatformServices`.

### Tests

- Unit: registration, idempotency, workflow deferral, bus wire, missing handler.
- Integration: server Event Bus publish → Support automation journal; workflow.trigger deferred.
- Event regression: Support domain event publish tests still pass.

### Documentation

- Programme evidence pack under `docs/releases/1.1/APZHUB-1.1-004/`.
- Roadmap / KL / catalogue / AI-MANIFEST updated.

---

## Not delivered (explicit STOP)

| Item                                                 | Status                                       |
| ---------------------------------------------------- | -------------------------------------------- |
| Email SoR                                            | Not started                                  |
| FIN-001                                              | Not started                                  |
| Release 1.2                                          | Not started                                  |
| n8n / Workflow provider execute unlock               | Not started                                  |
| AU-01 Support→Projects task automation               | Not started (medium-term product automation) |
| Product-specific automation engines                  | Not introduced                               |
| Workbench / Workflow / Event Bus / Identity redesign | Not performed                                |

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
