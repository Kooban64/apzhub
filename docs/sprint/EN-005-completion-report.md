# EN-005 — Completion Report

> **Story:** EN-005 — Manifest Event Bootstrap  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Date:** 2026-07-03  
> **Status:** Complete — **await review before EN-006**

---

## Objective

Implement **manifest-driven Event Registry bootstrap** — register platform event definitions from the built-in catalogue and capability manifests. Definitions only; no publish, notifications, audit wiring, or persistence.

---

## Acceptance criteria

| Criterion                                                    | Status     |
| ------------------------------------------------------------ | ---------- |
| Event manifest extraction                                    | ✅         |
| Built-in platform event catalogue                            | ✅         |
| `bootstrapEventRegistry()`                                   | ✅         |
| Atomic event registration                                    | ✅         |
| Registry / hydration diagnostics                             | ✅         |
| Manifest validation                                          | ✅         |
| Event source metadata (`builtin` · `manifest`)               | ✅         |
| No publish / subscribe / notifications / audit / persistence | ✅         |
| Bootstrap specification                                      | ✅         |
| Platform catalogue documentation                             | ✅         |
| Owner review before EN-006                                   | ⏳ Pending |

---

## Implementation summary

| Component                | Path                                                 |
| ------------------------ | ---------------------------------------------------- |
| `bootstrapEventRegistry` | `src/catalogue/bootstrap-event-registry.ts`          |
| Platform catalogue       | `src/catalogue/platform-event-catalogue.ts`          |
| Catalogue registration   | `src/catalogue/register-platform-events.ts`          |
| Manifest extraction      | `src/extraction/extract-events.ts`                   |
| Manifest validation      | `src/extraction/event-manifest-schema.ts`            |
| Atomic population        | `src/extraction/populate-registry.ts`                |
| Hydration diagnostics    | `src/server/event-registry-hydration-diagnostics.ts` |
| Runtime adapter          | `src/server/map-capability-records.ts`               |
| Tests                    | `src/catalogue/bootstrap-event-registry.test.ts`     |

`EVENT_LAYER_STATUS` updated to `"bootstrap"`.

---

## Platform Event Catalogue

Foundational events registered at bootstrap (definitions only):

| eventId                                | category   | publisher                     |
| -------------------------------------- | ---------- | ----------------------------- |
| `system.platform.bootstrap.completed`  | system     | platform-runtime              |
| `system.platform.health.changed`       | system     | platform-runtime              |
| `capability.action.executed`           | capability | command-framework             |
| `capability.knowledge.query.completed` | capability | knowledge-discovery-framework |

See [SPR-006-ENF-platform-event-catalogue.md](../specs/SPR-006-ENF-platform-event-catalogue.md).

---

## Bootstrap behaviour

1. **Platform catalogue** — `registerPlatformEventCatalogue()` (atomic)
2. **Manifest extraction** — inline `events[]` or standalone `event` block
3. **Manifest registration** — `registerManyAtomic()` (atomic)
4. **Diagnostics** — platform vs capability counts, source metadata, manifest capabilities

Duplicate policy: fail-fast — conflicts within extraction or against existing registry (including platform catalogue) produce structured errors without partial manifest registration.

---

## Architecture compliance

| Rule                                         | Result |
| -------------------------------------------- | ------ |
| Registry owns definitions only               | ✅     |
| No Event Bus publish                         | ✅     |
| No subscribe / notifications                 | ✅     |
| No Action audit wiring                       | ✅     |
| No persistence                               | ✅     |
| Event layer isolated from notification layer | ✅     |
| No Runtime/Workbench app integration yet     | ✅     |

---

## Test results

| Suite                              | Focus                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `bootstrap-event-registry.test.ts` | Extraction, catalogue, atomic registration, duplicates, diagnostics, repeatability |
| Updated package tests              | Exports, status, layer status, boundary separation                                 |

| Gate                 | Result                                  |
| -------------------- | --------------------------------------- |
| `pnpm lint`          | ✅                                      |
| `pnpm typecheck`     | ✅                                      |
| `pnpm build`         | ✅                                      |
| `pnpm test`          | ✅ 948 tests (+12 EN-005)               |
| `pnpm test:coverage` | ✅ ≥80% (monorepo aggregate maintained) |
| `pnpm test:e2e`      | ✅ 24 tests                             |

---

## Coverage

Bootstrap subsystem meets package ≥80% thresholds. Monorepo aggregate maintained above threshold.

---

## Technical debt

| ID         | Item                                                                                 | Target  |
| ---------- | ------------------------------------------------------------------------------------ | ------- |
| TD-EN05-01 | Runtime manifest discovery not wired to `bootstrapEventRegistry()` in app bootstrap  | EN-015  |
| TD-EN05-02 | Payload schema stored as manifest metadata only — no envelope payload validation yet | EN-006+ |
| TD-EN05-03 | `planned` status registered but publish rejection not enforced on bus                | EN-014+ |
| TD-EN06-01 | Permission-filtered Event Registry DTO not implemented                               | EN-006  |
| TD-EN09-01 | Notification mappers not subscribed                                                  | EN-009  |
| TD-EN14-01 | Action audit hook not wired as publisher                                             | EN-014  |

---

## Recommendation for EN-006

Implement **Server filter DTO (events)**:

1. `EventRegistryDto` serialisation from bootstrapped registry
2. `filterEventRegistryDto()` with permission filtering
3. Hydration diagnostics for client-safe event metadata
4. **Do not** implement notification DTO or client provider until EN-010
5. **Do not** wire Runtime bootstrap until EN-015 unless needed for DTO integration tests

---

## Next step

**Stop.** Await review before EN-006 (Server filter DTO).

---

_EN-005 Manifest Event Bootstrap — Complete._
