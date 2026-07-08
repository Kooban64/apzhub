# SPR-006 — Platform Event Envelope

> **Story:** EN-001  
> **Status:** Specification — **no implementation**  
> **Authority:** [Document 029 §8](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md)

---

## Purpose

Define the **PlatformEventEnvelope** contract — the standard wrapper for every published event on the APZHUB Event Bus.

---

## Envelope schema

```typescript
type EventCategory =
  | "system"
  | "user"
  | "capability"
  | "integration"
  | "security"
  | "infrastructure"
  | "business"
  | "notification"
  | "ai";

interface PlatformEventEnvelope {
  readonly envelopeId: string; // UUID — unique per publish
  readonly eventId: string; // must exist in EventRegistry
  readonly eventVersion: string; // matches registration version
  readonly category: EventCategory;
  readonly correlationId: string; // trace chain (Document 010)
  readonly causationId?: string; // parent envelope id
  readonly timestamp: string; // ISO-8601 UTC
  readonly publisher: string; // capability or service id
  readonly actorId?: string; // user or system actor
  readonly sourceService?: string; // platform service id if applicable
  readonly tenantId?: string; // future multi-tenant
  readonly payload: Readonly<Record<string, unknown>>;
}
```

---

## Field rules

| Field           | Required | Validation                                            |
| --------------- | -------- | ----------------------------------------------------- |
| `envelopeId`    | ✅       | UUID v4                                               |
| `eventId`       | ✅       | Registered in EventRegistry                           |
| `eventVersion`  | ✅       | Semver string                                         |
| `category`      | ✅       | Must match registration category                      |
| `correlationId` | ✅       | Non-empty string; propagate from HTTP/request context |
| `causationId`   | Optional | Valid envelopeId of causing event                     |
| `timestamp`     | ✅       | ISO-8601                                              |
| `publisher`     | ✅       | Must match registration publisher or declared alias   |
| `actorId`       | Optional | Present for user-initiated events                     |
| `payload`       | ✅       | Validated against registered payloadSchema            |

---

## Example — capability.action.executed

```json
{
  "envelopeId": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "capability.action.executed",
  "eventVersion": "1.0.0",
  "category": "capability",
  "correlationId": "req-abc-123",
  "causationId": null,
  "timestamp": "2026-07-03T18:00:00.000Z",
  "publisher": "command-framework",
  "actorId": "user-42",
  "sourceService": null,
  "payload": {
    "actionId": "platform.theme.toggle",
    "actor": "user",
    "resultCode": "OK",
    "durationMs": 12
  }
}
```

---

## Publish validation sequence

```text
1. eventId registered?
2. eventVersion compatible?
3. category matches registration?
4. publisher authorized?
5. payload passes payloadSchema?
6. dispatch to subscribers
```

Failure returns structured `EventBusPublishResult` — no partial dispatch.

---

## Immutability

Envelopes are **immutable** after creation. Subscribers must not mutate envelope or payload. Copy-on-write if transformation needed.

---

## Diagnostics

Dev diagnostics may retain last N envelopes with payload redaction for sensitive fields — never in production logs by default.

---

_SPR-006 Platform Event Envelope — EN-001._
