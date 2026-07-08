# SPR-006 — Event Metadata Specification

> **Story:** EN-003  
> **Package:** `@apzhub/event-notification-framework`  
> **Status:** Implemented  
> **Authority:** [Event Registry spec](./SPR-006-ENF-event-registry.md) · [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md)

---

## Purpose

Define the **Event Metadata model** derived from registered event definitions. Metadata is exposed through immutable retrieval APIs — not through publish/subscribe behaviour.

---

## EventDescriptor (registration input)

Authors register `EventDescriptor` objects. See [Event Registry spec](./SPR-006-ENF-event-registry.md) for validation rules.

---

## EventMetadata (derived)

Each registered event exposes **EventMetadata** via `getMetadata()` and `listMetadata()`.

| Field              | Source                          | Description                              |
| ------------------ | ------------------------------- | ---------------------------------------- |
| `eventId`          | descriptor                      | Stable event identifier                  |
| `category`         | descriptor                      | Event taxonomy category                  |
| `version`          | descriptor                      | Event definition version (semver)        |
| `sourceCapability` | `sourceCapability ?? publisher` | Declaring capability or service          |
| `schemaVersion`    | `schemaVersion ?? version`      | Payload schema version                   |
| `visibility`       | descriptor (default `public`)   | `public` · `internal` · `restricted`     |
| `stability`        | descriptor (default `stable`)   | `stable` · `experimental` · `deprecated` |
| `description`      | descriptor                      | Human-readable summary                   |
| `tags`             | descriptor (default `[]`)       | Classification tags                      |
| `status`           | descriptor (default `active`)   | Registration lifecycle                   |
| `label`            | descriptor                      | Short display name                       |
| `permission`       | descriptor                      | RBAC gate (M8 population)                |
| `subscribers`      | descriptor (default `[]`)       | Declared consumer ids                    |
| `diagnostics`      | derived                         | Per-entry diagnostics (below)            |

All metadata objects are `Object.freeze()` — immutable.

---

## EventEntryDiagnostics

| Field                  | Meaning                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `validationIssueCount` | Always `0` when registered (validation occurs at register time) |
| `subscriberCount`      | Count of declared subscribers                                   |
| `message`              | Optional note (e.g. `planned` status)                           |

---

## EventRegistryMetadata

Aggregate snapshot from `getRegistryMetadata()`:

| Field                     | Meaning                                                  |
| ------------------------- | -------------------------------------------------------- |
| `manifestCapabilityCount` | Capabilities recorded via `recordManifestCapabilities()` |
| `frameworkVersion`        | Version from `recordFrameworkVersion()`                  |
| `eventMetadata`           | Frozen array of all `EventMetadata` entries              |

---

## EventRegistryDiagnostics

Aggregate snapshot from `getDiagnostics()`:

| Field                     | Meaning                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `status`                  | `empty` · `ready` · `scaffold` · `degraded`                      |
| `layerStatus`             | `EVENT_LAYER_STATUS` (`registry` after EN-003)                   |
| `registeredEventCount`    | Count of registered events                                       |
| `eventIds`                | Sorted registered ids                                            |
| `duplicateEventIds`       | Reserved for bootstrap conflict reporting (EN-005)               |
| `validationIssueCount`    | Reserved for bootstrap validation (EN-005)                       |
| `categoryCounts`          | Count per category                                               |
| `manifestCapabilityCount` | Bootstrap context                                                |
| `frameworkVersion`        | Bootstrap context                                                |
| `issues`                  | Structured registration issues (empty after successful register) |
| `message`                 | Human-readable summary                                           |

---

## Category metadata

Categories carry **no runtime behaviour** in the registry. They classify definitions for diagnostics, routing (future mappers), and documentation.

| Category           | Value         |
| ------------------ | ------------- |
| System Events      | `system`      |
| User Events        | `user`        |
| Capability Events  | `capability`  |
| Integration Events | `integration` |

Extended categories (`security`, `infrastructure`, `business`, `notification`, `ai`) remain valid registration values per ADR-0031.

---

## Example metadata

```typescript
{
  eventId: "capability.action.executed",
  category: "capability",
  version: "1.0.0",
  sourceCapability: "command-framework",
  schemaVersion: "1.0.0",
  visibility: "public",
  stability: "stable",
  description: "Emitted after successful action execution",
  tags: ["action", "audit"],
  status: "active",
  subscribers: ["notifications", "audit"],
  diagnostics: {
    validationIssueCount: 0,
    subscriberCount: 2
  }
}
```

---

_SPR-006 Event Metadata Specification — EN-003._
