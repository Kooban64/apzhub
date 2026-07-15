# Canonical Source Event Envelope (OSS-100-08)

**Package:** `@apzhub/integration-sdk` v0.8.0  
**Export:** `@apzhub/integration-sdk/events` (also re-exported from the root barrel)  
**Authority:** [Platform Integration SDK Architecture](../../../docs/architecture/APZHUB-Platform-Integration-SDK-Architecture.md)

---

## Overview

OSS-100-08 delivers vendor-neutral **webhook and polling contracts** in the Integration SDK. Adapters implement `WebhookManager` / `PollingSource` (or thin wrappers around existing services). The SDK supplies the canonical envelope, identity/dedup helpers, verification and replay primitives, processing pipelines, cursors, checkpoints, diagnostics, metrics, and mocks.

```text
Vendor webhook payload ──► decode → verify → replay → translate → dedup
                                                                  ↓
                                                         IntegrationSourceEvent
                                                                  ↑
PollingSource.poll() ──► pages → limits → propose checkpoint ─────┘
```

**Not in this package:** HTTP webhook ingress, Platform Event Bus, workers, schedulers, durable production stores, or platform ingestion. Those remain future platform work. Pipelines return structured results only — they never publish events.

---

## Webhook vs polling

| Mechanism                     | Role                                     | SDK contract                                                                         |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| **Webhook**                   | Push — vendor notifies APZHUB of changes | `WebhookManager` (lifecycle) + `WebhookProcessingPipeline` (decode/verify/translate) |
| **Polling**                   | Pull — adapter fetches pages of changes  | `PollingSource` + `PollingExecutionPipeline` (limits, cursors, checkpoints)          |
| **manual / replay / unknown** | Delivery metadata tags on the envelope   | `DeliveryMechanism` enum                                                             |

Both paths converge on **`IntegrationSourceEvent`** — the canonical adapter→platform boundary type.

---

## Canonical boundary: `IntegrationSourceEvent`

| Field                                             | Purpose                                                                                |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `eventId`                                         | SDK-owned processing id (`createSdkEventId`) — unique per attempt, **not** for dedup   |
| `sourceEventId`                                   | Stable vendor/source identity (see [EVENT-DEDUPLICATION.md](./EVENT-DEDUPLICATION.md)) |
| `eventType` / `action` / `resourceType`           | Canonical classification                                                               |
| `providerId` / `integrationId`                    | Adapter identity                                                                       |
| `tenantId` / `organisationId`                     | Optional tenancy                                                                       |
| `providerTimestamp` / `receivedTimestamp`         | Vendor time vs receive time                                                            |
| `envelopeSchemaVersion` / `payloadSchemaVersion`  | Semver — current defaults **`1.0.0`**                                                  |
| `correlationId` / `causationId` / `trace`         | Observability                                                                          |
| `deliveryMechanism`                               | `webhook` \| `polling` \| `manual` \| `replay` \| `unknown`                            |
| `webhookMetadata` / `pollingMetadata`             | Safe delivery metadata (no secrets)                                                    |
| `safeSourceMetadata` / `redactedProviderMetadata` | Diagnostics-safe fields only                                                           |
| `canonicalPayload`                                | Redacted canonical payload — **never secrets**                                         |

Build with `buildIntegrationSourceEvent(...)`. Bridge to/from legacy `IntegrationEventEnvelope` via `toIntegrationEventEnvelope` / `fromIntegrationEventEnvelope`.

Platform global IDs are **optional** — not required on the envelope.

---

## Schema versioning

| Constant                               | Value   |
| -------------------------------------- | ------- |
| `SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION` | `1.0.0` |
| `SOURCE_EVENT_PAYLOAD_SCHEMA_VERSION`  | `1.0.0` |

`compareSchemaVersions` / `assertEnvelopeSchemaCompatible` / `assertPayloadSchemaCompatible`:

| Status               | Meaning                                |
| -------------------- | -------------------------------------- |
| `compatible`         | Same or older minor/patch within major |
| `minor_upgrade`      | Newer minor/patch, same major          |
| `major_incompatible` | Different major                        |
| `invalid`            | Not `MAJOR.MINOR.PATCH`                |

---

## Public surface (summary)

