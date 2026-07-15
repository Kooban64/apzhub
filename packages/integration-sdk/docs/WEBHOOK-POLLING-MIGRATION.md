# Webhook & Polling Migration Guide (OSS-100-08)

**Package:** `@apzhub/integration-sdk` v0.8.0  
**Audience:** Adapter authors (Plane, Zammad, future engines)

---

## What changed

| Before                                                         | After                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| Adapter-local webhook services only                            | Shared `WebhookManager` + `asWebhookManager`           |
| Adapter-local sync APIs only                                   | Shared `PollingSource` + `createPollingSourceFromSync` |
| `IntegrationEventEnvelope` (contracts) as sole canonical shape | Additive `IntegrationSourceEvent` + bridge helpers     |
| No shared verify/replay/dedup/pipeline                         | SDK pipelines + in-memory test stores                  |
| —                                                              | Export `@apzhub/integration-sdk/events`                |

**Unchanged:**

- Public Plane/Zammad webhook, event, and sync service method signatures
- Adapter package versions (**0.6.0**)
- No HTTP ingress, Event Bus, workers, or schedulers
- Existing `translate*WebhookPayload` → `EventTranslationResult` behaviour

---

## Plane migration pattern

```typescript
import {
  asPlaneWebhookManager,
  translatePlaneWebhookToSourceEvent,
  createPlanePollingSource,
} from "@apzhub/integration-plane";

// WebhookManager wrapper — does not change PlaneWebhookService
const manager = asPlaneWebhookManager(adapter.core.webhooks);

// Envelope bridge — keeps translatePlaneWebhookPayload as SoT
const { translation, sourceEvent } = translatePlaneWebhookToSourceEvent(payload, {
  deliveryId,
  correlationId,
  tenantId,
});

// PollingSource over existing synchronisation service
const source = createPlanePollingSource(adapter.core.synchronisation);
```

---

## Zammad migration pattern

Same structure:

```typescript
asZammadWebhookManager(service);
translateZammadWebhookToSourceEvent(payload, options);
createZammadPollingSource(syncService);
```

---

## Compatibility

| Concern                    | Guidance                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `IntegrationEventEnvelope` | Still produced by translators; bridge via `fromIntegrationEventEnvelope` / `toIntegrationEventEnvelope` |
| Dedup keys                 | Prefer vendor delivery/event ids; do not use `eventId`                                                  |
| Secrets                    | Continue `secretPresent` only; resolve via `SecretProvider` for verification                            |
| Scheduling                 | Call sync/poll APIs from tests or future platform workers — not from SDK                                |

---

## Future platform ingestion

When platform webhook ingress and Event Bus land (separate milestones):

1. Ingress verifies TLS/authz, then hands raw body to adapter decoder/pipeline
2. Accepted `IntegrationSourceEvent`s publish via Platform Event Bus (029)
3. Platform scheduler drives `PollingExecutionPipeline` and durable checkpoint stores

Adapters should already expose `WebhookManager` / `PollingSource` so platform can wire them without redesign.

---

## Parity checklist

- [ ] Depend on `@apzhub/integration-sdk` ≥ **0.8.0**
- [ ] Wrap webhook service with `asWebhookManager` (or adapter helper)
- [ ] Optionally expose `translate*ToSourceEvent` alongside existing translators
- [ ] Optionally expose `create*PollingSource` over sync service
- [ ] Do **not** add HTTP ingress, Event Bus publish, workers, or schedulers in the adapter
- [ ] Keep adapter version **0.6.0** unless owner approves a bump
- [ ] Confirm Plane/Zammad regression suites still pass

---

## Choosing the API

| Need                         | Use                                                           |
| ---------------------------- | ------------------------------------------------------------- |
| Vendor webhook CRUD          | Existing `adapter.core.webhooks` or `WebhookManager`          |
| Verify + normalize a payload | `WebhookProcessingPipeline` + adapter decoder/translator      |
| Sync inventory               | Existing `adapter.core.synchronisation` or `PollingSource`    |
| Bounded multi-page poll      | `PollingExecutionPipeline` + checkpoint ack                   |
| Legacy envelope interop      | `toIntegrationEventEnvelope` / `fromIntegrationEventEnvelope` |

---

## Related

- [EVENT-ENVELOPE.md](./EVENT-ENVELOPE.md)
- [WEBHOOK-CONTRACTS.md](./WEBHOOK-CONTRACTS.md)
- [POLLING-CONTRACTS.md](./POLLING-CONTRACTS.md)
- [OSS-100-08 Completion Report](../../../docs/sprint/OSS-100-08-completion-report.md)
- Plane: [PLANE-SYNC-EVENTS.md](../../../integrations/plane/docs/PLANE-SYNC-EVENTS.md)
- Zammad: [ZAMMAD-WEBHOOKS.md](../../../integrations/zammad/docs/ZAMMAD-WEBHOOKS.md) · [ZAMMAD-EVENTS.md](../../../integrations/zammad/docs/ZAMMAD-EVENTS.md) · [ZAMMAD-SYNC.md](../../../integrations/zammad/docs/ZAMMAD-SYNC.md)
