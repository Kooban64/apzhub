# APZHUB-PLATFORM-ANALYTICS-004 — Programme Acceptance Report

> **Programme:** APZHUB-PLATFORM-ANALYTICS-004  
> **Title:** Analytics Platform Services  
> **Classification:** PRODUCTION CODE  
> **Status:** **ACCEPTED / CLOSED**  
> **Implementation:** `@apzhub/platform-services` **0.27.0** (services delivery; subsequent **0.28.0** additive for HTTP readiness) · `services/analytics/service.yaml` **0.1.0**  
> **Completion:** [APZHUB-PLATFORM-ANALYTICS-004-completion-report.md](../../sprint/APZHUB-PLATFORM-ANALYTICS-004-completion-report.md)  
> **Accepted:** Owner Decision accompanying **APZHUB-PLATFORM-ANALYTICS-005** authorisation (2026-07-19) — “Analytics Platform Services are ACCEPTED.”

---

## Owner decision

Accepted as the Analytics Platform Services layer.

Acceptance means:

1. Analytics Platform Services **0.1.0** (manifest) / platform-services Analytics surface are the canonical service implementations.
2. Workbench / APZ Analytics remain **not** authorised by this acceptance alone (HTTP authorised separately as ANALYTICS-005).

---

## Scope confirmation

| In scope                                   | Delivered |
| ------------------------------------------ | --------- |
| All `*ServiceImpl` ports                   | Yes       |
| Metabase provider integration              | Yes       |
| AuthZ / health / readiness / registry      | Yes       |
| Tests · docs · compatibility · limitations | Yes       |

| Out of scope              | Present? |
| ------------------------- | -------- |
| Analytics HTTP APIs       | **No**   |
| Workbench / APZ Analytics | **No**   |

---

## STOP

Await explicit Owner Acceptance.
