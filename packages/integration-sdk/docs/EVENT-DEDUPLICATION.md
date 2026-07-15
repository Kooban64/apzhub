# Event Identity & Deduplication (OSS-100-08)

**Package:** `@apzhub/integration-sdk` v0.8.0  
**Export:** `@apzhub/integration-sdk/events`  
**Related ADR:** [ADR-0053](../../../docs/adr/ADR-0053-event-identity-and-deduplication.md)

---

## Identity precedence

`deriveSourceEventId` applies this order:

| Priority | Source                                                    | `EventIdentitySource`       | Deduplicatable |
| -------- | --------------------------------------------------------- | --------------------------- | -------------- |
| 1        | Trusted provider event ID                                 | `provider_event_id`         | Yes            |
| 2        | `resourceId` + `action` + `providerTimestamp`             | `resource_action_timestamp` | Yes            |
| 3        | Deterministic payload fingerprint (SHA-256, 32 hex chars) | `payload_fingerprint`       | Yes            |
| 4        | SDK UUID (`createSdkEventId`)                             | `sdk_generated`             | **No**         |

```typescript
import {
  deriveSourceEventId,
  deriveDeduplicationKey,
  createSdkEventId,
} from "@apzhub/integration-sdk/events";

const identity = deriveSourceEventId({
  providerEventId: payload.id, // prefer when trusted
  resourceId: "task-1",
  action: "updated",
  providerTimestamp: "2026-07-11T12:00:00.000Z",
  payload,
  providerId: "plane",
  integrationId: "plane",
});

// identity.deduplicatable === false only for sdk_generated
const eventId = createSdkEventId(); // processing attempt id — never use for dedup
```

---

## Deduplication key

`deriveDeduplicationKey` returns a scoped key when identity is stable:

```text
{providerId}:{integrationId}:{sourceEventId}
```

Returns `undefined` when only an SDK UUID is available — callers must **not** invent a key from `eventId`.

---

## Deduplication store

```typescript
interface EventDeduplicationStore {
  has(key: string): Promise<boolean>;
  remember(key: string, ttlMs?: number): Promise<void>;
  forget?(key: string): Promise<void>;
  clear?(): Promise<void>;
}
```

`InMemoryEventDeduplicationStore` / `createInMemoryEventDeduplicationStore`:

- Default TTL: **1 hour**
- Evicts expired entries on `has` / `size`
- **Tests / local only** — production persistence is out of scope for OSS-100-08

Webhook pipeline uses `sourceEventId` as the store key when a store is supplied (optional `skipDeduplication`).

---

## `eventId` vs `sourceEventId`

| Field           | Owner            | Use                                                                      |
| --------------- | ---------------- | ------------------------------------------------------------------------ |
| `eventId`       | SDK (`ievt_…`)   | Unique processing attempt; logging; bridge `IntegrationEventEnvelope.id` |
| `sourceEventId` | Derived / vendor | Stable identity; dedup; replay correlation with vendor                   |

Never treat `eventId` as an idempotency key.

---

## Security & redaction

- Fingerprints hash stable-serialized payload — do not log raw payloads alongside keys
- Dedup stores must not persist secrets
- Use `buildSafeEventLogFields` for structured logs (`correlationId`, `sourceEventId`, outcome — never bodies or signatures)

---

## Errors

| Code                           | When                                |
| ------------------------------ | ----------------------------------- |
| `integration.events.duplicate` | Store already remembers key         |
| Category `deduplication`       | Maps to IntegrationError `conflict` |

---

## Limitations

- No Redis/PostgreSQL production store in SDK
- Pipeline dedup is best-effort when a store is injected
- SDK-generated identities skip dedup by design (at-least-once may produce duplicates until a stable id exists)

---

## Related

- [EVENT-ENVELOPE.md](./EVENT-ENVELOPE.md)
- [WEBHOOK-PIPELINE.md](./WEBHOOK-PIPELINE.md)
- [ADR-0053](../../../docs/adr/ADR-0053-event-identity-and-deduplication.md)
