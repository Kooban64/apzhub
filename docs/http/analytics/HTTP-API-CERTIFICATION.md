# Analytics HTTP API — Certification Report

> **Programme:** APZHUB-PLATFORM-ANALYTICS-005  
> **Title:** Analytics HTTP API  
> **OpenAPI:** Platform HTTP API **1.11.0**  
> **Consumes:** `@apzhub/platform-services` **0.28.0** · `@apzhub/analytics-contracts` **0.1.1**  
> **Status:** **ACCEPTED / CLOSED**

---

## Verdict

**CERTIFIED_WITH_LIMITATIONS** (filed — pending Owner Acceptance)

| Dimension                                    | Result                                      |
| -------------------------------------------- | ------------------------------------------- |
| Architecture (HTTP → Platform Services only) | **PASS**                                    |
| Time / Projects HTTP pattern parity          | **PASS**                                    |
| OpenAPI 3.1 documentation                    | **PASS** (`pnpm openapi:validate:platform`) |
| Zod validation                               | **PASS**                                    |
| Authorization via request pipeline           | **PASS**                                    |
| No Metabase imports in handlers/routes       | **PASS**                                    |
| Health / readiness / capabilities            | **PASS**                                    |
| Catalogue / datasets / reports / saved CRUD  | **PASS** (saved DELETE = archive)           |
| Workbench / APZ Analytics product            | **ABSENT** (correct — out of scope)         |
| Integration SDK freeze                       | **PASS** (**1.0.0** unchanged)              |

---

## Resources delivered

| Resource                          | Path prefix                                         |
| --------------------------------- | --------------------------------------------------- |
| Health / Readiness / Capabilities | `/api/v1/analytics/{health,readiness,capabilities}` |
| Dashboards                        | `/api/v1/analytics/dashboards`                      |
| Categories                        | `/api/v1/analytics/categories`                      |
| Datasets                          | `/api/v1/analytics/datasets`                        |
| Reports                           | `/api/v1/analytics/reports`                         |
| Saved dashboards                  | `/api/v1/analytics/saved`                           |

---

## Explicit non-deliverables

Workbench · React Analytics module · APZ Analytics product · Metabase DTO leakage · registry Postgres SoR redesign
