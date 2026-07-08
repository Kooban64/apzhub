# EN-014 — Completion Report

> **Story:** EN-014 — Action audit Event Bus wire  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await review before EN-015**

---

## Objective

Wire Action Framework audit execution into the Event Bus so successful action executions publish `capability.action.executed`. No notification delivery, UI, or persistence changes in production.

---

## Acceptance criteria

| Criterion                                            | Status                |
| ---------------------------------------------------- | --------------------- |
| Action audit event publisher                         | ✅                    |
| Publish `capability.action.executed`                 | ✅                    |
| Event envelope creation                              | ✅                    |
| Actor/context metadata                               | ✅                    |
| Action result metadata                               | ✅                    |
| Error/result status metadata (skip failed actions)   | ✅                    |
| Integration test: Action execute → Event Bus publish | ✅                    |
| Full-path test: execute → bus → mapper → service     | ✅ (test-only wiring) |
| No notification delivery / UI / persistence          | ✅                    |
| Owner review before EN-015                           | ⏳ Pending            |

---

## Implementation summary

| Component               | Path                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Envelope builder        | `packages/command-framework/src/audit/action-executed-event.ts`                                |
| Publish port            | `packages/command-framework/src/audit/publish-action-executed-event.ts`                        |
| Audit exports           | `packages/command-framework/src/audit/index.ts`                                                |
| Event Bus adapter       | `packages/event-notification-framework/src/integration/action-audit-event-publisher.ts`        |
| Test-only mapper wiring | `packages/event-notification-framework/src/integration/wire-notification-mapper-to-service.ts` |
| Action audit spec       | `docs/specs/SPR-006-ENF-action-audit-event.md`                                                 |
| Integration notes       | `docs/specs/SPR-006-ENF-event-to-notification-integration.md`                                  |

`EVENT_LAYER_STATUS` updated to `"audit"`.

---

## Event contract

| Field          | Value                        |
| -------------- | ---------------------------- |
| `eventId`      | `capability.action.executed` |
| `eventVersion` | `1.0.0`                      |
| `category`     | `capability`                 |
| `publisher`    | `command-framework`          |

**Publish rule:** only when `ActionAuditEntry.ok === true`. Failed executions are skipped.

**Envelope note:** `auditReference` is carried in payload; `causationId` is omitted because envelope validation requires a UUID parent id (per `SPR-006-ENF-event-envelope.md`).

---

## Architecture compliance

| Rule                                       | Result |
| ------------------------------------------ | ------ |
| Action Framework may publish via Event Bus | ✅     |
| Does not create notifications directly     | ✅     |
| Does not call notification mappers         | ✅     |
| Does not call Notification Service         | ✅     |
| Does not deliver notifications             | ✅     |
| Does not persist events                    | ✅     |
| Events remain separate from Notifications  | ✅     |

---

## Test results

| Suite                                        | Focus                                              |
| -------------------------------------------- | -------------------------------------------------- |
| `action-executed-event.test.ts`              | Envelope builder, skip-on-failure, publish port    |
| `action-audit-event-publisher.test.ts`       | Bus publish, audit hook adapter                    |
| `action-audit-notification-pipeline.test.ts` | Full path with `wireNotificationMapperToService()` |

| Gate                 | Result                    |
| -------------------- | ------------------------- |
| `pnpm lint`          | ✅                        |
| `pnpm typecheck`     | ✅                        |
| `pnpm build`         | ✅                        |
| `pnpm test`          | ✅ 1089 tests (+9 EN-014) |
| `pnpm test:coverage` | ✅ 90.70% statements      |
| `pnpm test:e2e`      | ✅ 24 tests               |

---

## Coverage

| Scope              | Statements | Branches | Functions | Lines  |
| ------------------ | ---------- | -------- | --------- | ------ |
| Monorepo aggregate | 90.70%     | 86.95%   | 91.46%    | 90.70% |

New audit and integration modules meet package ≥80% thresholds.

---

## Technical debt

| ID         | Item                                                                           | Target       |
| ---------- | ------------------------------------------------------------------------------ | ------------ |
| TD-EN15-01 | Production app bootstrap does not wire audit hook or mapper subscriber         | EN-015       |
| TD-EN15-02 | `wireNotificationMapperToService()` is test-only; replace with app composition | EN-015       |
| TD-EN15-03 | Health endpoint event/notification summaries not extended                      | EN-015       |
| TD-EN16-01 | No E2E seed for action-audit notification flow                                 | EN-016       |
| TD-EN14-01 | `capability.action.failed` catalogue entry not published                       | Future story |
| TD-EN14-02 | `causationId` vs audit reference — payload-only until trace model extends      | EN-015+      |

---

## Recommendation for EN-015

Implement **Application integration (`apps/web`)**:

1. Add `event-notification-hydration.ts` composing `EventNotificationContext`
2. Bootstrap event + notification registries at runtime
3. Wire `createActionAuditEventBusHook({ eventBus })` into `createAppActionExecutor`
4. Register production Event Bus subscriber for mapper → service (not test helper)
5. Mount `NotificationServiceProvider` + shell notification flags from EN-013
6. Extend `/api/health` with event and notification diagnostics

---

## Next step

**Stop.** Await review before EN-015 (Application integration).

---

_EN-014 Action audit Event Bus wire — Complete._
