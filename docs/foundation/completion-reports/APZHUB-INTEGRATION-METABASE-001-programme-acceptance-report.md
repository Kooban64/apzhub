# APZHUB-INTEGRATION-METABASE-001 — Programme Acceptance Report

> **Programme:** APZHUB-INTEGRATION-METABASE-001  
> **Title:** Metabase Integration Foundation  
> **Classification:** PRODUCTION CODE  
> **Status:** **ACCEPTED / CLOSED**  
> **Package:** `@apzhub/integration-metabase` **0.1.0**  
> **Certification:** [CERTIFICATION-REPORT](../../integrations/metabase/CERTIFICATION-REPORT.md) — **CERTIFIED_FOUNDATION**  
> **Date accepted:** 2026-07-19 — Owner Decision (APZHUB-PLATFORM-ANALYTICS-003 authorisation: Metabase Foundation CERTIFIED)  
> **Completion:** [APZHUB-INTEGRATION-METABASE-001-completion-report.md](../../sprint/APZHUB-INTEGRATION-METABASE-001-completion-report.md)

---

## Owner decision

**ACCEPT** APZHUB-INTEGRATION-METABASE-001.

Acceptance means:

1. `@apzhub/integration-metabase` **0.1.0** is the platform Metabase adapter foundation (**CERTIFIED_FOUNDATION**).
2. Analytics Platform Contracts were separately authorised as **APZHUB-PLATFORM-ANALYTICS-003**.
3. Analytics Platform Services / HTTP / Workbench / APZ Analytics remain **not** authorised by this acceptance alone.
4. Integration SDK **1.0.0** freeze held.

---

## Scope confirmation

| In scope                                       | Delivered |
| ---------------------------------------------- | --------- |
| MetabaseAdapter · MetabaseClient               | Yes       |
| Auth / connection / health / diagnostics       | Yes       |
| Version / capability detection                 | Yes       |
| Error translation / metrics / logging          | Yes       |
| Readiness / capability / provider registration | Yes       |
| Mock provider · tests · docs · certification   | Yes       |

| Out of scope                          | Present? |
| ------------------------------------- | -------- |
| Analytics Contracts                   | **No**   |
| Analytics Platform Services           | **No**   |
| HTTP APIs / Workbench / APZ Analytics | **No**   |
| Integration SDK changes               | **No**   |

---

## Validation summary

| Check                                 | Result                   |
| ------------------------------------- | ------------------------ |
| Package typecheck / lint / tests      | PASS (15)                |
| Architecture boundaries (008/009/026) | PASS                     |
| SDK freeze held                       | PASS                     |
| Analytics product not started         | PASS                     |
| Certification recommendation          | **CERTIFIED_FOUNDATION** |

---

## STOP

Accepted. Analytics Platform Services / HTTP / Workbench / APZ Analytics still require separate named Owner Approval (see APZHUB-PLATFORM-ANALYTICS-003).
