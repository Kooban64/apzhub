# SPR-007 — Activity & Timeline Registry DTO

> **Story:** AT-006  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented (AT-006)  
> **Authority:** [SPR-006 Event Registry DTO](./SPR-006-ENF-event-registry-dto.md) · [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) · [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)

---

## 1. Purpose

Define **ActivityRegistryDto** and **TimelineRegistryDto** wire formats for server-to-client hydration. Read-only projections — no mapping, Activity Service population, or client registration.

Also defines **ActivityHydrationDto** bundle shape consumed by client providers (AT-009).

---

## 2. ActivityRegistryDto wire format

```typescript
interface ActivityRegistryDto {
  readonly schemaVersion: 1;
  readonly frameworkVersion?: string;
  readonly types: readonly ActivityTypeDescriptorDto[];
}
```

| Field              | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `schemaVersion`    | DTO format version (`ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION = 1`)     |
| `frameworkVersion` | Platform catalogue stamp from bootstrap                             |
| `types`            | Permission-filtered activity type descriptors (post-filter on wire) |

---

## 3. ActivityTypeDescriptorDto

Client-safe activity type metadata:

| Field                                 | Description                                                       |
| ------------------------------------- | ----------------------------------------------------------------- |
| `activityTypeId`                      | Stable type identifier                                            |
| `sourceEventPattern`                  | Event mapping reference (metadata only)                           |
| `category`                            | Activity taxonomy category                                        |
| `timelineScopes`                      | Applicable timeline scopes                                        |
| `templateRef`                         | Presentation template key                                         |
| `version` / `schemaVersion`           | Semver metadata                                                   |
| `severity`                            | Default presentation severity                                     |
| `iconRef`                             | Optional icon key                                                 |
| `visibility` / `stability` / `status` | Type lifecycle metadata                                           |
| `source`                              | `builtin` · `manifest`                                            |
| `permissionKeys`                      | Optional visibility gates (keys only — not evaluated client-side) |
| `label`                               | Optional display name                                             |
| `description`                         | Optional summary                                                  |

Template strings (`titleTemplate`, `summaryTemplate`, `bodyTemplate`) remain **server-side** for mapper execution (AT-007). Client DTOs do not include raw templates.

---

## 4. TimelineRegistryDto wire format

```typescript
interface TimelineRegistryDto {
  readonly schemaVersion: 1;
  readonly frameworkVersion?: string;
  readonly timelines: readonly TimelineDescriptorDto[];
}
```

| Field              | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `schemaVersion`    | DTO format version (`TIMELINE_REGISTRY_DTO_SCHEMA_VERSION = 1`) |
| `frameworkVersion` | Platform catalogue stamp                                        |
| `timelines`        | Permission-filtered timeline descriptors                        |

---

## 5. TimelineDescriptorDto

| Field                    | Description                  |
| ------------------------ | ---------------------------- |
| `timelineId`             | Stable timeline identifier   |
| `scope`                  | Timeline scope               |
| `label`                  | User-facing name             |
| `grouping`               | Default grouping strategy    |
| `sortOrder`              | Chronological direction      |
| `activityTypeFilter`     | Optional type allow-list     |
| `activityCategoryFilter` | Optional category allow-list |
| `version`                | Semver                       |
| `status`                 | Timeline lifecycle status    |
| `experienceRef`          | Optional experience binding  |
| `iconRef`                | Optional icon key            |
| `source`                 | `builtin` · `manifest`       |
| `permissionKeys`         | Optional visibility gates    |

---

## 6. ActivityHydrationDto (session activities)

```typescript
interface ActivityHydrationDto {
  readonly schemaVersion: 1;
  readonly items: readonly ActivityItemDto[];
  readonly hydratedAt: string;
}

interface ActivityItemDto {
  readonly activityId: string;
  readonly activityTypeId: string;
  readonly eventId: string;
  readonly title: string;
  readonly summary: string;
  readonly body?: string;
  readonly category: ActivityCategory;
  readonly severity: ActivitySeverity;
  readonly timestamp: string;
  readonly metadata: ActivityItemMetadataDto;
}
```

ActivityItemDto is a client-safe projection of ActivityItem — diagnostics may be omitted or redacted on wire.

---

## 7. Combined hydration bundle

```typescript
interface ActivityTimelineHydrationBundle {
  readonly schemaVersion: 1;
  readonly frameworkVersion?: string;
  readonly activityRegistry: ActivityRegistryDto;
  readonly timelineRegistry: TimelineRegistryDto;
  readonly activities: ActivityHydrationDto;
  readonly synchronisation: ClientRegistryHydrationSyncState;
}
```

