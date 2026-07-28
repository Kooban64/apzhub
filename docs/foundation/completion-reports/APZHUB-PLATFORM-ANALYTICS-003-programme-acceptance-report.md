# APZHUB-PLATFORM-ANALYTICS-003 — Programme Acceptance Report

> **Programme:** APZHUB-PLATFORM-ANALYTICS-003  
> **Title:** Analytics Platform Contracts  
> **Classification:** PRODUCTION CODE  
> **Status:** **ACCEPTED / CLOSED**  
> **Package:** `@apzhub/analytics-contracts` **0.1.0**  
> **Date accepted:** 2026-07-19 — Owner Decision (APZHUB-PLATFORM-ANALYTICS-004 authorisation: Contracts v0.1.0 ACCEPTED)  
> **Completion:** [APZHUB-PLATFORM-ANALYTICS-003-completion-report.md](../../sprint/APZHUB-PLATFORM-ANALYTICS-003-completion-report.md)

---

## Owner decision

**ACCEPT** APZHUB-PLATFORM-ANALYTICS-003.

Acceptance means:

1. `@apzhub/analytics-contracts` **0.1.0** is the provider-neutral contract surface for Analytics.
2. Analytics Platform Services were separately authorised as **APZHUB-PLATFORM-ANALYTICS-004**.
3. HTTP / Workbench / APZ Analytics remain **not** authorised by this acceptance alone.
4. Contracts must not grow Metabase-specific public DTOs.

---

## Scope confirmation

| In scope                                | Delivered |
| --------------------------------------- | --------- |
| Canonical models (Owner list)           | Yes       |
| Service interfaces (no logic)           | Yes       |
| Permission catalogue                    | Yes       |
| Tests · docs · examples · compatibility | Yes       |

| Out of scope                          | Present? |
| ------------------------------------- | -------- |
| Analytics Platform Services           | **No**   |
| HTTP APIs / Workbench / APZ Analytics | **No**   |
| Metabase DTOs in contracts            | **No**   |

---

## Validation summary

| Check                         | Result   |
| ----------------------------- | -------- |
| Typecheck / lint / tests      | PASS (7) |
| Provider neutrality           | PASS     |
| Architecture (009 / ADR-0066) | PASS     |
| Services not started          | PASS     |

---

## STOP

Accepted. Analytics HTTP / Workbench / APZ Analytics still require separate named Owner Approval (see APZHUB-PLATFORM-ANALYTICS-004).
