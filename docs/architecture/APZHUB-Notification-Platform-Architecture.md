# APZHUB Notification Platform Architecture

**Milestone:** APZNOTIFY-001 — Platform Notification Foundation  
**Status:** Authoritative for foundation packages  
**Audience:** Architects, platform engineers, AI agents

---

## Purpose

Defines the foundation architecture for the **APZHUB Platform Notification** capability: the System of Record for notification metadata, lifecycle, recipients, templates, priorities, channels, acknowledgements, read state, expiry, and audit.

This milestone does **not** send messages. It is not email, SMS, push, Teams, Slack, or any delivery provider.

---

## Layered request path

```text
Products → Notification Platform → (future Delivery Providers) → Email / SMS / Push / Teams / Slack / Webhook / Future
```

| Layer       | Package                                      | Responsibility                                        |
| ----------- | -------------------------------------------- | ----------------------------------------------------- |
| Contracts   | `@apzhub/notification-contracts` **0.1.0**   | Domain types, permission catalogue, service ports     |
| Core        | `@apzhub/notification-core` **0.1.0**        | Lifecycle transitions, validation, foundation factory |
| Persistence | `@apzhub/notification-persistence` **0.1.0** | In-memory + PostgreSQL metadata repositories          |

Contracts must not import core or persistence. Core must not import persistence.

---

## Explicitly out of scope (APZNOTIFY-001)

- Email / SMS / Push / Webhook / Teams / Slack delivery
- Scheduling, workers, queues, realtime
- Event Bus publishing
- HTTP / Gateway / Workbench / Platform Services
- AI

---

## Persistence

Canonical tables (migrations **0046** / **0047** RLS):

- `platform_notification`
- `platform_notification_recipient`
- `platform_notification_template`
- `platform_notification_category`
- `platform_notification_channel`
- `platform_notification_preference`
- `platform_notification_rule`
- `platform_notification_reference`
- `platform_notification_attachment_metadata`
- `platform_notification_delivery_attempt` (metadata only)
- `platform_notification_audit`

Production requires PostgreSQL. Tests may use in-memory only when explicitly allowed — **no silent fallback**.

---

## See also

- [Domain Model](./APZHUB-Notification-Domain-Model.md)
- [Lifecycle Guide](../guides/APZHUB-Notification-Lifecycle-Guide.md)
- [Permission Catalogue](../guides/APZHUB-Notification-Permission-Catalogue.md)
- [Developer Guide](../guides/APZHUB-Notification-Developer-Guide.md)
- [APZNOTIFY-001 Completion Report](../sprint/APZNOTIFY-001-completion-report.md)
