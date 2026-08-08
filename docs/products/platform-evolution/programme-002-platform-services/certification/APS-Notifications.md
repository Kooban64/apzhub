# Certification — APS-Notifications

| Field    | Value                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------ |
| ID       | APS-S-02                                                                                         |
| Owner    | Platform (APE-Notify)                                                                            |
| Packages | `@apzhub/event-notification-framework` · `notification-*`                                        |
| HTTP     | `/api/v1/notifications/**`                                                                       |
| Status   | **CERTIFIED** · anomaly bounded ([APS-E-03](../engineering/APS-E-03-OWNERSHIP-NOTIFICATIONS.md)) |

**Owned?** Yes canonical. **Bounded?** Inbox is surface not separate service. **Consumed?** Multi-product + shell. **PR?** Mature. `qep-notification` = product-local anomaly, not second APS.
