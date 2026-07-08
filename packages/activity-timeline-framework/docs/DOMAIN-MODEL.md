# Activity & Timeline Framework — Domain Model

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-004 — Activity + Timeline registries implemented  
> **Authority:** [SPR-007 spec index](../../docs/specs/SPR-007-spec-index.md)

---

## Overview

The domain model separates **activity types** (Activity Registry), **timeline definitions** (Timeline Registry), and **activity documents** (mapped instances). Neither registry stores timeline entries or activity history.

---

## Activity layer (AT-003)

### ActivityDescriptor

Frozen activity type metadata. See [Activity Registry spec](../../docs/specs/SPR-007-ATF-activity-registry.md).

### DefaultActivityRegistry

Authoritative activity type registry. Factory: `createDefaultActivityRegistry()`.

---

## Timeline layer (AT-004)

### TimelineDefinition

Immutable metadata describing a timeline scope, behaviour, and presentation — **not** timeline entries.

| Field                            | Notes                                 |
| -------------------------------- | ------------------------------------- |
| `timelineId`                     | Stable id (`timeline.personal`, etc.) |
| `scope`                          | Locked scope id                       |
| `label` / `description` / `icon` | Presentation                          |
| `order`                          | Sort order                            |
| `supportedActivityCategories`    | Category allow-list                   |
| `metadata`                       | Opaque frozen metadata                |

### DefaultTimelineRegistry

Authoritative timeline definition registry. Factories:

- `createDefaultTimelineRegistry()` — empty
- `createDefaultTimelineRegistryWithPlatformCatalogue()` — four built-in definitions

### Platform catalogue

| timelineId              | status    |
| ----------------------- | --------- |
| `timeline.personal`     | `active`  |
| `timeline.team`         | `planned` |
| `timeline.organization` | `planned` |
| `timeline.system`       | `planned` |

---

## ActivityDocument (immutable — locked)

Mapped activity instance (AT-007). User state (read, pinned, hidden, archived) belongs to future session/user state models — **not** ActivityDocument.

---

## Composition root

```typescript
const context = createActivityTimelineContext();
// context.registry — DefaultActivityRegistry
// context.timelineRegistry — DefaultTimelineRegistry + platform catalogue
// context.mapper / context.service — placeholders until AT-007 / AT-008
```

| Property              | AT-004                        |
| --------------------- | ----------------------------- |
| `status`              | `"timeline-registry"`         |
| `diagnostics`         | Activity registry diagnostics |
| `timelineDiagnostics` | Timeline registry diagnostics |

---

## Package layout

```text
src/registry/     Activity Registry (AT-003)
src/timeline/     Timeline Registry (AT-004)
src/mapper/       Placeholder (AT-007)
src/service/      Placeholder (AT-008)
src/di/           createActivityTimelineContext()
```

---

_Domain model documentation — AT-004 Timeline Registry._
