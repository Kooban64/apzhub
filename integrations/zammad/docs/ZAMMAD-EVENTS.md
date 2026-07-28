# Zammad Events (`adapter.core.events`)

**Milestone:** OSS-102-06  
**Package:** `@apzhub/integration-zammad` **v0.7.0**  
**Access:** `adapter.core.events` (`ZammadEventService`)

---

## Purpose

Translate Zammad webhook payloads into **canonical Support integration events**.

HTTP reception is owned by Platform ingress (`POST /api/v1/integrations/zammad/webhooks`, R12-SUP-01). The adapter translates verified payloads; Platform Services fan out Support catalogue domain events (notify/index path). Attachment webhook events are translated as metadata (R12-SUP-02); binary transfer uses the articles API.

```text
adapter.core.events.translate(payload)
  → translateZammadWebhookPayload
  → EventTranslationResult / IntegrationEventEnvelope
```

---

## Canonical Support event resources

| Vendor signal | Canonical resource                         |
| ------------- | ------------------------------------------ |
| ticket        | `support_request`                          |
| article       | `article`                                  |
| organization  | `organization`                             |
| group         | `group`                                    |
| user          | `support_user`                             |
| attachment    | `article` + `attachment.metadata_recorded` |
| unknown       | ignored safely                             |

Actions include create/update/close/reopen/assignment/priority/state and attachment metadata.

---

## Unknown events

Unsupported vendor events return `ok: true`, `ignored: true` with a reason.  
Invalid payloads (non-object) count as translation failures in diagnostics.  
Never throws for unknown events.

---

## Metrics

- `zammad.event.throughput` (`translated` | `ignored`)
- `zammad.event.translation_failures`

---

## SDK envelope bridge (OSS-100-08)

`translateZammadWebhookToSourceEvent` keeps `translateZammadWebhookPayload` as source of truth and bridges to `IntegrationSourceEvent` via `fromIntegrationEventEnvelope`. Does not publish to an Event Bus.

See [EVENT-ENVELOPE.md](../../packages/integration-sdk/docs/EVENT-ENVELOPE.md).

---

## Related

- [ZAMMAD-WEBHOOKS.md](./ZAMMAD-WEBHOOKS.md)
- [ZAMMAD-SYNC.md](./ZAMMAD-SYNC.md)
- [OSS-102-06 Completion Report](../../docs/sprint/OSS-102-06-completion-report.md)
- [OSS-100-08 Completion Report](../../docs/sprint/OSS-100-08-completion-report.md)
