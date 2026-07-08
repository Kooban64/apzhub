# Platform Activity Type Catalogue

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-005  
> **Status:** Implemented — definitions only

---

## Purpose

The Platform Activity Type Catalogue registers foundational activity type **definitions** at bootstrap. These are metadata descriptors — not ActivityDocuments, not mapped events, and not timeline entries.

Registration is atomic via `registerPlatformActivityCatalogue()`.

---

## Built-in activity types

| activityTypeId                       | sourceEventPattern                     | category     | timelineScopes                               | templateRef                                   |
| ------------------------------------ | -------------------------------------- | ------------ | -------------------------------------------- | --------------------------------------------- |
| `platform.lifecycle.started`         | `platform.lifecycle.started`           | `system`     | `timeline.personal`, `timeline.system`       | `activity.platform.lifecycle.started`         |
| `platform.action.executed`           | `capability.action.executed`           | `capability` | `timeline.personal`, `timeline.organization` | `activity.platform.action.executed`           |
| `platform.knowledge.query.completed` | `capability.knowledge.query.completed` | `capability` | `timeline.personal`                          | `activity.platform.knowledge.query.completed` |
| `platform.notification.generated`    | `capability.notification.generated`    | `system`     | `timeline.personal`                          | `activity.platform.notification.generated`    |

All entries carry:

- `source: "builtin"`
- `sourceCapability: "platform-runtime"`
- `schemaVersion: "1.0.0"` (platform catalogue semver)
- `status: "active"`

---

## Source code

| Artifact               | Path                                            |
| ---------------------- | ----------------------------------------------- |
| Catalogue entries      | `src/catalogue/platform-activity-catalogue.ts`  |
| Registration           | `src/catalogue/register-platform-activities.ts` |
| Platform version stamp | `src/catalogue/platform-version.ts`             |

---

## Usage

```typescript
import {
  bootstrapActivityRegistry,
  registerPlatformActivityCatalogue,
} from "@apzhub/activity-timeline-framework/server";

// Platform catalogue only
const registry = createDefaultActivityRegistry();
registerPlatformActivityCatalogue(registry);

// Full bootstrap (platform + capability manifests)
const result = bootstrapActivityRegistry({ capabilityRecords });
```

Capability manifests declare additional types under `activities.types[]`. See [Activity manifest bootstrap spec](../../../docs/specs/SPR-007-ATF-activity-manifest.md).

---

## Boundaries (AT-005)

| Does                               | Does not                   |
| ---------------------------------- | -------------------------- |
| Register Activity Type definitions | Map events to activities   |
| Stamp `source: "builtin"` metadata | Subscribe to Event Bus     |
| Record platform catalogue version  | Generate ActivityDocuments |
| Validate descriptor shape          | Render UI                  |

---

_Platform Activity Type Catalogue — AT-005._
