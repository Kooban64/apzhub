# APZHUB-1.1-003 — Cross-Platform Event Bus & Notification Foundation

> **Programme:** APZHUB-1.1-003  
> **Title:** Release 1.1 — Cross-Platform Event Bus & Notification Foundation  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** Accepted — next programme **APZHUB-1.1-004**  
> **Production baseline:** APZHUB Platform **1.0.0** (unchanged)  
> **Standard:** [Platform Delivery Standard](../../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Date:** 2026-07-20  
> **Bootstrap:** AI-MANIFEST · repository evidence only

---

## Objective

Deliver a **platform-owned**, reusable Event Bus publish + Notification Attention-path foundation, with Support as the first vertical consumer (R11-SUP-01 / P0-3).

## Scope (done)

| Area              | Change                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Event manifests   | `events/support/**/event.yaml` (catalogue §4.2 keys)                                           |
| Platform Services | `DomainEventPublisher` port + SupportServiceImpl / SupportArticleServiceImpl fail-soft publish |
| Gateway           | Server domain Event Bus wired into `createPlatformServices`                                    |
| ENF               | Reusable `wireDomainEventNotifications` helper                                                 |
| apps/web          | Support event + notification route registration + wire; client Attention bridge                |
| Support KLs       | Event Bus publish + in-app notifications closed (realtime/WS still out)                        |
| Ops               | [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md)                                         |

## Out of scope (STOP)

Email SoR · FIN-001 · Release 1.2 · Workbench / Workflow / Support / Identity redesign · Zammad webhook ingress · binary attachments · APZNOTIFY delivery unfreeze · Support 2.0

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
