# Timeline Bootstrap

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-005  
> **Status:** Implemented — definitions only

---

## Purpose

Timeline bootstrap registers Timeline **Definitions** from:

1. Platform Timeline Definition Catalogue (four reserved scopes)
2. Capability manifest declarations (`activities.timelines[]`, with legacy `timelines.scopes[]` fallback)

No timeline generation, activity storage, Event Bus, or UI.

---

## Bootstrap sequence

```text
registerPlatformTimelineCatalogue()           — atomic
        ↓
extractTimelineDefinitionsFromCapabilities()  — atomic extraction
        ↓
registerManyAtomic()                          — atomic registration
        ↓
recordManifestCapabilities()
        ↓
buildTimelineRegistryHydrationDiagnostics()
```

`bootstrapTimelineRegistry()` orchestrates all phases. Manifest registration is skipped when platform registration fails.

---

## Manifest extraction

### Primary block — `activities.timelines[]`

```yaml
activities:
  timelines:
    - id: team.support
      scope: team
      label: Support queue activity
      version: 1.0.0
      grouping: by-actor
      activityCategoryFilter:
        - integration
        - capability
```

### Legacy fallback — `timelines.scopes[]`

When `activities.timelines` is absent, extraction reads `timelines.scopes[]` for backward compatibility with the manifest specification.

Scope tokens (`personal`, `team`, `workspace`, `organization`, `system`) normalize to reserved scope ids (`timeline.personal`, etc.). `workspace` maps to `timeline.organization`.

Manifest-only fields (`grouping`, `sortOrder`, `activityTypeFilter`, `permissionKeys`, `experienceRef`) are stored in definition `metadata`.

---

## Platform catalogue

Four built-in definitions registered by `registerPlatformTimelineCatalogue()`:

| timelineId              | scope        | label        | status  |
| ----------------------- | ------------ | ------------ | ------- |
| `timeline.personal`     | personal     | Personal     | active  |
| `timeline.team`         | team         | Team         | planned |
| `timeline.organization` | organization | Organization | planned |
| `timeline.system`       | system       | System       | planned |

See `src/timeline/platform-timeline-catalogue.ts`.

---

## Usage

```typescript
import {
  bootstrapTimelineRegistry,
  mapPlatformCapabilitiesToActivityRecords,
} from "@apzhub/activity-timeline-framework/server";

const capabilityRecords = mapPlatformCapabilitiesToActivityRecords(capabilities);
const result = bootstrapTimelineRegistry({ capabilityRecords });

if (!result.ok) {
  // structured errors in result.errors
}
```

Manifest-only population (platform catalogue must already be registered):

```typescript
bootstrapTimelineRegistryFromCapabilities(capabilityRecords, { registry });
```

---

## Source metadata

| `source`   | Origin                         |
| ---------- | ------------------------------ |
| `builtin`  | Platform Timeline Catalogue    |
| `manifest` | Capability manifest extraction |

Hydration diagnostics partition ids by source via `buildTimelineRegistryHydrationDiagnostics()`.

---

## Boundaries (AT-005)

| Does                           | Does not                  |
| ------------------------------ | ------------------------- |
| Register Timeline Definitions  | Generate timeline entries |
| Validate manifest shape        | Map events                |
| Record manifest capability ids | Persist history           |
| Atomic batch registration      | Render UI                 |

---

_Timeline Bootstrap — AT-005._
