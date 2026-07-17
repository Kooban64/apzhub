# APZHUB Notification Permission Catalogue

**Milestone:** APZNOTIFY-001  
**Package:** `@apzhub/notification-contracts`

---

| Permission | Use |
| --- | --- |
| `notification.*` | Wildcard — all notification operations |
| `notification.read` | Read notifications and related metadata |
| `notification.manage` | Create / update / lifecycle manage |
| `notification.template` | Template administration |
| `notification.preference` | Preference administration |
| `notification.audit` | Audit trail access |
| `notification.delivery` | Future delivery-provider administration (catalogue only here) |

Helper: `hasNotificationPermission(permissions, op)`.

No UI in APZNOTIFY-001. Gateway / Authorization wiring is deferred to **APZNOTIFY-002**.
