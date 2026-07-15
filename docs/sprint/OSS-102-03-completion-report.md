# OSS-102-03 Completion Report — Zammad Core Support Services

> **Milestone:** OSS-102-03  
> **Status:** **COMPLETE**  
> **Package:** `@apzhub/integration-zammad` **v0.2.0**  
> **Date:** 2026-07-10  
> **Stop condition:** Met — await owner approval before **OSS-102-04**

---

## Executive summary

OSS-102-03 implements core Support-domain services inside the Zammad adapter, exposed on `adapter.core` using the same engineering pattern as the certified Plane Reference Adapter (`ZammadCoreServices` + `ZammadOperationRunner` + extended `ZammadRestClient` + canonical mappers + mock API + contract tests).

Additive vendor-neutral Support DTOs were added to `@apzhub/platform-service-contracts` **v0.3.0**. No PlatformService, HTTP routes, UI, sync, or webhooks were implemented.

---

## Services implemented

| `adapter.core`     | Class                         | Scope                                                                 |
| ------------------ | ----------------------------- | --------------------------------------------------------------------- |
| `.support`         | `ZammadSupportService`        | Support Request lifecycle (Zammad Ticket)                             |
| `.organizations`   | `ZammadOrganizationService`   | list/get/create/update/archive                                        |
| `.groups`          | `ZammadGroupService`          | list/get/create/update (no permissions admin)                         |
| `.users`           | `ZammadUserService`           | list/get/lookup/search (support-domain only)                          |

### Support Request operations

list · get · create · update · close · reopen · changeState · changePriority · assignOwner · removeOwner · assignCustomer · searchByTicketNumber · searchByTitle · pagination · sorting · filtering · canonical DTO mapping

**Not implemented:** articles/comments, attachments, history, time accounting, macros, triggers, SLA.

---

## Architecture

```text
Client (tests / future PlatformService)
  → adapter.core.{support|organizations|groups|users}
  → ZammadOperationRunner (metrics, log, CB, error translation)
  → ZammadRestClient
  → ZammadFetchClient
  → Zammad CE REST /api/v1
```

Reuses SDK: `IntegrationAdapterBase`, `AdapterFactory`, `AdapterContext`, `IntegrationLogger`, Metrics, CircuitBreaker, Diagnostics, ErrorTranslator, CapabilityRegistration.

No duplicated SDK functionality. No other services on `adapter.core`.

---

## Canonical mappings

| Zammad            | APZHUB canonical                         | Provisional ID prefix |
| ----------------- | ---------------------------------------- | --------------------- |
| Ticket            | `SupportTicket` (Support Request)        | `sreq_zammad_`        |
| Organization      | `SupportOrganization`                    | `sorg_zammad_`        |
| Group             | `SupportGroup`                           | `sgrp_zammad_`        |
| User (agent/cust) | `SupportUser`                            | `suser_zammad_`       |
| State             | `SupportTicketStatus`                    | —                     |
| Priority          | `SupportTicketPriority`                  | —                     |
| Owner             | `assigneeId` (`SupportUserId`)           | —                     |
| Customer          | `requesterId` (`SupportUserId`)          | —                     |

Provider-native numeric IDs remain internal. Ticket is **never** mapped to Projects Task.

---

## Files created (primary)

- `packages/platform-service-contracts/src/domain/support.ts`
- `integrations/zammad/src/services/{zammad-core-services,zammad-operation-runner,support-service,organization-service,group-service,user-service,list-helpers}.ts`
- `integrations/zammad/src/mappers/*`
- `integrations/zammad/src/models/*`
- `integrations/zammad/src/validation/*`
- `integrations/zammad/src/capabilities/service-capabilities.ts`
- `integrations/zammad/src/internal/zammad-api-types.ts`
- `integrations/zammad/src/testing/mock-zammad-core-data.ts`
- `integrations/zammad/src/zammad-core-services.test.ts`
- `docs/sprint/OSS-102-03-completion-report.md`

## Files modified (primary)

- `integrations/zammad/src/{zammad-adapter,zammad-bootstrap,zammad-rest-client,index,testing/mock-zammad-api}.ts`
- `integrations/zammad/{package.json,integration.yaml,docs/ZAMMAD-ADAPTER.md}`
- `packages/platform-service-contracts` (identifiers, domain index, queries, inputs, version **0.3.0**)
- Foundation docs: CURRENT-STATE, CURRENT-MILESTONE, ACTIVE-BACKLOG, AI-CONTEXT, catalogues, README, CHANGELOG

---

## Tests

| Suite                                      | Result        |
| ------------------------------------------ | ------------- |
| `@apzhub/integration-zammad`               | **34 passed** |
| Plane + Zammad + contracts regression      | **141 passed**|
| Support / org / group / user lifecycles    | Covered       |
| Pagination / filter / sort / validation    | Covered       |
| Provider + auth failures / error translation | Covered     |
| Operation runner + capability registration | Covered       |

---

## Coverage

| Scope                                      | Lines (approx.) | Notes                          |
| ------------------------------------------ | --------------- | ------------------------------ |
| `integrations/zammad/src` package          | **~88.7%**      | Above 80% line gate            |
| Branches (package)                         | **~67%**        | Similar to OSS-102-02 TD note  |

---

## Quality gates

| Gate        | Result                                      |
| ----------- | ------------------------------------------- |
| Lint        | Pass (`@apzhub/integration-zammad`)         |
| Typecheck   | Pass (zammad + contracts)                   |
| Tests       | Pass (34 zammad; 141 regression subset)     |
| Coverage    | Package lines ~88.7%                        |
| Regressions | Plane suites green                          |

---

## Technical debt

| ID          | Note                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------- |
| TD-10203-01 | Branch coverage ~67% — response-validation / list-helpers edge paths lightly exercised        |
| TD-10203-02 | Provisional `*_zammad_*` IDs until MappingStore (platform milestone)                          |
| TD-10203-03 | Ticket create sends minimal internal article body required by Zammad API — not an article API |
| TD-10203-04 | State/priority catalogue uses CE defaults; live catalogue discovery deferred                  |

---

## Comparison against Plane Reference Adapter

| Concern              | Plane                                      | Zammad (OSS-102-03)                          |
| -------------------- | ------------------------------------------ | -------------------------------------------- |
| Core facade          | `PlaneCoreServices` / `adapter.core`       | `ZammadCoreServices` / `adapter.core`        |
| Operation runner     | `PlaneOperationRunner`                     | `ZammadOperationRunner`                      |
| REST client          | `PlaneRestClient` (internal)               | `ZammadRestClient` (internal)                |
| Canonical DTOs       | Contracts (Project/Task/…)                 | Contracts (SupportTicket/Org/Group/User)     |
| Provisional IDs      | `proj_plane_*`, `task_plane_*`             | `sreq_zammad_*`, …                           |
| Domain               | Projects                                   | Support (Ticket ≠ Task)                      |
| Scope this milestone | Full Wave 1 surface                        | Four core services only                      |

Structural parity maintained; domain types intentionally distinct.

---

## Recommendation for OSS-102-04

**Recommended scope (subject to owner approval):** Articles / Comments (messages) + optional attachment metadata — still adapter-only, no PlatformService/HTTP/UI. Extend mock API and register `articles` capability; keep sync/webhooks deferred.

**Do not start** without explicit owner approval.

---

## Stop condition

**Met.** Await explicit owner approval before OSS-102-04.
