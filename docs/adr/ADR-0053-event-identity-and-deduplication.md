# ADR-0053: Event Identity and Deduplication

## Status

Accepted — OSS-100-08

## Context

Webhook deliveries and polling runs can overlap. Without shared identity rules, adapters invent inconsistent idempotency keys. SDK-generated UUIDs must not silently become dedup keys.

## Decision

1. Derive `sourceEventId` with fixed precedence: **provider event ID** → **resource + action + provider timestamp** → **payload fingerprint** → **SDK UUID**.
2. Only the first three sources are **deduplicatable**; SDK UUIDs are not.
3. Deduplication keys are scoped as `{providerId}:{integrationId}:{sourceEventId}` when stable; otherwise undefined.
4. Provide `EventDeduplicationStore` interface; ship **in-memory** implementation for tests only.
5. Webhook pipeline optionally remembers `sourceEventId` after accept; production persistence is out of scope.

## Consequences

- Callers must supply trusted vendor IDs when available.
- At-least-once delivery may duplicate when only SDK UUIDs exist — intentional.
- Platform may later provide durable dedup stores behind the same interface.

## Related

- [EVENT-DEDUPLICATION.md](../../packages/integration-sdk/docs/EVENT-DEDUPLICATION.md)
- [ADR-0052](./ADR-0052-canonical-source-event-envelope.md)
- [OSS-100-08 Completion Report](../sprint/OSS-100-08-completion-report.md)
