# APZHUB-1.1-004 — Cross-Product Automation Foundation

> **Programme:** APZHUB-1.1-004  
> **Title:** Release 1.1 — Cross-Product Automation Foundation  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** Accepted — next programme **APZHUB-1.1-005**  
> **Production baseline:** APZHUB Platform **1.0.0** (unchanged)  
> **Standard:** [Platform Delivery Standard](../../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Date:** 2026-07-20  
> **Bootstrap:** AI-MANIFEST · repository evidence only  
> **Prerequisite:** APZHUB-1.1-003 **ACCEPTED**

---

## Objective

Deliver a **platform-owned**, reusable Cross-Product Automation Foundation that leverages Event Bus, Notification Foundation, Workflow Platform, Identity, and Platform Services — without product-specific automation engines.

## Scope (done)

| Area                    | Change                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Automation Foundation   | `createAutomationFoundation` — registration, handlers, idempotent journal                                 |
| Event-driven path       | Event Bus → match registrations → `platform.handler`                                                      |
| Workflow-triggered path | `workflow.trigger` registrations + optional WorkflowEventTriggerSource → **deferred** while execute gated |
| Platform registration   | `services/platform-automation/service.yaml` · default Support journal registrations                       |
| Wiring                  | Server domain Event Bus + `createPlatformServices({ automation })`                                        |
| Manifests               | `events/platform/automation-executed/event.yaml`                                                          |

## Out of scope (STOP)

Email SoR · FIN-001 · Release 1.2 · Workflow/Event Bus/Workbench/Identity redesign · n8n execute unlock · product-specific automation engines · AU-01 Support→Projects task create (medium-term product automation)

## Pack contents

| Document                                                   | Purpose                              |
| ---------------------------------------------------------- | ------------------------------------ |
| [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)             | What was delivered                   |
| [ACCEPTANCE-REPORT.md](./ACCEPTANCE-REPORT.md)             | Owner Acceptance request             |
| [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)               | Gates executed                       |
| [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md) | Public API / SemVer posture          |
| [ARCHITECTURE-NOTES.md](./ARCHITECTURE-NOTES.md)           | Foundation path notes                |
| [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md)     | Operator posture / verify / rollback |

## Recommendation

# READY FOR OWNER ACCEPTANCE
