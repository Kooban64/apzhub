# SPR-006 — Notification Manifest Bootstrap

> **Story:** EN-008  
> **Status:** Implemented  
> **Authority:** [Notification manifest schema](./SPR-006-ENF-notification-manifest.md) · [ADR-0032](../adr/ADR-0032-notification-routing-model.md)

---

## Purpose

Define **manifest-driven Notification Registry bootstrap** — register platform notification route definitions from the built-in catalogue and capability manifests. Definitions only — no delivery, Event Bus subscription, mapper execution, or persistence.

---

## Bootstrap sequence

```text
1. registerPlatformNotificationCatalogue()   — atomic
2. extractNotificationDescriptorsFromCapabilities()
3. registerManyAtomic()                      — atomic
4. recordManifestCapabilities()
5. buildNotificationRegistryHydrationDiagnostics()
```

`bootstrapNotificationRegistry()` orchestrates both phases. Capability registration is skipped when platform registration fails. Manifest registration is atomic — failures leave prior platform registrations intact.

---

## Components

| Component                                        | Path                                               | Role                                          |
| ------------------------------------------------ | -------------------------------------------------- | --------------------------------------------- |
| `bootstrapNotificationRegistry`                  | `src/catalogue/bootstrap-notification-registry.ts` | Composition root                              |
| `registerPlatformNotificationCatalogue`          | `src/catalogue/register-platform-notifications.ts` | Built-in catalogue                            |
| `extractNotificationDescriptorsFromCapabilities` | `src/extraction/extract-notifications.ts`          | Manifest extraction                           |
| `populateNotificationRegistryFromCapabilities`   | `src/extraction/populate-notification-registry.ts` | Atomic manifest registration                  |
| `parseNotificationManifestEntry`                 | `src/extraction/notification-manifest-schema.ts`   | Manifest validation                           |
| `mapPlatformCapabilitiesToEventRecords`          | `src/server/map-capability-records.ts`             | Runtime snapshot adapter (shared with events) |

---

## Manifest extraction

Supports:

| Form                                  | Example                                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Inline `notifications.routes[]` block | `manifest.notifications.routes: [{ id, eventPattern, notificationKind, channel, templateRef, version }]` |

Extraction is **atomic**: validation errors or duplicate route ids across capabilities produce zero extracted descriptors.

---

## Manifest validation

Each route entry validates:

| Field                            | Rule                                                                    |
| -------------------------------- | ----------------------------------------------------------------------- |
| `id`                             | Required — maps to `routeId`                                            |
| `eventPattern`                   | Required — event mapping reference (metadata only)                      |
| `notificationKind`               | Required — EN-001 taxonomy                                              |
| `channel`                        | Required — must match kind/channel policy                               |
| `templateRef`                    | Required                                                                |
| `version`                        | Required semver                                                         |
| `titleTemplate` / `bodyTemplate` | Optional — stored in manifest only; mapper execution deferred to EN-009 |

### Kind/channel policy

| notificationKind                     | Required channel |
| ------------------------------------ | ---------------- |
| `toast`, `banner`, `inbox`, `in-app` | `in-app`         |
| `email`                              | `email`          |
| `sms`                                | `sms`            |
| `push`                               | `push`           |
| `webhook`                            | `webhook`        |

Invalid pairs → bootstrap `VALIDATION` error.

---

## Duplicate policy

Fail-fast (ADR-0013 spirit):

| Conflict                                                               | Result                                   |
| ---------------------------------------------------------------------- | ---------------------------------------- |
| Duplicate route id within extraction batch                             | Extraction fails                         |
| Duplicate route id vs existing registry (including platform catalogue) | `registerManyAtomic` fails               |
| Invalid manifest entry                                                 | Extraction fails with `VALIDATION` issue |

---

## Notification source metadata

Each registered descriptor carries `source`:

| Value      | Origin                          |
| ---------- | ------------------------------- |
| `builtin`  | Platform Notification Catalogue |
| `manifest` | Capability manifest extraction  |

`NotificationMetadata.source` exposes the origin for diagnostics and future DTO filtering.

---

## Architectural boundaries

| Rule                                       | EN-008 |
| ------------------------------------------ | ------ |
| Registry owns definitions only             | ✅     |
| No notification delivery                   | ✅     |
| No Event Bus subscribe/publish             | ✅     |
| No mapper execution                        | ✅     |
| No persistence                             | ✅     |
| No client hydration / UI                   | ✅     |
| Notification layer isolated from event bus | ✅     |

---

## Usage

```typescript
import {
  bootstrapNotificationRegistry,
  mapPlatformCapabilitiesToEventRecords,
} from "@apzhub/event-notification-framework";

const { ok, registry, diagnostics, errors } = bootstrapNotificationRegistry({
  capabilityRecords: mapPlatformCapabilitiesToEventRecords(capabilities),
});

if (!ok) {
  console.error(errors);
}
```

Manifest-only phase (platform catalogue must already be registered):

```typescript
import { bootstrapNotificationRegistryFromCapabilities } from "@apzhub/event-notification-framework";

bootstrapNotificationRegistryFromCapabilities(capabilityRecords, { registry });
```

---

_SPR-006 Notification Manifest Bootstrap — EN-008._
