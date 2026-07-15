# ADR-0052: Canonical Source Event Envelope

## Status

Accepted — OSS-100-08

## Context

Adapters produced vendor-specific webhook payloads and a contracts-level `IntegrationEventEnvelope`, but the Integration SDK lacked a shared, vendor-neutral source-event type for webhook and polling paths. Platform Event Bus and ingress are not yet authorised; adapters still need a stable boundary type for identity, versioning, and safe metadata.

## Decision

1. Introduce **`IntegrationSourceEvent`** in `@apzhub/integration-sdk/events` as the canonical adapter→platform source-event envelope.
2. Require delivery mechanism tagging (`webhook` | `polling` | `manual` | `replay` | `unknown`).
3. Separate **`eventId`** (SDK processing attempt) from **`sourceEventId`** (stable source identity).
4. Version envelope and payload schemas with semver defaults **`1.0.0`**; major mismatch is incompatible.
5. Forbid secrets in the envelope; allow only safe/redacted metadata and canonical payloads.
6. Provide bridge helpers to/from `IntegrationEventEnvelope` without hard runtime dependency on contracts.
7. Pipelines return structured results only — **no** Event Bus publish in OSS-100-08.

## Consequences

- Plane/Zammad can emit `IntegrationSourceEvent` via thin bridges while keeping existing translators.
- Future platform ingestion consumes one envelope shape across mechanisms.
- Durable bus, ingress, and workers remain out of scope until separately approved.

## Related

- [EVENT-ENVELOPE.md](../../packages/integration-sdk/docs/EVENT-ENVELOPE.md)
- [ADR-0053](./ADR-0053-event-identity-and-deduplication.md)
- [029 — Platform Event SDK](../029-platform-event-sdk-event-bus-event-manifest-specification.md)
- [OSS-100-08 Completion Report](../sprint/OSS-100-08-completion-report.md)
