# SPR-007 — Activity & Timeline Bootstrap

> **Story:** AT-005  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented (AT-005)  
> **Authority:** [Activity manifest schema](./SPR-007-ATF-activity-manifest.md) · [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) · [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)

---

## 1. Purpose

Define **manifest-driven Activity and Timeline Registry bootstrap** — register platform activity type and timeline definitions from built-in catalogues and capability manifests. Definitions only — no mapping, Event Bus subscription, Activity Service population, or persistence.

> **Locked decision:** `bootstrapActivityRegistry()` registers **platform activity types only** (built-in catalogue). Business activity types are declared in capability manifests (`activities.types`) and merged during manifest population — not hard-coded in platform bootstrap.

Mirrors [SPR-006 Notification Manifest Bootstrap](./SPR-006-ENF-notification-manifest-bootstrap.md) and [SPR-006 Event Manifest Bootstrap](./SPR-006-ENF-event-manifest-bootstrap.md).

---

## 2. Combined bootstrap sequence

```text
Runtime.bootstrap()
        ↓
bootstrapActionRegistry()           (existing — M5)
bootstrapKnowledgeRegistry()        (existing — M5)
bootstrapEventRegistry()            (existing — M6)
bootstrapNotificationRegistry()     (existing — M6)
bootstrapActivityRegistry()         (AT-005)
bootstrapTimelineRegistry()         (AT-005)
        ↓
register EventToActivityMapper on Event Bus (AT-007)
        ↓
filter DTOs via permission adapter (AT-006)
        ↓
buildActivityTimelineHydrationDto() (AT-009)
        ↓
Parallel hydration to client providers
```

Activity and Timeline bootstrap run **after** Event Registry bootstrap (mapper references event patterns) and **in parallel with each other** (independent registries).

---

## 3. bootstrapActivityRegistry sequence

```text
1. registerPlatformActivityCatalogue()        — atomic
2. extractActivityDescriptorsFromCapabilities()
3. registerManyAtomic()                       — atomic
4. recordManifestCapabilities()
5. buildActivityRegistryHydrationDiagnostics()
```

`bootstrapActivityRegistry()` orchestrates all phases. Capability registration is skipped when platform registration fails. Manifest registration is atomic — failures leave prior platform registrations intact.

---

## 4. bootstrapTimelineRegistry sequence

```text
1. registerPlatformTimelineCatalogue()        — atomic
2. extractTimelineDefinitionsFromCapabilities()
3. registerManyAtomic()                       — atomic
4. recordManifestCapabilities()
5. buildTimelineRegistryHydrationDiagnostics()
```

`bootstrapTimelineRegistry()` may run concurrently with activity bootstrap after shared Runtime discovery completes. No cross-registry dependency at registration time.

---

## 5. Components (implemented)

| Component                                    | Path                                            | Role                         |
| -------------------------------------------- | ----------------------------------------------- | ---------------------------- |
| `bootstrapActivityRegistry`                  | `src/bootstrap/bootstrap-activity-registry.ts`  | Activity composition root    |
| `registerPlatformActivityCatalogue`          | `src/catalogue/register-platform-activities.ts` | Built-in activity types      |
| `extractActivityDescriptorsFromCapabilities` | `src/extraction/extract-activities.ts`          | Manifest extraction          |
| `populateActivityRegistryFromCapabilities`   | `src/extraction/populate-activity-registry.ts`  | Atomic manifest registration |
| `parseActivityManifestEntry`                 | `src/extraction/activity-manifest-schema.ts`    | Manifest validation          |
| `bootstrapTimelineRegistry`                  | `src/bootstrap/bootstrap-timeline-registry.ts`  | Timeline composition root    |
| `registerPlatformTimelineCatalogue`          | `src/catalogue/register-platform-timelines.ts`  | Built-in timelines           |
| `extractTimelineDefinitionsFromCapabilities` | `src/extraction/extract-timelines.ts`           | Manifest extraction          |
| `mapPlatformCapabilitiesToActivityRecords`   | `src/extraction/map-capability-records.ts`      | Runtime snapshot adapter     |

---

## 6. Manifest extraction

### 6.1 Activity types

Supports:

| Form                              | Example                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| Inline `activities.types[]` block | `manifest.activities.types: [{ id, eventPattern, category, timelineScopes, templateRef, version }]` |

### 6.2 Timelines

Supports:

| Form                                            | Example                                                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| Inline `activities.timelines[]` block (primary) | `manifest.activities.timelines: [{ id, scope, label, grouping, version }]` |
| Legacy `timelines.scopes[]` block (fallback)    | `manifest.timelines.scopes: [{ id, scope, label, grouping, version }]`     |

