# APZHUB-1.1-003 — Architecture Notes

> **Programme:** APZHUB-1.1-003  
> **Date:** 2026-07-20  
> **Related:** [PLATFORM-EVENT-CATALOGUE](../../../products/PLATFORM-EVENT-CATALOGUE.md) §4.2 · Document 029 · ENF (SPR-006)

---

## Foundation path

```text
Support Platform Service mutation (success)
  → DomainEventPublisher.publish(support.*)   [fail-soft]
  → Server InProcessEventBus (gateway)

apps/web ENF composition
  → registerSupportEvents / registerSupportNotificationRoutes
  → wireDomainEventNotifications(support.*)
  → NotificationService (Attention path)

Support client API (browser)
  → mirrors catalogue events onto shell EventBus (optional bridge)
  → same Attention path → inbox/toast
```

## Design rules preserved

1. **Platform-owned** — no Support-owned notification subsystem.
2. **Modules/products publish events; ENF delivers Attention** — Document 021/029.
3. **APZNOTIFY Notification SoR freeze** — not used as shell Attention SoR; no delivery unfreeze.
4. **Reuse** — existing ENF + platform-event-bus packages; no second Event Bus product.

## Closed Support limitations (narrow)

| Limitation                                         | Closure                                       |
| -------------------------------------------------- | --------------------------------------------- |
| No Event Bus publish for Support operations        | SupportServiceImpl publishes catalogue events |
| No notifications for Support vertical as certified | ENF Attention routes + wire for `support.*`   |

Still out: webhook ingress · binary attachments · realtime transport · Email SoR.
