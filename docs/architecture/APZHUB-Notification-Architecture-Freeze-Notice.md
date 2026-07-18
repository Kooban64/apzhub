# APZHUB Notification — Architecture Freeze Notice

**Milestone:** APZNOTIFY-006  
**Effective:** 2026-07-16  
**Status:** **FROZEN**  
**Classification retained:** **PRODUCTION_READY_WITH_LIMITATIONS**

---

## Declaration

The following are **frozen** after APZNOTIFY-006 wave closeout:

| Surface                                                                        | Status |
| ------------------------------------------------------------------------------ | ------ |
| Notification contracts (`@apzhub/notification-contracts` **0.2.0**)            | Frozen |
| Notification Core (`@apzhub/notification-core` **0.2.0**)                      | Frozen |
| Notification persistence (`@apzhub/notification-persistence` **0.1.0**)        | Frozen |
| Platform Services Notification facets (`platform-services` **0.21.0**)         | Frozen |
| Gateway integration (`gateway.notification.*`)                                 | Frozen |
| RequestPipeline integration                                                    | Frozen |
| Production Authorization (`notification.*` permission catalogue)               | Frozen |
| Notification lifecycle model                                                   | Frozen |
| HTTP API (`/api/v1/notifications/*`, OpenAPI **1.4.0** Platform Notifications) | Frozen |
| Typed client (`createHttpNotificationClient()`)                                | Frozen |
| Notification Workbench (`/workspace/notifications` + manifests)                | Frozen |

## Change policy

Future enhancements must:

1. Preserve backward compatibility, **or**
2. Follow the project ADR process with explicit owner approval

**Do not** add delivery providers, email, SMS, push, Teams, Slack, webhooks, Event Bus, workers, queues, scheduling, realtime, new HTTP routes, new Gateway facets, or new Workbench views without a new approved milestone.

## Next (not authorised)

**APZNOTIFY-007 — Notification Delivery Provider Framework (SMTP, SES, SMS, Push, Teams, Slack, Webhooks)** — roadmap only.  
See [Future Delivery Framework Guide](../developer/APZHUB-Notification-Future-Delivery-Framework-Guide.md).
