# EN-006 — Completion Report

> **Story:** EN-006 — Server Event Registry DTO  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await review before EN-007**

---

## Objective

Implement the **server-facing Event Registry DTO** — read-only projection, validation, permission filtering, and hydration diagnostics. Mirrors Action and Knowledge registry DTO patterns. No app wiring, client hydration, or notifications.

---

## Acceptance criteria

| Criterion                                            | Status     |
| ---------------------------------------------------- | ---------- |
| `EventRegistryDto` / `EventDescriptorDto`            | ✅         |
| DTO mapping from registry                            | ✅         |
| DTO validation                                       | ✅         |
| DTO versioning (`schemaVersion`, `frameworkVersion`) | ✅         |
| Permission filtering                                 | ✅         |
| Hydration diagnostics                                | ✅         |
| Server exports via `server/event`                    | ✅         |
| No publish / subscribe / notifications / persistence | ✅         |
| Event Registry DTO specification                     | ✅         |
| Owner review before EN-007                           | ⏳ Pending |

---

## Implementation summary

| Component             | Path                                                            |
| --------------------- | --------------------------------------------------------------- |
| DTO types + mapping   | `src/server/map-event-registry-dto.ts`                          |
| DTO validation        | `src/server/validate-event-registry-dto.ts`                     |
| Permission filter     | `src/server/filter-event-registry-dto.ts`                       |
| Schema version        | `src/server/event-registry-dto-schema-version.ts`               |
| Hydration diagnostics | `src/server/event-registry-hydration-diagnostics.ts` (extended) |
| Tests                 | `src/server/event-registry-dto.test.ts`                         |

`EVENT_NOTIFICATION_SERVER_STATUS` updated to `"filter"`.

---

## Hydration diagnostics summary

| Metric                                                        | Description                            |
| ------------------------------------------------------------- | -------------------------------------- |
| `registeredCount`                                             | Events in registry                     |
| `filteredCount`                                               | Events visible after permission filter |
| `platformEventCount` / `capabilityEventCount`                 | Registered by `source`                 |
| `filteredPlatformEventCount` / `filteredCapabilityEventCount` | Visible by `source`                    |
| `platformVersion`                                             | Bootstrap catalogue version            |
| `manifestCapabilities`                                        | Capability ids from manifest bootstrap |

---

## Architecture compliance

| Rule                                    | Result |
| --------------------------------------- | ------ |
| Read-only registry projection           | ✅     |
| Server authoritative                    | ✅     |
| Permission filter via Workbench adapter | ✅     |
| No Event Bus publish/subscribe          | ✅     |
| No notifications                        | ✅     |
| No app wiring                           | ✅     |
| No client hydration                     | ✅     |

---

## Test results

| Suite                            | Focus                                                                   |
| -------------------------------- | ----------------------------------------------------------------------- |
| `event-registry-dto.test.ts`     | Mapping, validation, filtering, diagnostics, versioning, empty registry |
| Updated exports / boundary tests | Server/event DTO exports                                                |

| Gate                 | Result                                             |
| -------------------- | -------------------------------------------------- |
| `pnpm lint`          | ✅                                                 |
| `pnpm typecheck`     | ✅                                                 |
| `pnpm build`         | ✅                                                 |
| `pnpm test`          | ✅ 964 tests (+16 EN-006)                          |
| `pnpm test:coverage` | ✅ ≥80% (monorepo aggregate **90.88%** statements) |
| `pnpm test:e2e`      | ✅ 24 tests                                        |

---

## Coverage

DTO subsystem meets package ≥80% thresholds. Monorepo aggregate: **90.88%** statements.

---

## Technical debt

| ID         | Item                                                    | Target          |
| ---------- | ------------------------------------------------------- | --------------- |
| TD-EN06-01 | Client hydration from DTO not implemented               | EN-010          |
| TD-EN06-02 | Bootstrap does not return DTO directly (map separately) | EN-015 optional |
| TD-EN07-01 | NotificationRegistry core not implemented               | EN-007          |
| TD-EN09-01 | Notification mappers not subscribed                     | EN-009          |
| TD-EN14-01 | Action audit hook not wired as publisher                | EN-014          |
| TD-EN15-01 | Runtime app bootstrap not wired                         | EN-015          |

---

## Recommendation for EN-007

Implement **NotificationRegistry core**:

1. `NotificationRegistry` with route registration and duplicate detection
2. Route descriptor validation and diagnostics
3. Placeholder-only notification mapper/service remain until EN-009/EN-011
4. **Do not** wire Event-to-notification mappers until EN-009
5. **Do not** implement client hydration until EN-010

---

## Next step

**Stop.** Await review before EN-007 (NotificationRegistry core).

---

_EN-006 Server Event Registry DTO — Complete._
