# SPR-006 — Notification Metadata Specification

> **Story:** EN-007  
> **Package:** `@apzhub/event-notification-framework`  
> **Status:** Implemented  
> **Authority:** [Notification Registry spec](./SPR-006-ENF-notification-registry.md) · [ADR-0032](../adr/ADR-0032-notification-routing-model.md)

---

## Purpose

Define the **Notification Metadata model** derived from registered notification route definitions. Metadata is exposed through immutable retrieval APIs — not through delivery or mapper behaviour.

---

## NotificationDescriptor (registration input)

Authors register `NotificationDescriptor` objects. See [Notification Registry spec](./SPR-006-ENF-notification-registry.md) for validation rules.

---

## NotificationMetadata (derived)

Each registered route exposes **NotificationMetadata** via `getMetadata()` and `listMetadata()`.

| Field              | Source                          | Description                              |
| ------------------ | ------------------------------- | ---------------------------------------- |
| `routeId`          | descriptor                      | Notification route id                    |
| `notificationKind` | descriptor                      | EN-001 kind                              |
| `channel`          | descriptor                      | Delivery channel                         |
| `source`           | descriptor (default `manifest`) | `builtin` · `manifest`                   |
| `version`          | descriptor                      | Route definition semver                  |
| `schemaVersion`    | `schemaVersion ?? version`      | Template/schema version                  |
| `visibility`       | descriptor (default `public`)   | `public` · `internal` · `restricted`     |
| `stability`        | descriptor (default `stable`)   | `stable` · `experimental` · `deprecated` |
| `description`      | descriptor                      | Human-readable summary                   |
| `tags`             | descriptor (default `[]`)       | Classification tags                      |
| `eventPattern`     | descriptor                      | Event mapping reference (metadata only)  |
| `templateRef`      | descriptor                      | Presentation template key                |
| `status`           | descriptor (default `active`)   | Route lifecycle                          |
| `label`            | descriptor                      | Short display name                       |
| `permission`       | descriptor                      | RBAC gate                                |
| `priority`         | descriptor                      | Attention priority                       |
| `sourceCapability` | descriptor                      | Declaring capability                     |
| `diagnostics`      | derived                         | Per-entry diagnostics                    |

All metadata objects are `Object.freeze()` — immutable.

---

## NotificationEntryDiagnostics

| Field                  | Meaning                                       |
| ---------------------- | --------------------------------------------- |
| `validationIssueCount` | Always `0` when registered                    |
| `message`              | Optional note (`planned` / `disabled` status) |

---

## NotificationRegistryMetadata

Aggregate snapshot from `getRegistryMetadata()`:

| Field                     | Meaning                                                  |
| ------------------------- | -------------------------------------------------------- |
| `manifestCapabilityCount` | Capabilities recorded via `recordManifestCapabilities()` |
| `frameworkVersion`        | Version from bootstrap context                           |
| `routeMetadata`           | Frozen array of all `NotificationMetadata` entries       |

---

## NotificationRegistryDiagnostics

Aggregate snapshot from `getDiagnostics()`:

| Field                     | Meaning                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `status`                  | `empty` · `ready` · `scaffold` (placeholder only)                |
| `layerStatus`             | `NOTIFICATION_LAYER_STATUS` (`bootstrap` after EN-008)           |
| `registeredRouteCount`    | Count of registered routes                                       |
| `routeIds`                | Sorted registered ids                                            |
| `duplicateRouteIds`       | Reserved for bootstrap conflict reporting (EN-008)               |
| `validationIssueCount`    | Reserved for bootstrap validation (EN-008)                       |
| `kindCounts`              | Count per notification kind                                      |
| `channelCounts`           | Count per delivery channel                                       |
| `manifestCapabilityCount` | Bootstrap context                                                |
| `frameworkVersion`        | Bootstrap context                                                |
| `issues`                  | Structured registration issues (empty after successful register) |
| `message`                 | Human-readable summary                                           |

---

## Example metadata

```typescript
{
  routeId: "platform.action.executed.inbox",
  notificationKind: "inbox",
  channel: "in-app",
  source: "builtin",
  version: "1.0.0",
  schemaVersion: "1.0.0",
  visibility: "public",
  stability: "stable",
  description: "Inbox notification when an action completes",
  tags: ["action", "inbox"],
  eventPattern: "capability.action.executed",
  templateRef: "action-executed",
  status: "active",
  label: "Action Executed Inbox",
  diagnostics: {
    validationIssueCount: 0
  }
}
```

---

_SPR-006 Notification Metadata Specification — EN-007._
