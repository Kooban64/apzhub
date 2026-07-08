# AT-007 — Completion Report

> **Story:** AT-007 — Event-to-Activity Mapper  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await owner approval before AT-008**

---

## Objective

Implement the Event-to-Activity Mapper — the first runtime component of the Activity Framework. The mapper consumes Platform Events and produces immutable ActivityDocuments. No Activity Service, timeline generation, React, or UI.

---

## Acceptance criteria

| Criterion                                                                      | Status |
| ------------------------------------------------------------------------------ | ------ |
| `DefaultEventToActivityMapper`                                                 | ✅     |
| `ActivityMapperRegistry`                                                       | ✅     |
| Activity template renderer                                                     | ✅     |
| Activity document factory (`createActivityDocument`, `freezeActivityDocument`) | ✅     |
| Event pattern resolution (exact + `prefix.*`)                                  | ✅     |
| Mapper and document diagnostics                                                | ✅     |
| DI defaults to `DefaultEventToActivityMapper`                                  | ✅     |
| `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "mapper"`                                | ✅     |
| No Event Bus subscription, service, storage, UI                                | ✅     |
| Quality gates pass                                                             | ✅     |

---

## Architectural rule (enforced)

The mapper is **declarative** — it interprets Activity Type definitions from the registry. No business-specific logic. New capability activity types require manifest registration only, not mapper code changes.

---

## Pipeline

```text
Platform Event (EventEnvelope)
        ↓ resolveActivityTypes(sourceEventPattern)
Activity Type Resolution
        ↓ renderActivityTemplate(title/description)
Activity Template Rendering
        ↓ createActivityDocument()
ActivityDocument (frozen)
        ↓ return only — no storage, service, or UI
```

---

## Deliverables

| Artifact                     | Path                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| DefaultEventToActivityMapper | `src/mapper/default-event-to-activity-mapper.ts`                                                                 |
| ActivityMapperRegistry       | `src/mapper/default-activity-mapper-registry.ts`                                                                 |
| Template renderer            | `src/mapper/render-activity-template.ts`                                                                         |
| Document factory             | `src/mapper/create-activity-document.ts`                                                                         |
| Pattern resolution           | `src/mapper/resolve-activity-types.ts`                                                                           |
| ActivityDocument types       | `src/types/activity-document.ts`                                                                                 |
| Template rendering doc       | [ACTIVITY-TEMPLATE-RENDERING.md](../../packages/activity-timeline-framework/docs/ACTIVITY-TEMPLATE-RENDERING.md) |
| Activity document spec       | [SPR-007-ATF-activity-document.md](../specs/SPR-007-ATF-activity-document.md) (updated)                          |

---

## ActivityDocument fields (implemented)

| Field            | Description                            |
| ---------------- | -------------------------------------- |
| `activityId`     | `{envelopeId}:{activityTypeId}`        |
| `activityTypeId` | Matched activity type                  |
| `sourceEventId`  | Platform event id                      |
| `title`          | Rendered title template                |
| `description`    | Rendered description template          |
| `timelineScope`  | Primary scope (first descriptor scope) |
| `category`       | Activity taxonomy category             |
| `timestamp`      | Event occurrence time                  |
| `actor`          | `{ id?: actorId }`                     |
| `metadata`       | Provenance, scopes, severity           |
| `diagnostics`    | Mapper snapshot at creation            |

All instances frozen via `freezeActivityDocument()`.

---

## Test results

| Suite           | Result                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------- |
| ATF unit tests  | ✅ 127 passed (16 files)                                                                  |
| Mapper tests    | ✅ 10 passed (exact, prefix, templates, immutability, diagnostics, NO_MATCH, determinism) |
| Full unit suite | ✅ (quality gate)                                                                         |
| Coverage        | ✅ ATF ≥80%                                                                               |
| E2E             | ✅ 30 passed (unchanged)                                                                  |

---

## Technical debt

| Item                                    | Notes                                                                                                 |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Event Bus subscription                  | Deferred to AT-013 app wiring — mapper exposes `map()` only                                           |
| Manifest `titleTemplate` on descriptors | Not stored on ActivityDescriptor — templates via ActivityMapperRegistry or label/description defaults |
| `payloadSummary` redaction              | Metadata field defined; population rules deferred                                                     |
| Idempotency strategy                    | Interface supports `"source-event-id"`; default `"none"` — no store dedup yet                         |
| Activity Service                        | AT-008 — mapper returns documents only                                                                |

---

## Recommendation for AT-008

1. Implement `DefaultActivityService` with in-memory session store for mapped ActivityDocuments
2. Wire mapper output into service via explicit caller (not Event Bus in AT-008 unless scoped)
3. Add `listActivities()` / `getActivity()` read API with TimelineQuery filtering by scope
4. Keep ActivityDocument immutable — user state (viewed, pinned) in separate session model per ADR-0034
5. Do not implement React hydration until AT-009

---

## Stop condition

**AT-007 complete.** Await owner approval before AT-008 (Activity Service).

---

_AT-007 Completion Report — SPR-007 Milestone 7._
