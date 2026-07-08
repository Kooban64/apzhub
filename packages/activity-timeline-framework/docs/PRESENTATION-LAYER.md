# Presentation Layer (AT-011)

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-011  
> **Status:** Implemented — no UI

---

## Purpose

Reusable transformation layer between `ActivityTimelineService` and Timeline Experiences. Deterministic, pure, read-only.

**Does not:** query services, perform permission checks, mutate data, store state, or render UI.

---

## Pipeline

```text
ActivityDocument (from ActivityTimelineService)
        ↓
mapActivityDocumentToViewModel()
        ↓
sortActivityViewModels()
        ↓
groupActivityViewModels()
        ↓
buildActivityPresentationDiagnostics()
        ↓
Timeline Experiences (AT-012+)
```

Convenience entry point: `presentActivities(documents, options)`.

---

## Sorting

Default order within groups:

1. `timestamp` descending (newest first)
2. `activityId` ascending (deterministic tie-break)

---

## Grouping

`groupActivityViewModels(models, { strategy })` supports:

| Strategy         | Keys                            | Labels                    |
| ---------------- | ------------------------------- | ------------------------- |
| `date` (default) | `today`, `yesterday`, `earlier` | Today, Yesterday, Earlier |
| `category`       | Activity category id            | Category id               |
| `timelineScope`  | Timeline scope id               | Scope id                  |

### Date grouping rules (UTC)

Relative to injectable `now`:

- **Today** — same UTC calendar day as `now`
- **Yesterday** — previous UTC calendar day
- **Earlier** — all older entries

Empty buckets omitted unless `includeEmptyGroups: true`.

---

## Relative timestamps

`formatActivityRelativeTimestamp(timestamp, { now, locale })`:

| Elapsed    | Label             |
| ---------- | ----------------- |
| < 1 minute | `Just now`        |
| < 1 hour   | `Xm ago`          |
| < 24 hours | `Xh ago`          |
| < 7 days   | `Xd ago`          |
| ≥ 7 days   | Locale short date |

Inject `now` for deterministic tests.

---

## Diagnostics

`ActivityPresentationDiagnostics`:

| Field                    | Description                           |
| ------------------------ | ------------------------------------- |
| `status`                 | `empty` · `ready`                     |
| `layerStatus`            | `ACTIVITY_PRESENTATION_LAYER_STATUS`  |
| `totalCount`             | View model count                      |
| `groupCount`             | Number of groups                      |
| `groupCounts`            | Items per group key                   |
| `categoryCounts`         | Count by category                     |
| `scopeCounts`            | Count by timeline scope               |
| `presentationDurationMs` | Pipeline timing                       |
| `formattingStatus`       | `ok` · `partial` (invalid timestamps) |

---

## Exports

```typescript
import {
  presentActivities,
  mapActivityDocumentToViewModel,
  groupActivityViewModels,
  sortActivityViewModels,
  formatActivityRelativeTimestamp,
  buildActivityPresentationDiagnostics,
} from "@apzhub/activity-timeline-framework";
```

---

_Presentation Layer — AT-011._
