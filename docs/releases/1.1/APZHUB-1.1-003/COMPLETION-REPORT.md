# APZHUB-1.1-003 — Completion Report

> **Programme:** APZHUB-1.1-003  
> **Title:** Release 1.1 — Cross-Platform Event Bus & Notification Foundation  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** Complete — **Awaiting Acceptance**  
> **Date:** 2026-07-20  
> **Standard:** [Platform Delivery Standard](../../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)

---

## Prerequisites closed

| Prerequisite                                   | Status                                                   |
| ---------------------------------------------- | -------------------------------------------------------- |
| APZHUB-1.1-002 (OBS-LAW-02)                    | **ACCEPTED** (Owner Decision authorising this programme) |
| Platform 1.0.0 Production Baseline             | Held                                                     |
| Named Owner Approval for R11-SUP-01 foundation | This programme                                           |

---

## Delivered

### Platform foundation (reusable)

1. **`DomainEventPublisher`** port in `@apzhub/platform-services` — adapter-compatible with ENF EventBus; fail-soft publish helper.
2. **`wireDomainEventNotifications`** in `@apzhub/event-notification-framework` — reusable pattern → NotificationMapper → NotificationService.
3. **Support event manifests** under `events/support/` for catalogue keys:
   - `support.request.created|updated|assigned|closed`
   - `support.article.created`

### Support consumption (first vertical — not a Support-owned notify subsystem)

4. **SupportServiceImpl / SupportArticleServiceImpl** publish after successful mutations.
5. **Gateway bootstrap** injects server domain Event Bus publisher into `createPlatformServices`.
6. **apps/web ENF composition** registers Support events/routes and wires `support.*` to Attention path.
7. **Client bridge** mirrors successful Support API mutations onto the shell Event Bus for in-app notifications.

### Tests

- Unit: Support domain event publish fail-soft + catalogue keys.
- Integration: SupportServiceImpl create/assign/close publish assertions.
- Notification regression: apps/web ENF maps Support publishes to inbox/toast notifications.

### Documentation

- Support Known Limitations updated (Event Bus publish + in-app notifications closed).
- Architecture / ops / release notes / catalogue / implementation-gaps status updated.
- This evidence pack under `docs/releases/1.1/APZHUB-1.1-003/` (incl. OPERATIONAL-READINESS).

---

## Not delivered (explicit STOP)

| Item                                               | Status        |
| -------------------------------------------------- | ------------- |
| Email SoR                                          | Not started   |
| FIN-001                                            | Not started   |
| Release 1.2                                        | Not started   |
| Zammad webhook HTTP ingress                        | Not started   |
| Binary attachments                                 | Not started   |
| Realtime WS/SSE transport                          | Not started   |
| Workbench / Workflow / Support / Identity redesign | Not performed |

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
