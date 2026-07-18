# APZHUB Notification Domain Model

**Milestone:** APZNOTIFY-001  
**Package:** `@apzhub/notification-contracts`

---

## Entities

| Entity                           | Purpose                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Notification`                   | Canonical notification record (title, status, priority, channels, expiry)                           |
| `NotificationRecipient`          | Per-recipient lifecycle / read / acknowledge / dismiss                                              |
| `NotificationTemplate`           | Reusable template metadata (not rendered provider content)                                          |
| `NotificationChannel`            | Channel catalogue entry (model only)                                                                |
| `NotificationPreference`         | User channel/category preference metadata                                                           |
| `NotificationCategory`           | Classification taxonomy                                                                             |
| `NotificationRule`               | Rule metadata (opaque condition refs — not executable here)                                         |
| `NotificationReference`          | Soft reference to Projects / Support / Testing / Reporting / Documents / Workflow / Search / Future |
| `NotificationAttachmentMetadata` | File metadata + storage refs only (no binaries)                                                     |
| `NotificationDeliveryAttempt`    | Attempt metadata only (no provider payloads)                                                        |
| `NotificationAuditEntry`         | Immutable audit trail                                                                               |

## Enumerations

- **Status:** draft, pending, queued, delivered, read, acknowledged, dismissed, expired, archived
- **Priority:** critical, high, normal, low, informational
- **Channel kind:** email, sms, push, in_app, webhook, microsoft_teams, slack, future
- **Reference kind:** projects, support, testing, reporting, documents, workflow, search, future

No provider payloads. No cross-product business logic in references.
