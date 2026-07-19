# APZ Time 1.0 — Recommended Phase 1 Scope

> **Programme:** APZHUB-TIME-READINESS-002  
> **Classification:** DOCUMENTATION ONLY — recommendation  
> **Prerequisite:** APZ Time **Implementation Ready** ([Decision](./APZ-TIME-IMPLEMENTATION-READY-DECISION.md))  
> **Authority:** Repository evidence only — Kimai **0.2.0** CERTIFIED_DOMAIN · Time services · Time HTTP  
> **Status:** Recommendation — **does not authorise implementation**  
> **Date:** 2026-07-19

---

## Purpose

Recommended Release **1.0 Phase 1** product scope for a future Owner-approved programme, following the Projects reference pattern: Workbench productisation on an already-certified HTTP → Platform Service → Kimai path.

---

## In scope (Phase 1)

| Capability                      | Repository evidence                                                                                                   | Notes                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Core Time Tracking**          | Kimai timesheets / time entries domain · `gateway.time.*` · `/api/v1/time/timesheets` · `/api/v1/time/entries`        | Primary vertical                                                                        |
| **Timesheet Management**        | Same domain + HTTP list/create/update/stop patterns                                                                   | CRUD against Kimai SoR                                                                  |
| **Basic Activities**            | Kimai activities CE · `/api/v1/time/activities`                                                                       | Basic list/detail/create/update as HTTP allows                                          |
| **Basic Customers**             | Kimai customers CE · `/api/v1/time/customers`                                                                         | Basic surfaces only                                                                     |
| **Basic Tags**                  | Kimai tags CE · `/api/v1/time/tags`                                                                                   | Tags search **PARTIAL** — respect CE variance                                           |
| **Workbench shell integration** | Workbench framework · module manifest pattern (`services/*/manifests/*/module.yaml`) · Projects/Support client layout | Module + Activity Bar + workspace routes; typed client under `apps/web/lib/time`        |
| **Health**                      | `/api/v1/time/health` + Kimai ops health                                                                              | Surface in product/ops posture                                                          |
| **Diagnostics**                 | `/api/v1/time/diagnostics`                                                                                            | Permission-gated ops view as appropriate                                                |
| **Audit**                       | Platform request pipeline + service-side audit patterns                                                               | Product mutations via Platform Services only; no module-side notify                     |
| **Search**                      | Foundation `/api/v1/time/search` composition                                                                          | Phase 1 may consume foundation search; full Platform Search SoR provider optional later |

### Workbench prerequisites (stack — already available)

- Workbench Framework / Design System / shell
- Platform AuthN/AuthZ (`time.*` catalogue)
- Time HTTP OpenAPI **1.10.0**
- Kimai domain adapter **0.2.0**

---

## Explicitly out of Phase 1

Do **not** recommend or invent beyond repository evidence:

| Excluded                                | Reason                                   |
| --------------------------------------- | ---------------------------------------- |
| Approvals workflow                      | Not certified on Kimai path / product    |
| Reporting UI / exports                  | Reporting foundation only; no product UI |
| Analytics                               | No Metabase / Analytics product path     |
| Notifications product surfaces          | Not Time productised                     |
| Platform Search SoR publication adapter | Absent (`search-time`); optional later   |
| Time Platform Services redesign         | Frozen ACCEPTED layer                    |
| Time HTTP redesign                      | Frozen ACCEPTED layer                    |
| Integration SDK changes                 | **1.0.0** Architecture Frozen            |
| In-memory domain as Production SoR      | Test-only                                |

---

## Delivery pattern (reference)

```text
Owner Approval of named programme
  → Sprint Guide
  → module.yaml (enabled) + permissions + nav
  → apps/web/lib/time + components/time Workbench
  → consume /api/v1/time/* only
  → Playwright product certification
  → Acceptance
```

Mirror: [APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION](../../products/APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md).

---

## Success criteria (recommended)

1. Users can log and manage timesheets via APZHUB Workbench against Kimai SoR.
2. Basic activities, customers, and tags usable within certified CE limits.
3. Health / diagnostics visible under platform authz.
4. Audit trail via Platform Services path.
5. Search usable at least via foundation Time search composition.
6. No Module → Connector bypass; no engine brand names in UI.
7. Repository quality gates held (QA-002 PRODUCTION READY).

---

## STOP

This document is a **recommendation only**. Do not implement until Owner Approval of a **named** programme.
