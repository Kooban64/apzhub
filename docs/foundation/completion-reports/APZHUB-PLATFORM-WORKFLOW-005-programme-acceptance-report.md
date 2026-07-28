# APZHUB-PLATFORM-WORKFLOW-005 — Programme Acceptance Report

> **Programme:** APZHUB-PLATFORM-WORKFLOW-005  
> **Title:** Workflow HTTP API  
> **Classification:** PRODUCTION CODE  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** **HTTP API READY**  
> **Implementation:** OpenAPI **1.12.0** · `/api/v1/workflow/*` · platform-services **0.28.0** · workflow-contracts **0.4.2**  
> **Owner Acceptance:** 2026-07-19 — Owner Decision authorising APZHUB-PLATFORM-WORKFLOW-006 (The Workflow HTTP API is ACCEPTED)  
> **Completion:** [APZHUB-PLATFORM-WORKFLOW-005-completion-report.md](../../sprint/APZHUB-PLATFORM-WORKFLOW-005-completion-report.md)  
> **Certification:** [HTTP-API-CERTIFICATION.md](../../http/workflow/HTTP-API-CERTIFICATION.md)

---

## Owner decision

**ACCEPT** APZHUB-PLATFORM-WORKFLOW-005.

Acceptance means:

1. `/api/v1/workflow/*` is the canonical HTTP surface for Workflow Platform Services (`gateway.workflow.*`).
2. Workbench authorised separately as WORKFLOW-006; commercial APZ Workflow remains **not** authorised by this acceptance alone.
3. Handlers remain provider-neutral — no direct `integration-n8n` or provider DTOs.

---

## Scope confirmation

| In scope                                    | Delivered |
| ------------------------------------------- | --------- |
| Owner endpoint set                          | Yes       |
| AuthZ / validation / OpenAPI / tests / docs | Yes       |
| Services-only handler path                  | Yes       |

| Out of scope (at 005 close) | Present? |
| --------------------------- | -------- |
| Commercial APZ Workflow     | **No**   |
| n8n DTO leakage             | **No**   |

---

## Follow-on

Workflow Workbench Module proceeds under **APZHUB-PLATFORM-WORKFLOW-006** (separate programme).