Built by `buildActivityTimelineHydrationDto()` at server bootstrap (AT-009).

---

## 8. Server pipeline

```text
ActivityRegistry (bootstrapped)
        ↓ mapActivityRegistryDto()
ActivityRegistryDto (full)
        ↓ filterActivityRegistryDto(permissionAdapter)
Permission-filtered ActivityRegistryDto

TimelineRegistry (bootstrapped)
        ↓ mapTimelineRegistryDto()
TimelineRegistryDto (full)
        ↓ filterTimelineRegistryDto(permissionAdapter)
Permission-filtered TimelineRegistryDto

ActivitySessionStore snapshot
        ↓ mapActivityHydrationDto()
ActivityHydrationDto
        ↓ assemble bundle
ActivityTimelineHydrationBundle
        ↓ validateActivityTimelineHydrationBundle() [client boundary]
        ↓ createActivityTimelineContextFromDto()
Client read-only registries + ActivityService
```

---

## 9. Filter functions

### 9.1 filterActivityRegistryDto

```typescript
function filterActivityRegistryDto(
  dto: ActivityRegistryDto,
  permissionAdapter: WorkbenchPermissionAdapter,
): FilterActivityRegistryDtoResult;
```

| Filter rule              | Behaviour                              |
| ------------------------ | -------------------------------------- |
| `permissionKeys` empty   | Include type                           |
| `permissionKeys` present | Include only if adapter grants any key |
| `status: disabled`       | Exclude                                |
| `visibility: internal`   | Exclude from standard user DTO         |
| `visibility: restricted` | Require explicit permission            |

Returns `{ dto, diagnostics }` with `registeredCount`, `filteredCount`, `excludedIds`.

### 9.2 filterTimelineRegistryDto

Same pattern for timeline descriptors. `status: inactive` and `status: planned` excluded from standard user DTO unless admin permission scaffold grants access.

Permission filtering delegates to `WorkbenchPermissionAdapter.filter()` — framework never evaluates permissions inline (ADR-0023).

---

## 10. Components (implemented)

| Component                              | Path                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `mapActivityRegistryDto`               | `src/server/filter/map-activity-registry-dto.ts`                                                                 |
| `validateActivityRegistryDto`          | `src/server/filter/validate-activity-registry-dto.ts`                                                            |
| `filterActivityRegistryDto`            | `src/server/filter/filter-activity-registry-dto.ts`                                                              |
| `mapTimelineRegistryDto`               | `src/server/filter/map-timeline-registry-dto.ts`                                                                 |
| `filterTimelineRegistryDto`            | `src/server/filter/filter-timeline-registry-dto.ts`                                                              |
| `validateTimelineRegistryDto`          | `src/server/filter/validate-timeline-registry-dto.ts`                                                            |
| `ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION` | `src/server/filter/activity-registry-dto-schema-version.ts`                                                      |
| `TIMELINE_REGISTRY_DTO_SCHEMA_VERSION` | `src/server/filter/timeline-registry-dto-schema-version.ts`                                                      |
| Hydration diagnostics                  | `src/server/activity-registry-hydration-diagnostics.ts`, `src/server/timeline-registry-hydration-diagnostics.ts` |
| Hydration documentation                | [REGISTRY-HYDRATION.md](../../packages/activity-timeline-framework/docs/REGISTRY-HYDRATION.md)                   |

`buildActivityTimelineHydrationDto()` — deferred to AT-009.

---

## 11. Invalid DTO handling

Validation failures at client boundary produce:

- `ok: false`
- Empty invalid client registries
- Structured `ActivityRegistrationIssue[]` / `TimelineRegistrationIssue[]`
- No partial hydration

---

## 12. Architectural boundaries

| Rule                                       | AT-006 |
| ------------------------------------------ | ------ |
| DTO is read-only                           | ✅     |
| No client registration                     | ✅     |
| No mapper execution                        | ✅     |
| No Activity Service mutation from DTO path | ✅     |
| Server remains authoritative               | ✅     |
| Templates server-side only                 | ✅     |

---

## 13. Related

- [Client hydration](./SPR-007-ATF-activity-client-hydration.md)
- [Health endpoint activities field](./SPR-007-ATF-health-endpoint-activities.md)

---

_SPR-007 Activity & Timeline Registry DTO — AT-006 specification._
