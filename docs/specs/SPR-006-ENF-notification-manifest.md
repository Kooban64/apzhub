# SPR-006 — Notification Manifest Schema

> **Story:** EN-001 · EN-008 (implementation)  
> **Status:** Specification — **implemented in EN-008**  
> **Authority:** [Document 021](../021-notification-activity-attention-management-framework.md) · [ADR-0032](../adr/ADR-0032-notification-routing-model.md)

---

## Purpose

Define manifest schema for **NotificationRoute** registration.

---

## Inline capability manifest block

```yaml
notifications:
  routes:
    - id: platform.action.executed.inbox
      eventPattern: capability.action.executed
      notificationKind: inbox
      channel: in-app
      priority: normal
      templateRef: action-executed
      permission: platform.notifications.read
      titleTemplate: "Action completed"
      bodyTemplate: "{{actionId}} executed successfully"
```

### Field reference

| Field              | Required | Description                                                                    |
| ------------------ | -------- | ------------------------------------------------------------------------------ |
| `id`               | ✅       | Stable `routeId`                                                               |
| `eventPattern`     | ✅       | Exact eventId or prefix pattern                                                |
| `notificationKind` | ✅       | `toast` · `banner` · `inbox` · `in-app` · `email` · `sms` · `push` · `webhook` |
| `channel`          | ✅       | `in-app` · `email` · `sms` · `push` · `webhook`                                |
| `priority`         | Optional | `low` · `normal` · `high` · `urgent` (default `normal`)                        |
| `templateRef`      | ✅       | Presentation template key                                                      |
| `permission`       | Optional | Recipient visibility gate                                                      |
| `titleTemplate`    | Optional | String template with payload placeholders                                      |
| `bodyTemplate`     | Optional | String template                                                                |
| `status`           | Optional | `active` · `planned` · `disabled`                                              |

---

## Channel/kind validation

| notificationKind                     | Allowed channels (SPR-006) |
| ------------------------------------ | -------------------------- |
| `toast`, `banner`, `inbox`, `in-app` | `in-app`                   |
| `email`                              | `email`                    |
| `sms`                                | `sms`                      |
| `push`                               | `push`                     |
| `webhook`                            | `webhook`                  |

Invalid kind/channel pairs → bootstrap error.

---

## Platform catalogue (built-in routes)

| routeId                          | eventPattern                        | kind   | channel | SPR-006   |
| -------------------------------- | ----------------------------------- | ------ | ------- | --------- |
| `platform.action.executed.inbox` | `capability.action.executed`        | inbox  | in-app  | ✅        |
| `platform.action.executed.toast` | `capability.action.executed`        | toast  | in-app  | Scaffold  |
| `integration.sync.failed.banner` | `integration.connector.sync.failed` | banner | in-app  | Scaffold  |
| `platform.digest.email`          | `system.digest.scheduled`           | email  | email   | `planned` |

---

## Template placeholders

| Placeholder     | Source             |
| --------------- | ------------------ |
| `{{actionId}}`  | event payload      |
| `{{actorId}}`   | envelope actorId   |
| `{{eventId}}`   | envelope eventId   |
| `{{timestamp}}` | envelope timestamp |

Full template engine deferred — simple string replace in EN-009.

---

_SPR-006 Notification Manifest Schema — EN-001._
