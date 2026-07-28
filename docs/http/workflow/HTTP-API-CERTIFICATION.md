# Workflow HTTP API — Certification Report

> **Programme:** APZHUB-PLATFORM-WORKFLOW-005  
> **Title:** Workflow HTTP API  
> **OpenAPI:** Platform HTTP API **1.12.0**  
> **Consumes:** `@apzhub/platform-services` **0.28.0** · `@apzhub/workflow-contracts` **0.4.2**  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** **HTTP API READY**

---

## Verdict

**CERTIFIED_WITH_LIMITATIONS** (filed — pending Owner Acceptance)

| Dimension                                                          | Result                                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Architecture (HTTP → `gateway.workflow.*` only)                    | **PASS**                                                                             |
| Analytics / Time HTTP pattern parity                               | **PASS**                                                                             |
| OpenAPI 3.1 documentation                                          | **PASS** (`pnpm openapi:validate:platform`)                                          |
| Zod validation                                                     | **PASS**                                                                             |
| Authorization via Request Pipeline + catalogue                     | **PASS**                                                                             |
| No `integration-n8n` imports in handlers/routes                    | **PASS**                                                                             |
| Health / readiness / capabilities                                  | **PASS**                                                                             |
| Definitions / runs / schedules / tasks / approvals / notifications | **PASS**                                                                             |
| Distinct from `/workflows` SoR and `/workflows/engine`             | **PASS**                                                                             |
| Commercial APZ Workflow product                                    | **ABSENT** (correct — out of scope; Workbench authorised separately as WORKFLOW-006) |
| Integration SDK freeze                                             | **PASS** (**1.0.0** unchanged)                                                       |

---

## Resources delivered

| Resource                          | Path prefix                                        |
| --------------------------------- | -------------------------------------------------- |
| Health / Readiness / Capabilities | `/api/v1/workflow/{health,readiness,capabilities}` |
| Definitions                       | `/api/v1/workflow/definitions`                     |
| Runs                              | `/api/v1/workflow/runs`                            |
| Schedules                         | `/api/v1/workflow/schedules`                       |
| Tasks                             | `/api/v1/workflow/tasks`                           |
| Approvals                         | `/api/v1/workflow/approvals`                       |
| Notifications                     | `/api/v1/workflow/notifications`                   |

---

## Explicit non-deliverables

Workbench · commercial APZ Workflow · n8n DTO leakage · provider execute unlock beyond CERTIFIED_FOUNDATION
