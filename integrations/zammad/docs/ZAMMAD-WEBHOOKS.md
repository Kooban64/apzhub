# Zammad Webhooks (`adapter.core.webhooks`)

**Milestone:** OSS-102-06  
**Package:** `@apzhub/integration-zammad` **v0.6.0**  
**Access:** `adapter.core.webhooks` (`ZammadWebhookService`)

---

## Purpose

Adapter-only **webhook registration** against Zammad CE (`/api/v1/webhooks`).

No HTTP webhook receiver / ingress in APZHUB for this milestone.

```text
adapter.core.webhooks
  → ZammadWebhookService
  → ZammadOperationRunner
  → ZammadRestClient
  → /api/v1/webhooks
```

---

## Supported operations

| Method                         | Notes                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| `list` / `get`                 | Canonical `WebhookRegistration`                                                     |
| `create` / `update` / `delete` | Registration CRUD                                                                   |
| `validateConfiguration`        | URL + supported event types                                                         |
| `supportedEventTypes`          | ticket, article, organization, group, user, assignment, priority, state, attachment |

---

## Security

- Secrets never returned — only `secretPresent: boolean`
- Diagnostics must remain secret-free

---

## Metrics

- `zammad.webhook.registration` (`create` | `update` | `delete`)

---

## SDK wrapper (OSS-100-08)

`asZammadWebhookManager(service)` wraps this service as SDK `WebhookManager` (`@apzhub/integration-sdk/events`). Public method signatures unchanged. No HTTP ingress.

See [WEBHOOK-POLLING-MIGRATION.md](../../packages/integration-sdk/docs/WEBHOOK-POLLING-MIGRATION.md).

---

## Related

- [ZAMMAD-EVENTS.md](./ZAMMAD-EVENTS.md)
- [OSS-102-06 Completion Report](../../docs/sprint/OSS-102-06-completion-report.md)
- [OSS-100-08 Completion Report](../../docs/sprint/OSS-100-08-completion-report.md)
