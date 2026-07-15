# Plane Synchronisation, Events & Production Readiness

**Milestone:** OSS-101-08  
**Package:** `@apzhub/integration-plane` v0.5.0  
**Scope:** Plane adapter only — no PlatformService, HTTP routes, UI, workers, or platform event bus

---

## Capabilities

| Service | Access | Role |
|---------|--------|------|
| Webhooks | `adapter.core.webhooks` | Create / update / delete / list / validate Plane CE webhooks |
| Events | `adapter.core.events` | Translate Plane webhook payloads → canonical APZHUB events |
| Synchronisation | `adapter.core.synchronisation` | Full / incremental sync APIs, cursors, resume tokens, safe restart |

Capability registration IDs: `webhooks`, `events`, `synchronisation`.

---

## Webhooks

Plane CE paths used (adapter-internal):

- `GET/POST /api/workspaces/{slug}/webhooks/`
- `GET/PATCH/DELETE /api/workspaces/{slug}/webhooks/{id}/`

Canonical `WebhookRegistration` never exposes secret values (`secretPresent` boolean only).

Supported vendor event flags: `project`, `issue`, `cycle`, `module`, `issue_comment`.

**No HTTP ingress** in this milestone — registration APIs only.

---

## Canonical event models

Vendor-neutral DTOs live in `@apzhub/platform-service-contracts`:

- `IntegrationEventEnvelope` / `IntegrationEventType` / `IntegrationEventAction`
- Resources: project, task, comment, cycle, module, label, member, state, webhook
- `EventTranslationResult` — `ignored: true` for unknown/unsupported payloads with structured `reason`

Plane payloads remain internal (`PlaneWebhookPayload`).

---

## Event translation

```typescript
const result = adapter.core.events.translate(ctx, planePayload, { deliveryId });
// or pure helper:
translatePlaneWebhookPayload(planePayload, { correlationId, deliveryId });
```

Supports create / update / archive / delete, plus issue activity fields for state, assignees, labels, cycle, module, and membership/comment events.

Unknown vendor events are ignored (never thrown) with diagnostics + metrics.

---

## Synchronisation

```typescript
await adapter.core.synchronisation.runFullSync(ctx);
await adapter.core.synchronisation.runIncrementalSync(ctx, { since });
adapter.core.synchronisation.getSyncState();
adapter.core.synchronisation.getLastSyncTimestamp();
adapter.core.synchronisation.safeRestart();
```

| Concern | Behaviour |
|---------|-----------|
| Full sync | Lists projects + issues (no `updated_at` filter) |
| Incremental | Uses `updated_at__gte` from `since` / last success / resume token |
| Resume tokens | Base64url JSON cursor payload |
| Safe restart | Clears stuck `running` status |
| Scheduling / workers | **Not implemented** — APIs only |

`SyncStatus` includes last success/fail, records processed, duration, provider latency, errors, cursor.

---

## Diagnostics & metrics

Diagnostics extension `syncEventsCapability` reports webhook/sync registration, supported event types, webhook operations, sync health, provider limits/latency.

Metrics (SDK `MetricsProvider`):

- `plane.sync.duration_ms` / `plane.sync.failures` / `plane.sync.retries` / `plane.sync.throughput`
- `plane.event.translation_failures` / `plane.event.throughput`
- `plane.webhook.registration`
- `plane.provider.latency_ms`

---

## Explicit exclusions

No PlatformService changes, HTTP routes, UI, background scheduler, workers, notifications, WebSockets, SSE, Zammad, or platform event bus.

---

## SDK envelope & polling wrappers (OSS-100-08)

Additive Integration SDK contracts (`@apzhub/integration-sdk/events` v0.8.0) — public webhook/sync/event APIs unchanged:

| Helper | Role |
|--------|------|
| `asPlaneWebhookManager` | Wraps `PlaneWebhookService` as SDK `WebhookManager` |
| `translatePlaneWebhookToSourceEvent` | Bridges `EventTranslationResult` → `IntegrationSourceEvent` |
| `createPlanePollingSource` | Wraps synchronisation as SDK `PollingSource` |

No HTTP ingress, Event Bus publish, workers, or schedulers. See [EVENT-ENVELOPE.md](../../packages/integration-sdk/docs/EVENT-ENVELOPE.md) · [WEBHOOK-POLLING-MIGRATION.md](../../packages/integration-sdk/docs/WEBHOOK-POLLING-MIGRATION.md).

---

## Related

- [PLANE-ADAPTER.md](./PLANE-ADAPTER.md)
- [OSS-101-08 Completion Report](../../docs/sprint/OSS-101-08-completion-report.md)
- [OSS-100-08 Completion Report](../../docs/sprint/OSS-100-08-completion-report.md)
