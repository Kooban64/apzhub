# APZHUB-PLATFORM-ANALYTICS-005 — Programme Acceptance Report

> **Programme:** APZHUB-PLATFORM-ANALYTICS-005  
> **Title:** Analytics HTTP API  
> **Classification:** PRODUCTION CODE  
> **Status:** **ACCEPTED / CLOSED**  
> **Implementation:** OpenAPI **1.11.0** · `/api/v1/analytics/*` · platform-services **0.28.0** · analytics-contracts **0.1.1**  
> **Completion:** [APZHUB-PLATFORM-ANALYTICS-005-completion-report.md](../../sprint/APZHUB-PLATFORM-ANALYTICS-005-completion-report.md)  
> **Certification:** [HTTP-API-CERTIFICATION.md](../../http/analytics/HTTP-API-CERTIFICATION.md)  
> **Accepted:** Owner Decision accompanying **APZHUB-PLATFORM-ANALYTICS-006** authorisation (2026-07-19) — “The Analytics HTTP API is ACCEPTED.”

---

## Owner decision

Accepted as the Analytics Platform HTTP API layer.

Acceptance means:

1. `/api/v1/analytics/*` is the canonical HTTP surface for Analytics Platform Services.
2. Further commercial product packaging / post-1.0 Analytics features remain **not** authorised by this acceptance alone (Workbench authorised separately as ANALYTICS-006).

---

## Scope confirmation

| In scope                                    | Delivered |
| ------------------------------------------- | --------- |
| Owner endpoint set                          | Yes       |
| AuthZ / validation / OpenAPI / tests / docs | Yes       |
| Services-only handler path                  | Yes       |

| Out of scope               | Present? |
| -------------------------- | -------- |
| Workbench Analytics Module | **No**   |
| APZ Analytics product      | **No**   |

---

## Prerequisites closed by Owner Decision (this authorisation)

| Programme                     | Status after Owner Decision                                                     |
| ----------------------------- | ------------------------------------------------------------------------------- |
| APZHUB-PLATFORM-ANALYTICS-004 | **ACCEPTED / CLOSED** (Owner Decision accompanying ANALYTICS-005 authorisation) |

---

## STOP

Await Owner Acceptance. Do not start Workbench or APZ Analytics without named Approval.
