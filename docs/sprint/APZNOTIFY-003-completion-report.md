# APZNOTIFY-003 Completion Report

**Milestone:** APZNOTIFY-003 — Notification HTTP API & Production Typed Client  
**Status:** COMPLETE  
**Date:** 2026-07-16  
**Next:** **APZNOTIFY-004 — Notification Workbench** (**await owner approval — do not start**)

---

## Executive summary

Exposed the Notification management plane through `/api/v1/notifications`, OpenAPI **1.4.0**, and production typed client `apps/web/lib/notifications`. Handlers call only `PlatformServiceGateway.notification.*`. **No delivery. No Workbench. No providers, workers, queues, Event Bus, or realtime.**

## Milestone scope

In scope: thin HTTP API, OpenAPI 3.1, typed client, Zod validation, envelopes, diagnostics (delivery=false), architecture audit, tests, docs.

Out of scope: Workbench, delivery, email/SMS/push/Teams/Slack/webhooks, workers, queues, scheduling, Event Bus, realtime.

## Package versions

| Package / artefact                   | Version                |
| ------------------------------------ | ---------------------- |
| `@apzhub/notification-contracts`     | **0.2.0** (unchanged)  |
| `@apzhub/notification-core`          | **0.2.0** (unchanged)  |
| `@apzhub/notification-persistence`   | **0.1.0** (unchanged)  |
| `@apzhub/platform-services`          | **0.21.0** (unchanged) |
| Platform OpenAPI                     | **1.4.0**              |
| Web Notification HTTP + typed client | APZNOTIFY-003 surface  |

## Architecture

```text
Future Workbench / product consumer
→ createHttpNotificationClient()
→ /api/v1/notifications/*
→ gateway.notification.*
→ RequestPipeline → Production Authorization
→ thin Notification Platform Services
→ Notification Core → Persistence → PostgreSQL
```

## Route catalogue

See [Notification Route Catalogue](../guides/APZHUB-Notification-Route-Catalogue.md). DELETE = soft archive. mark-read / acknowledge / dismiss = transition wrappers.

## Explicitly absent routes

send, resend, deliver, dispatch, retry, schedule, cancel-delivery, providers, smtp, sms, push, teams, slack, webhooks, workers, queues, events, stream, subscribe, realtime — proven absent by tests + `pnpm audit:notification-http-client`.

## Handlers

`apps/web/lib/api/v1/handlers/notifications.ts` + Zod `schemas/notifications.ts` + App Router routes under `apps/web/app/api/v1/notifications/**`.

## Trusted request context

`withPlatformApiAuth` → `buildServiceRequestContext` from session; client-supplied roles/tenant/permissions ignored.

## Response envelopes

Standard API v1 single / collection / error envelopes only.

## Authentication / authorization

Session auth; permissions via RequestPipeline + `notificationPlatformOps`. No handler role checks. `notification.delivery` unwired.

## Tenant and organisation isolation

Enforced in services/persistence; HTTP does not reassign tenant. Cross-tenant IDs → protected 404.

## Recipient privacy

Canonical fields only; no credentials/tokens in responses.

## Validation schemas

Zod for IDs, paging, create/update, transition, templates, preferences — strict; rejects provider/secret payloads.

## Operations covered

Notifications CRUD+lifecycle, templates, preferences, categories, channels, recipients, references, audit, diagnostics.

## Error mapping

Central translator; 503 when `APZHUB_NOTIFICATION_ENABLED` false (`NOTIFICATION_SERVICE_UNAVAILABLE`).

## OpenAPI

Tags + paths + schemas in `APZHUB-Platform-OpenAPI-v1.yaml` v1.4.0. `pnpm openapi:validate:platform` PASS.

## Typed client

`apps/web/lib/notifications` — HTTP + mock + accessor + query keys. Calls only `/api/v1/notifications`.

## Bootstrap

Existing production notification wiring + feature flag; no silent memory/allow-all fallback in production path.

## Files created (primary)

- Handlers, schemas, 28 route modules
- `apps/web/lib/notifications/**`
- `scripts/apznotify-003-notification-http-audit.mjs`
- Architecture/guides + this completion report

## Tests

- `apps/web/lib/api/v1/handlers/notifications.test.ts`
- `apps/web/lib/notifications/notification-client.test.ts`
- Audit zero violations

## Coverage

Scoped Vitest coverage (handlers + typed client):

| Surface                                 | Statements | Branches | Functions | Lines                                          |
| --------------------------------------- | ---------- | -------- | --------- | ---------------------------------------------- |
| Handlers `notifications.ts`             | 97.43%     | 72.97%   | 100%      | **97.43%**                                     |
| Typed client package (excl. types-only) | ~98%       | ~71%     | ~95%      | **≥96%** (`notification-client.ts` **96.09%**) |
| Zod schemas                             | 100%       | 100%     | 100%      | **100%**                                       |

Global branch threshold noise when running isolated suites does not reduce line targets below 95%.

## Quality gates

| Gate                                        | Result            |
| ------------------------------------------- | ----------------- |
| `pnpm audit:notification-http-client`       | PASS              |
| `pnpm openapi:validate:platform`            | PASS              |
| Notification HTTP + client Vitest           | PASS              |
| `pnpm audit:notification-foundation`        | PASS (regression) |
| `pnpm audit:notification-platform-services` | PASS (regression) |

## Known limitations

- List filters applied post-gateway (gateway list has no filter args)
- Revision concurrency not on updateMetadata input (domain limitation)
- Delivery states in vocabulary ≠ operational delivery
- No Workbench UI

## Technical debt

- APZNOTIFY-004 Workbench
- Future delivery plane (separate milestone)
- Live Postgres HTTP integration tests

## Risks

Misreading channel metadata as delivery readiness — mitigated by `deliveryAvailable: false` and diagnostics flags.

## Recommendation

**APZNOTIFY-004 — Notification Workbench** only: product-neutral UI consuming the typed client; inbox/detail/templates/preferences/categories/channels/recipients/references/audit/diagnostics; show providers unavailable; **no delivery**.

---

**Stop condition met.** Do not begin APZNOTIFY-004 without explicit owner approval.