Extraction is **atomic** for each registry: validation errors or duplicate ids across capabilities produce zero extracted descriptors for that phase.

---

## 7. Duplicate policy

Fail-fast (ADR-0013 spirit):

| Conflict                                                                       | Result                                   |
| ------------------------------------------------------------------------------ | ---------------------------------------- |
| Duplicate `activityTypeId` within extraction batch                             | Extraction fails                         |
| Duplicate `activityTypeId` vs existing registry (including platform catalogue) | `registerManyAtomic` fails               |
| Duplicate `timelineId` within extraction batch                                 | Extraction fails                         |
| Duplicate `timelineId` vs existing registry                                    | `registerManyAtomic` fails               |
| Invalid manifest entry                                                         | Extraction fails with `VALIDATION` issue |

---

## 8. Source metadata

Each registered descriptor carries `source`:

| Value      | Origin                                 |
| ---------- | -------------------------------------- |
| `builtin`  | Platform Activity / Timeline Catalogue |
| `manifest` | Capability manifest extraction         |

Diagnostics and DTO expose origin for health endpoints and dev tooling.

---

## 9. Platform catalogues (built-in)

### 9.1 Activity catalogue (implemented)

| activityTypeId                       | sourceEventPattern                     | category   | timelineScopes                           |
| ------------------------------------ | -------------------------------------- | ---------- | ---------------------------------------- |
| `platform.lifecycle.started`         | `platform.lifecycle.started`           | system     | timeline.personal, timeline.system       |
| `platform.action.executed`           | `capability.action.executed`           | capability | timeline.personal, timeline.organization |
| `platform.knowledge.query.completed` | `capability.knowledge.query.completed` | capability | timeline.personal                        |
| `platform.notification.generated`    | `capability.notification.generated`    | system     | timeline.personal                        |

### 9.2 Timeline catalogue (implemented)

| timelineId              | scope        | label        | status  |
| ----------------------- | ------------ | ------------ | ------- |
| `timeline.personal`     | personal     | Personal     | active  |
| `timeline.team`         | team         | Team         | planned |
| `timeline.organization` | organization | Organization | planned |
| `timeline.system`       | system       | System       | planned |

---

## 10. Bootstrap result shape

```typescript
interface ActivityBootstrapResult {
  readonly ok: boolean;
  readonly registry: ActivityRegistry;
  readonly diagnostics: ActivityRegistryHydrationDiagnostics;
  readonly errors: readonly ActivityRegistrationIssue[];
}

interface TimelineBootstrapResult {
  readonly ok: boolean;
  readonly registry: TimelineRegistry;
  readonly diagnostics: TimelineRegistryHydrationDiagnostics;
  readonly errors: readonly TimelineRegistrationIssue[];
}
```

When `ok: false`, application bootstrap must not wire Activity Mapper or hydrate client registries.

---

## 11. Usage

```typescript
import {
  bootstrapActivityRegistry,
  bootstrapTimelineRegistry,
  mapPlatformCapabilitiesToActivityRecords,
} from "@apzhub/activity-timeline-framework/server";

const capabilityRecords = mapPlatformCapabilitiesToActivityRecords(capabilities);

const activityResult = bootstrapActivityRegistry({ capabilityRecords });
const timelineResult = bootstrapTimelineRegistry({ capabilityRecords });

if (!activityResult.ok || !timelineResult.ok) {
  // fail bootstrap — log structured errors
}
```

Manifest-only phase (platform catalogue must already be registered):

```typescript
import { bootstrapActivityRegistryFromCapabilities } from "@apzhub/activity-timeline-framework/server";

bootstrapActivityRegistryFromCapabilities(capabilityRecords, { registry });
```

---

## 12. Architectural boundaries

| Rule                                            | AT-005 |
| ----------------------------------------------- | ------ |
| Registry owns definitions only                  | ✅     |
| No Event Bus subscribe/publish                  | ✅     |
| No mapper execution                             | ✅     |
| No ActivityService population                   | ✅     |
| No persistence                                  | ✅     |
| No client hydration / UI                        | ✅     |
| Activity layer isolated from notification layer | ✅     |

---

## 13. Related

- [Activity manifest schema](./SPR-007-ATF-activity-manifest.md)
- [Activity Registry DTO filter](./SPR-007-ATF-activity-registry-dto.md)
- [Application bootstrap sequence](./SPR-006-ENF-application-bootstrap-sequence.md) — M6 reference pattern

---

_SPR-007 Activity & Timeline Bootstrap — AT-005 specification._
