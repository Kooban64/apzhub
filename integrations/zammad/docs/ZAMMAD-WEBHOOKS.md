# Zammad Webhooks (`adapter.core.webhooks`)

**Milestone:** OSS-102-06 · **R12-SUP-01** (APZHUB-ENG-0003)  
**Package:** `@apzhub/integration-zammad` **v0.7.0**  
**Access:** `adapter.core.webhooks` (`ZammadWebhookService`) · Platform ingress `POST /api/v1/integrations/zammad/webhooks`

---

## Purpose

1. Adapter-only **webhook registration** against Zammad CE (`/api/v1/webhooks`).
2. **HTTP webhook ingress** (R12-SUP-01) — Platform receives Zammad CE push events, verifies HMAC-SHA1 (`X-Hub-Signature`), translates to source events, fans out Support catalogue domain events.

```text
Zammad CE → POST /api/v1/integrations/zammad/webhooks
  → createZammadWebhookVerifier (HMAC-SHA1 / signature_token)
  → translateZammadWebhookToSourceEvent
  → Support webhook ingress fan-out (notify/index path)

adapter.core.webhooks
  → ZammadWebhookService
  → ZammadOperationRunner
  → ZammadRestClient
  → /api/v1/webhooks  (registration only)
```

---

## Ingress (R12-SUP-01)

| Item        | Value                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| Route       | `POST /api/v1/integrations/zammad/webhooks`                              |
| Auth        | `X-Hub-Signature: sha1=<hmac>` with env `ZAMMAD_WEBHOOK_SIGNATURE_TOKEN` |
| Delivery id | Prefer `X-Zammad-Delivery`                                               |
| Attachments | Metadata events translated (R12-SUP-02); binary via articles API         |
| Realtime    | Out of scope (R12-SUP-03)                                                |

---

## Supported registration operations

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
- Ingress signature token never logged

---

## Metrics

- `zammad.webhook.registration` (`create` | `update` | `delete`)

---

## SDK wrapper (OSS-100-08)

`asZammadWebhookManager(service)` wraps this service as SDK `WebhookManager` (`@apzhub/integration-sdk/events`). Public method signatures unchanged.

See [WEBHOOK-POLLING-MIGRATION.md](../../packages/integration-sdk/docs/WEBHOOK-POLLING-MIGRATION.md).

---

## Related

- [ZAMMAD-EVENTS.md](./ZAMMAD-EVENTS.md)
- [APZHUB-ENG-0003](../../docs/engineering/APZHUB-ENG-0003/IMPLEMENTATION-SUMMARY.md)
- [OSS-102-06 Completion Report](../../docs/sprint/OSS-102-06-completion-report.md)
- [OSS-100-08 Completion Report](../../docs/sprint/OSS-100-08-completion-report.md)
