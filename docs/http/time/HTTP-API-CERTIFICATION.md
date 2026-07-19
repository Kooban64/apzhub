# Time HTTP API — Certification Report

> **Programme:** APZHUB-TIME-HTTP-001  
> **Title:** Canonical Time HTTP API  
> **OpenAPI:** Platform HTTP API **1.10.0**  
> **Consumes:** `@apzhub/platform-services` **0.26.0** · contracts **0.17.0**  
> **Status:** **ACCEPTED / CLOSED** (Owner 2026-07-19)

---

## Verdict

**CERTIFIED_WITH_LIMITATIONS**

| Dimension                                    | Result                                                                                                   |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Architecture (HTTP → Platform Services only) | **PASS**                                                                                                 |
| Projects HTTP pattern parity                 | **PASS**                                                                                                 |
| OpenAPI 3.1 documentation                    | **PASS** (`pnpm openapi:validate:platform`)                                                              |
| Zod validation                               | **PASS**                                                                                                 |
| Authorization via request pipeline           | **PASS**                                                                                                 |
| Error mapping (incl. 501 unsupported)        | **PASS**                                                                                                 |
| Health / diagnostics / readiness             | **PASS**                                                                                                 |
| Domain CRUD with in-memory test provider     | **PASS**                                                                                                 |
| Domain CRUD with Kimai **0.2.0**             | **Updated by KIMAI-002** — production Kimai domain path no longer foundation-only; HTTP routes unchanged |
| Workbench / APZ Time product                 | **ABSENT** (correct — out of scope)                                                                      |
| Time Platform Services package freeze        | **PASS** (0.26.0 unchanged)                                                                              |
| Integration SDK freeze                       | **PASS** (**1.0.0** unchanged)                                                                           |
| Time HTTP surface                            | **PASS** — routes/OpenAPI **1.10.0** unchanged by KIMAI-002                                              |

---

## Resources delivered

| Resource                                                        | Path prefix                           |
| --------------------------------------------------------------- | ------------------------------------- |
| Timesheets                                                      | `/api/v1/time/timesheets`             |
| Time Entries (alias)                                            | `/api/v1/time/entries`                |
| Activities                                                      | `/api/v1/time/activities`             |
| Customers                                                       | `/api/v1/time/customers`              |
| Time Projects                                                   | `/api/v1/time/projects`               |
| Tags                                                            | `/api/v1/time/tags`                   |
| Reporting (foundation)                                          | `/api/v1/time/reporting/*`            |
| Search (foundation composition)                                 | `/api/v1/time/search`                 |
| Health / Diagnostics / Capabilities / Readiness / Compatibility | `/api/v1/time/{health,diagnostics,…}` |
| Connection test                                                 | `POST /api/v1/time/connection/test`   |

## Enablement

- `APZHUB_TIME_ENABLED=true`
- Production: `KIMAI_INTEGRATION_ENABLED=true` (+ Kimai env)
- Non-production optional: `APZHUB_TIME_DOMAIN_MODE=in_memory`

## Explicit non-deliverables

Workbench · React · APZ Time product · Approvals · Notifications · Reporting UI · Analytics · Exports · Kimai adapter changes · Platform Service redesign · Integration SDK changes
