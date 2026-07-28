# APZHUB-1.1-003 — Operational Readiness

> **Programme:** APZHUB-1.1-003  
> **Date:** 2026-07-20  
> **Status:** Ready for Owner Acceptance (foundation operational with documented limits)

---

## What operators get

| Capability                                                       | Plane                | Status                                               |
| ---------------------------------------------------------------- | -------------------- | ---------------------------------------------------- |
| Support domain event publish from Platform Services              | Server Event Bus     | **Operational** (fail-soft)                          |
| In-app Attention notifications for Support catalogue events      | ENF shell (apps/web) | **Operational** (session + persisted Attention path) |
| Catalogue manifests `events/support/*`                           | Platform Event SDK   | **On disk**                                          |
| Reusable `DomainEventPublisher` + `wireDomainEventNotifications` | Platform packages    | **Reusable** by other products                       |

## What this is not

| Item                                          | Status                                 |
| --------------------------------------------- | -------------------------------------- |
| APZNOTIFY delivery providers (email/SMS/push) | Still frozen / unavailable — unchanged |
| Realtime WS/SSE inbox transport               | Not delivered                          |
| Zammad webhook HTTP ingress                   | Not delivered                          |
| Email System of Record                        | Explicit STOP                          |

## Operate / verify

1. Support mutations via gateway Platform Services publish catalogue events when `domainEventPublisher` is injected (default web bootstrap).
2. Shell ENF context registers Support events/routes and wires Attention notifications.
3. Fail-soft: mutation success is independent of publish success.
4. Regression: `pnpm exec vitest run packages/platform-services/src/events/support-domain-events.test.ts packages/platform-services/src/support-platform-services.test.ts apps/web/lib/support-event-notification-foundation.test.ts`

## Rollback posture

Optional publisher injection — callers without publisher retain prior behaviour (`NO_PUBLISHER` fail-soft). No Support HTTP contract change.
