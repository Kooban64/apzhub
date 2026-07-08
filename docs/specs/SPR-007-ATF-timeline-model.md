# SPR-007 — Timeline Model

> **Story:** AT-004  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented — `DefaultTimelineRegistry` (AT-004)  
> **Authority:** [Activity architecture](./SPR-007-ATF-activity-architecture.md) · [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) · [Document 021](../021-notification-activity-attention-management-framework.md) §7–§8

---

## 1. Purpose

Define the **Timeline model** — logical views over activity items, Timeline Registry, scope resolution, grouping strategies, and visibility rules.

Timelines are **not** separate event streams. They are presentation scopes applied at read/group time over ActivityItems produced by Activity Mapping.

---

## 2. Core concepts

| Concept                | Definition                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Timeline**           | A named, permission-gated view over activity items                                                          |
| **Timeline scope**     | Classification dimension (`timeline.personal`, `timeline.team`, `timeline.organization`, `timeline.system`) |
| **TimelineDescriptor** | Registry entry defining a timeline's metadata and filters                                                   |
| **Scope resolution**   | Matching ActivityItems to timelines at Presentation Layer read time                                         |
| **Grouping**           | Organising view models within a timeline (by date, actor, category)                                         |

```text
ActivityMapper produces neutral ActivityItem (scope hints in metadata)
        ↓
ActivityService stores items (no timeline assignment at write time)
        ↓
Presentation Layer resolves timeline membership by scope rules
        ↓
Timeline Experience renders grouped view models
```

---

## 3. Timeline scopes (locked)

| Scope        | Scope id                | Visibility rule (SPR-007)                                 | Status               |
| ------------ | ----------------------- | --------------------------------------------------------- | -------------------- |
| Personal     | `timeline.personal`     | `actorId` matches session user                            | Default — foundation |
| Team         | `timeline.team`         | Deferred — Subscription Service M8+                       | Reserved             |
| Organization | `timeline.organization` | Organization context (M8+ RBAC depth)                     | Reserved             |
| System       | `timeline.system`       | `category` in `system`, `security`; admin RBAC (M8 depth) | Reserved             |

> **Locked decision:** Default timeline scope is `timeline.personal`. Reserved ids are documentation and registry stubs until AT-004+.

### 3.1 Scope resolution rules

| Rule                      | Detail                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Multi-timeline membership | One ActivityItem may appear in multiple timelines when scope rules match                               |
| Mapper neutrality         | Mapper sets scope **hints** (`actorId`, `workspaceId`, `timelineScopes`); does not assign timeline ids |
| Read-time resolution      | `resolveActivityTimelines(item, context)` in Presentation Layer                                        |
| Permission gate           | Timeline visibility filtered server-side before DTO hydration                                          |
| Team scope                | Registry entry allowed; resolution returns empty until M8 identity model                               |

### 3.2 Scope context (Presentation Layer input)

| Field         | Source                                  |
| ------------- | --------------------------------------- |
| `actorId`     | Session user platform id                |
| `workspaceId` | Active workspace from Workbench context |
| `permissions` | Permission adapter snapshot (read-only) |
| `teamIds`     | Stub — empty array in SPR-007           |

---

## 4. TimelineDescriptor

Registry entry for a logical timeline view.

```typescript
interface TimelineDescriptor {
  readonly timelineId: string;
  readonly scope: TimelineScope;
  readonly label: string;
  readonly version: string;
  readonly activityTypeFilter?: readonly string[];
  readonly activityCategoryFilter?: readonly ActivityCategory[];
  readonly grouping: TimelineGroupingStrategy;
  readonly sortOrder: TimelineSortOrder;
  readonly permissionKeys?: readonly string[];
  readonly experienceRef?: string;
  readonly status: TimelineStatus;
  readonly description?: string;
  readonly iconRef?: string;
  readonly source?: "builtin" | "manifest";
}
```

### 4.1 Field reference

| Field                    | Required | Description                                                                                                           |
| ------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `timelineId`             | ✅       | Stable identifier — default `timeline.personal`; reserved `timeline.team`, `timeline.organization`, `timeline.system` |
| `scope`                  | ✅       | Scope id matching locked identifiers above                                                                            |
| `label`                  | ✅       | User-facing name (platform terminology — Document 002)                                                                |
| `version`                | ✅       | Descriptor semver                                                                                                     |
| `grouping`               | ✅       | Default grouping strategy (§5)                                                                                        |
| `sortOrder`              | ✅       | `newest-first` · `oldest-first`                                                                                       |
| `activityTypeFilter`     | Optional | Allow-list of `activityTypeId` values or patterns                                                                     |
| `activityCategoryFilter` | Optional | Allow-list of categories                                                                                              |
| `permissionKeys`         | Optional | Visibility RBAC keys (M8 population)                                                                                  |
| `experienceRef`          | Optional | Shell experience binding id                                                                                           |
| `status`                 | Optional | `active` · `inactive` · `planned`                                                                                     |
| `description`            | Optional | Human-readable summary                                                                                                |
| `iconRef`                | Optional | Lucide icon key                                                                                                       |
| `source`                 | Optional | `builtin` · `manifest`                                                                                                |

