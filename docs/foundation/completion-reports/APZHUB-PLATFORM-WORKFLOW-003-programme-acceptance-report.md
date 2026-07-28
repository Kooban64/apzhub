# APZHUB-PLATFORM-WORKFLOW-003 — Programme Acceptance Report

> **Programme:** APZHUB-PLATFORM-WORKFLOW-003  
> **Title:** Workflow Platform Contracts  
> **Classification:** PRODUCTION CODE  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** **CONTRACTS READY**  
> **Package:** `@apzhub/workflow-contracts` **0.4.1** (additive from **0.4.0**)  
> **Owner Acceptance:** 2026-07-19 — Owner Decision authorising APZHUB-PLATFORM-WORKFLOW-004 (Workflow Contracts are ACCEPTED)  
> **Completion:** [APZHUB-PLATFORM-WORKFLOW-003-completion-report.md](../../sprint/APZHUB-PLATFORM-WORKFLOW-003-completion-report.md)

---

## Owner decision

**ACCEPT** APZHUB-PLATFORM-WORKFLOW-003.

Acceptance means:

1. `@apzhub/workflow-contracts` **0.4.x** is the provider-neutral contract surface for Workflow Platform (canonical IM + retained SoR/engine baseline).
2. Workflow Platform Services proceed under **APZHUB-PLATFORM-WORKFLOW-004**.
3. HTTP / Workbench / commercial APZ Workflow remain **not** authorised by this acceptance alone.
4. Contracts must not grow n8n-specific public DTOs.

---

## Scope confirmation

| In scope                                | Delivered |
| --------------------------------------- | --------- |
| Canonical models (Owner list)           | Yes       |
| Service interfaces (no logic)           | Yes       |
| Permission catalogue + op mappings      | Yes       |
| Tests · docs · examples · compatibility | Yes       |

| Out of scope                                 | Present? |
| -------------------------------------------- | -------- |
| Workflow Platform Services                   | **No**   |
| HTTP APIs / Workbench / APZ Workflow product | **No**   |
| n8n DTOs in contracts                        | **No**   |

---

## Validation summary

| Check                           | Result   |
| ------------------------------- | -------- |
| Typecheck / lint / tests        | PASS (8) |
| Provider neutrality             | PASS     |
| Architecture (009 / ADR-0068)   | PASS     |
| Services not started            | PASS     |
| Additive SemVer (0.3.0 → 0.4.0) | PASS     |

---

## STOP

Await Owner Acceptance. Workflow Platform Services / HTTP / Workbench / commercial APZ Workflow still require separate named Owner Approval.
