# AT-003 — Completion Report

> **Story:** AT-003 — Activity Registry core  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await owner approval before AT-004**

---

## Objective

Implement `DefaultActivityRegistry` as the authoritative metadata registry for Activity Types — mirroring Action, Knowledge, Event, and Notification registry patterns. Registry only — no Event Bus, mapping, timeline generation, storage, hydration, DTOs, UI, or app wiring.

---

## Acceptance criteria

| Criterion                                                                       | Status |
| ------------------------------------------------------------------------------- | ------ |
| `DefaultActivityRegistry` with full registry API                                | ✅     |
| Validation — id, semver, category, scopes, visibility, stability, source, shape | ✅     |
| Duplicate detection — `ActivityRegistryDuplicateError`                          | ✅     |
| Validation errors — `ActivityRegistryValidationError`                           | ✅     |
| Not found — `ActivityRegistryNotFoundError`                                     | ✅     |
| Atomic batch registration — no partial commits                                  | ✅     |
| Metadata projection — `buildActivityMetadata`, diagnostics                      | ✅     |
| Immutable descriptors — freeze on registration, defensive copies                | ✅     |
| `createActivityTimelineContext()` defaults to `DefaultActivityRegistry`         | ✅     |
| `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "registry"`                               | ✅     |
| ActivityDocument immutability rule documented                                   | ✅     |
| Activity metadata specification                                                 | ✅     |
| Quality gates pass                                                              | ✅     |

---

## Deliverables

| Artifact                | Path                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------ |
| DefaultActivityRegistry | `packages/activity-timeline-framework/src/registry/default-activity-registry.ts`     |
| Validation              | `registry/validate-activity-descriptor.ts`                                           |
| Metadata projection     | `registry/build-activity-metadata.ts`                                                |
| Errors                  | `registry/registry-errors.ts`                                                        |
| Tests                   | `registry/default-activity-registry.test.ts`, `validate-activity-descriptor.test.ts` |
| Activity metadata spec  | [SPR-007-ATF-activity-metadata.md](../specs/SPR-007-ATF-activity-metadata.md)        |
| Domain model update     | [DOMAIN-MODEL.md](../../packages/activity-timeline-framework/docs/DOMAIN-MODEL.md)   |

---

## Registry API (implemented)

| Method                                                                                    | Behaviour                                   |
| ----------------------------------------------------------------------------------------- | ------------------------------------------- |
| `register()`                                                                              | Validate → duplicate check → freeze → store |
| `registerMany()`                                                                          | Validate all → duplicate check → commit     |
| `registerManyAtomic()`                                                                    | All-or-nothing batch                        |
| `replace()`                                                                               | Update existing type                        |
| `has()` / `get()` / `list()`                                                              | Lookup with defensive frozen copies         |
| `getMetadata()` / `listMetadata()`                                                        | Metadata projection                         |
| `getRegistryMetadata()`                                                                   | Bootstrap snapshot                          |
| `getDiagnostics()`                                                                        | Registry health                             |
| `clear()`                                                                                 | Reset registry                              |
| `recordManifestCapabilities()` / `recordPlatformCatalogue()` / `recordFrameworkVersion()` | Bootstrap metadata                          |

---

## Architectural rule locked — ActivityDocument

**ActivityDocument is immutable.** User state (read, pinned, hidden, archived) belongs to future session/user state models — not the ActivityDocument itself.

Documented in:

- [SPR-007-ATF-activity-registry.md](../specs/SPR-007-ATF-activity-registry.md)
- [SPR-007-ATF-activity-document.md](../specs/SPR-007-ATF-activity-document.md)
- [DOMAIN-MODEL.md](../../packages/activity-timeline-framework/docs/DOMAIN-MODEL.md)

---

## Quality gate results

| Gate                 | Result                     |
| -------------------- | -------------------------- |
| `pnpm lint`          | ✅ Pass                    |
| `pnpm typecheck`     | ✅ Pass                    |
| `pnpm build`         | ✅ Pass                    |
| `pnpm test`          | ✅ 1146 passed             |
| `pnpm test:coverage` | ✅ Pass (≥80% ATF package) |
| `pnpm test:e2e`      | ✅ 30 passed               |

---

## AT-004 recommendations

1. Implement `DefaultTimelineRegistry` with locked scope ids (`timeline.personal`, etc.)
2. Keep registry pattern parity — validation, freeze, atomic batch, metadata, diagnostics
3. Do not wire Event Bus or Activity Service until AT-007 / AT-008

---

## Stop condition

**AT-003 complete.** Await owner approval before AT-004 Timeline Registry.

---

_AT-003 Completion Report — SPR-007 Milestone 7._
