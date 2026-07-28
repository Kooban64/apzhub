# APZHUB-PLATFORM-WORKFLOW-004 — Programme Acceptance Report

> **Programme:** APZHUB-PLATFORM-WORKFLOW-004  
> **Title:** Workflow Platform Services  
> **Classification:** PRODUCTION CODE  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** **SERVICES READY**  
> **Owner Acceptance:** 2026-07-19 — Owner Decision authorising APZHUB-PLATFORM-WORKFLOW-005 (Workflow Platform Services are ACCEPTED)  
> **Completion:** [APZHUB-PLATFORM-WORKFLOW-004-completion-report.md](../../sprint/APZHUB-PLATFORM-WORKFLOW-004-completion-report.md)

---

## Owner decision

**ACCEPT** APZHUB-PLATFORM-WORKFLOW-004.

Acceptance means:

1. Workflow Platform Services on `gateway.workflow` are the orchestration surface for HTTP / future Workbench.
2. Workbench / commercial APZ Workflow remain **not** authorised by this acceptance alone (HTTP authorised separately as WORKFLOW-005).
3. n8n execute remains limited per CERTIFIED_FOUNDATION until a separate integration unlock.
4. Services consume only provider-neutral contracts.

---

## Scope confirmation

| In scope                          | Delivered |
| --------------------------------- | --------- |
| Owner-listed service impls        | Yes       |
| `gateway.workflow` runtime facets | Yes       |
| AuthZ + pipeline                  | Yes       |
| Tests · docs · compatibility      | Yes       |

| Out of scope (at 004 close) | Present? |
| --------------------------- | -------- |
| Workflow Workbench          | **No**   |
| Commercial APZ Workflow     | **No**   |
| n8n DTO leakage             | **No**   |

---

## Validation summary

| Check                    | Result |
| ------------------------ | ------ |
| Typecheck / lint / tests | PASS   |
| Provider neutrality      | PASS   |
| Architecture (009)       | PASS   |

---

## Follow-on

Workflow HTTP API proceeds under **APZHUB-PLATFORM-WORKFLOW-005** (separate programme).