---

## 5. Grouping strategies

| Strategy    | Value         | Behaviour                                          | SPR-007     |
| ----------- | ------------- | -------------------------------------------------- | ----------- |
| By day      | `by-day`      | Group into Today, Yesterday, This week, Earlier    | ✅ Primary  |
| By actor    | `by-actor`    | Group by `actorLabel`; secondary sort by timestamp | ✅ Scaffold |
| By category | `by-category` | Group by activity category                         | Scaffold    |
| Flat        | `flat`        | Chronological list only                            | Supported   |

Grouping is applied in **Activity Presentation Layer** — not at mapper or store level.

### 5.1 By-day bucket labels

| Bucket    | Rule                                      |
| --------- | ----------------------------------------- |
| Today     | Same calendar day as `now` (locale-aware) |
| Yesterday | Previous calendar day                     |
| This week | Within 7 days, excluding today/yesterday  |
| Earlier   | Older than 7 days                         |

Inject `now` for deterministic tests.

---

## 6. TimelineRegistry contract (planned)

```typescript
interface TimelineRegistry {
  register(descriptor: TimelineDescriptor): void;
  registerMany(descriptors: readonly TimelineDescriptor[]): void;
  registerManyAtomic(
    descriptors: readonly TimelineDescriptor[],
  ): TimelineBatchRegistrationResult;
  replace(descriptor: TimelineDescriptor): void;
  has(timelineId: string): boolean;
  get(timelineId: string): TimelineDescriptor | undefined;
  list(): readonly TimelineDescriptor[];
  listByScope(scope: TimelineScope): readonly TimelineDescriptor[];
  getDiagnostics(): TimelineRegistryDiagnostics;
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  recordPlatformCatalogue(version: string): void;
  clear(): void;
}
```

Registration semantics mirror ActivityRegistry (fail-fast, atomic batch, frozen copies).

---

## 7. Platform timeline catalogue (built-in)

| timelineId          | scope     | label              | grouping    | SPR-007        |
| ------------------- | --------- | ------------------ | ----------- | -------------- |
| `personal`          | personal  | Recent activity    | by-day      | ✅ Foundation  |
| `workspace.default` | workspace | Workspace activity | by-day      | ✅ Scaffold    |
| `system.platform`   | system    | Platform events    | by-category | Scaffold       |
| `team.default`      | team      | Team activity      | by-actor    | `planned` stub |

---

## 8. Visibility and permissions

Follows Registry Pattern ([Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)):

1. **Declaration** — catalogue + manifest `timelines` block
2. **Server bootstrap** — `bootstrapTimelineRegistry()`
3. **Permission filter** — `filterTimelineRegistryDto()` before client DTO
4. **Hydration** — read-only client registry
5. **Experience** — renders only hydrated timelines

| Timeline            | SPR-007 visibility                        |
| ------------------- | ----------------------------------------- |
| `personal`          | All authenticated users                   |
| `workspace.default` | Users with workspace context              |
| `system.platform`   | Admin scaffold — permissive until M8 RBAC |
| `team.default`      | Hidden — `status: planned`                |

Timelines do **not** publish or subscribe to Event Bus.

---

## 9. Relationship to Activity Registry

| Registry         | Stores                        | Used by                               |
| ---------------- | ----------------------------- | ------------------------------------- |
| ActivityRegistry | Activity **type** descriptors | Activity Mapper (match events)        |
| TimelineRegistry | Timeline **view** descriptors | Presentation Layer (scope + grouping) |

Activity type `timelineScopes` on ActivityDescriptor declares which scopes **may** display that type. TimelineDescriptor `activityTypeFilter` further restricts which types appear in a specific timeline.

Both filters apply at presentation time.

---

## 10. Boundaries (must not)

| Rule                        | AT-004 |
| --------------------------- | ------ |
| Subscribe to Event Bus      | ❌     |
| Store ActivityItems         | ❌     |
| Publish events              | ❌     |
| Render shell UI             | ❌     |
| Evaluate permissions inline | ❌     |

---

## 11. Related

- [Timeline registry DTO](./SPR-007-ATF-activity-registry-dto.md)
- [Activity bootstrap](./SPR-007-ATF-activity-bootstrap.md)
- [Timeline Experiences](./SPR-007-ATF-timeline-experiences.md)

---

_SPR-007 Timeline Model — AT-004 specification._
