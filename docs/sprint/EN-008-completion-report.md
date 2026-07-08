# EN-008 — Completion Report

> **Story:** EN-008 — Notification Route Providers  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await review before EN-009**

---

## Objective

Implement **manifest-driven Notification Registry bootstrap** — register platform notification route definitions from the built-in catalogue and capability manifests. Definitions only; no delivery, Event Bus subscription, mapper execution, or UI.

---

## Acceptance criteria

| Criterion                                             | Status     |
| ----------------------------------------------------- | ---------- |
| Notification manifest extraction                      | ✅         |
| Built-in platform notification catalogue              | ✅         |
| `bootstrapNotificationRegistry()`                     | ✅         |
| Atomic notification registration                      | ✅         |
| Registry / hydration diagnostics                      | ✅         |
| Manifest validation (including kind/channel pairs)    | ✅         |
| Notification source metadata (`builtin` · `manifest`) | ✅         |
| No delivery / Event Bus / mapper / persistence / UI   | ✅         |
| Bootstrap specification                               | ✅         |
| Platform catalogue documentation                      | ✅         |
| Owner review before EN-009                            | ⏳ Pending |

---

## Implementation summary

| Component                       | Path                                                        |
| ------------------------------- | ----------------------------------------------------------- |
| `bootstrapNotificationRegistry` | `src/catalogue/bootstrap-notification-registry.ts`          |
| Platform catalogue              | `src/catalogue/platform-notification-catalogue.ts`          |
| Catalogue registration          | `src/catalogue/register-platform-notifications.ts`          |
| Manifest extraction             | `src/extraction/extract-notifications.ts`                   |
| Manifest validation             | `src/extraction/notification-manifest-schema.ts`            |
| Atomic population               | `src/extraction/populate-notification-registry.ts`          |
| Hydration diagnostics           | `src/server/notification-registry-hydration-diagnostics.ts` |
| Server barrel                   | `src/server/bootstrap/bootstrap-notification-registry.ts`   |
| Tests                           | `src/catalogue/bootstrap-notification-registry.test.ts`     |

`NOTIFICATION_LAYER_STATUS` updated to `"bootstrap"`.

---

## Platform Notification Catalogue

Foundational routes registered at bootstrap (definitions only):

| routeId                   | eventPattern                          | kind   | channel |
| ------------------------- | ------------------------------------- | ------ | ------- |
| `platform.toast.default`  | `system.platform.bootstrap.completed` | toast  | in-app  |
| `platform.banner.warning` | `system.platform.health.changed`      | banner | in-app  |
| `platform.inbox.system`   | `system.platform.bootstrap.completed` | inbox  | in-app  |
| `platform.inapp.system`   | `system.platform.health.changed`      | in-app | in-app  |

See [SPR-006-ENF-platform-notification-catalogue.md](../specs/SPR-006-ENF-platform-notification-catalogue.md).

---

## Bootstrap behaviour

1. **Platform catalogue** — `registerPlatformNotificationCatalogue()` (atomic)
2. **Manifest extraction** — inline `notifications.routes[]` block
3. **Manifest registration** — `registerManyAtomic()` (atomic)
4. **Diagnostics** — platform vs capability counts, source metadata, manifest capabilities

Duplicate policy: fail-fast — conflicts within extraction or against existing registry (including platform catalogue) produce structured errors without partial manifest registration.

---

## Architecture compliance

| Rule                                       | Result |
| ------------------------------------------ | ------ |
| Registry owns definitions only             | ✅     |
| No notification delivery                   | ✅     |
| No Event Bus subscribe/publish             | ✅     |
| No mapper execution                        | ✅     |
| No persistence                             | ✅     |
| No client hydration / UI                   | ✅     |
| Notification layer isolated from event bus | ✅     |
| No Runtime/Workbench app integration yet   | ✅     |

---

## Test results

| Suite                                     | Focus                                                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `bootstrap-notification-registry.test.ts` | Extraction, catalogue, atomic registration, duplicates, diagnostics, repeatability, source metadata |
| Updated package tests                     | Exports, status, layer status, boundary separation                                                  |

| Gate                 | Result                    |
| -------------------- | ------------------------- |
| `pnpm lint`          | ✅                        |
| `pnpm typecheck`     | ✅                        |
| `pnpm build`         | ✅                        |
| `pnpm test`          | ✅ 996 tests (+12 EN-008) |
| `pnpm test:coverage` | ✅ 90.48% statements      |
| `pnpm test:e2e`      | ✅ 24 tests               |

---

## Coverage

| Scope              | Statements | Branches | Functions | Lines  |
| ------------------ | ---------- | -------- | --------- | ------ |
| Monorepo aggregate | 90.48%     | 86.47%   | 91.92%    | 90.48% |

Notification bootstrap subsystem (`bootstrap-notification-registry.test.ts`: 12 tests) meets package ≥80% thresholds.

---

## Technical debt

| ID         | Item                                                                                             | Target  |
| ---------- | ------------------------------------------------------------------------------------------------ | ------- |
| TD-EN08-01 | Runtime manifest discovery not wired to `bootstrapNotificationRegistry()` in app bootstrap       | EN-015  |
| TD-EN08-02 | `titleTemplate` / `bodyTemplate` parsed but not stored on descriptor — mapper templates deferred | EN-009  |
| TD-EN08-03 | Notification Registry DTO not implemented                                                        | EN-010+ |
| TD-EN09-01 | Event-to-notification mappers not implemented                                                    | EN-009  |
| TD-EN11-01 | NotificationService not implemented                                                              | EN-011  |

---

## Recommendation for EN-009

Implement **Event-to-notification mappers**:

1. Subscribe to Event Bus (or receive envelopes from orchestrator)
2. Match published events to registered route `eventPattern`
3. Execute template rendering (`titleTemplate` / `bodyTemplate`)
4. Produce `NotificationItem` instances — still no delivery until EN-011

**Do not** implement client hydration or UI until EN-010 / EN-013.

---

## Next step

**Stop.** Await review before EN-009 (Event-to-notification mappers).

---

_EN-008 Notification Route Providers — Complete._