| Area          | Symbols                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------- |
| Envelope      | `IntegrationSourceEvent`, `buildIntegrationSourceEvent`                                   |
| Identity      | `deriveSourceEventId`, `deriveDeduplicationKey`, `fingerprintPayload`, `createSdkEventId` |
| Versioning    | `compareSchemaVersions`, `assertEnvelopeSchemaCompatible`, …                              |
| Dedup         | `EventDeduplicationStore`, `InMemoryEventDeduplicationStore`                              |
| Webhooks      | `WebhookManager`, `asWebhookManager`, pipeline, verifier, replay                          |
| Polling       | `PollingSource`, `createPollingSourceFromSync`, pipeline, cursors, checkpoints            |
| Observability | `EventMetrics`, `EventDiagnosticsCollector`, `buildSafeEventLogFields`                    |
| Capabilities  | `declareWebhookCapability`, `declarePollingCapability`                                    |
| Testing       | `createMockEventTestHarness`, `createMockHmacWebhookVerifier`, …                          |
| Bridge        | `toIntegrationEventEnvelope`, `fromIntegrationEventEnvelope`                              |

---

## Explicit absences (OSS-100-08)

| Concern                                           | Status                                                      |
| ------------------------------------------------- | ----------------------------------------------------------- |
| HTTP webhook ingress / receiver routes            | **Absent** — platform future                                |
| Platform Event Bus publish                        | **Absent** — pipelines return results only                  |
| Workers / schedulers                              | **Absent** — adapters expose APIs; platform schedules later |
| Durable production dedup/replay/checkpoint stores | **Absent** — in-memory for tests only                       |
| Platform ingestion orchestration                  | **Absent** — await future milestone                         |

---

## Quick start

```typescript
import {
  buildIntegrationSourceEvent,
  createSdkEventId,
  deriveSourceEventId,
} from "@apzhub/integration-sdk/events";

const identity = deriveSourceEventId({
  providerEventId: "vendor-evt-1",
  providerId: "example",
  integrationId: "example-engine",
});

const event = buildIntegrationSourceEvent({
  eventId: createSdkEventId(),
  sourceEventId: identity.sourceEventId,
  eventType: "task.updated",
  action: "updated",
  resourceType: "task",
  providerId: "example",
  integrationId: "example-engine",
  correlationId: "corr-001",
  deliveryMechanism: "webhook",
});
```

### Plane / Zammad pattern

```typescript
import {
  asPlaneWebhookManager,
  translatePlaneWebhookToSourceEvent,
} from "@apzhub/integration-plane";
import { createPlanePollingSource } from "@apzhub/integration-plane";
// Zammad: asZammadWebhookManager, translateZammadWebhookToSourceEvent, createZammadPollingSource
```

See [WEBHOOK-POLLING-MIGRATION.md](./WEBHOOK-POLLING-MIGRATION.md).

---

## Package docs

| Document                 | Path                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Deduplication & identity | [EVENT-DEDUPLICATION.md](./EVENT-DEDUPLICATION.md)                                                                |
| Webhook contracts        | [WEBHOOK-CONTRACTS.md](./WEBHOOK-CONTRACTS.md)                                                                    |
| Verification             | [WEBHOOK-VERIFICATION.md](./WEBHOOK-VERIFICATION.md)                                                              |
| Webhook pipeline         | [WEBHOOK-PIPELINE.md](./WEBHOOK-PIPELINE.md)                                                                      |
| Polling contracts        | [POLLING-CONTRACTS.md](./POLLING-CONTRACTS.md)                                                                    |
| Cursors                  | [POLLING-CURSORS.md](./POLLING-CURSORS.md)                                                                        |
| Checkpoints              | [POLLING-CHECKPOINTS.md](./POLLING-CHECKPOINTS.md)                                                                |
| Adapter migration        | [WEBHOOK-POLLING-MIGRATION.md](./WEBHOOK-POLLING-MIGRATION.md)                                                    |
| Architecture index       | [APZHUB-Integration-SDK-Webhook-Polling.md](../../../docs/architecture/APZHUB-Integration-SDK-Webhook-Polling.md) |

---

## Related

- [OSS-100-08 Completion Report](../../../docs/sprint/OSS-100-08-completion-report.md)
- [ADR-0052](../../../docs/adr/ADR-0052-canonical-source-event-envelope.md) · [ADR-0053](../../../docs/adr/ADR-0053-event-identity-and-deduplication.md)
- [ADR-0054](../../../docs/adr/ADR-0054-polling-checkpoint-acknowledgement.md) · [ADR-0055](../../../docs/adr/ADR-0055-webhook-verification-boundary.md)
- [ADR-0056](../../../docs/adr/ADR-0056-adapter-polling-vs-platform-scheduling.md)
- [Mapping Framework](./MAPPING-FRAMEWORK.md) (OSS-100-07)
- [HTTP Transport](./HTTP-TRANSPORT.md) (OSS-100-06)
