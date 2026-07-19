# APZHUB-INTEGRATION-KIMAI-001 — Programme Acceptance Report

> **Programme:** APZHUB-INTEGRATION-KIMAI-001  
> **Title:** Kimai Integration Foundation  
> **Classification:** PLATFORM INTEGRATION  
> **Status:** **ACCEPTED / CLOSED** (Owner)  
> **Package:** `@apzhub/integration-kimai` **0.1.0**  
> **Certification:** [CERTIFICATION-REPORT](../../integrations/kimai/CERTIFICATION-REPORT.md)  
> **Follow-on:** [APZHUB-PLATFORM-TIME-001](./APZHUB-PLATFORM-TIME-001-programme-acceptance-report.md)

---

## Owner decision requested

Accept this programme as the reusable Kimai Integration Foundation on disk.

Acceptance means:

1. `@apzhub/integration-kimai` **0.1.0** is the platform Kimai adapter foundation.
2. APZ Time remains **Planning** — **not** Implementation Ready until TimeTrackingService + HTTP exist.
3. No APZ Time / Workbench / Time HTTP work is authorised by this acceptance alone.

---

## Scope confirmation

| In scope                                  | Delivered |
| ----------------------------------------- | --------- |
| Kimai Adapter foundation                  | Yes       |
| Auth / version / health / diagnostics     | Yes       |
| Error translation / metrics / logging     | Yes       |
| Capability + provider registration        | Yes       |
| Factory / bootstrap / mock                | Yes       |
| Compatibility / readiness / certification | Yes       |

| Out of scope                     | Present? |
| -------------------------------- | -------- |
| TimeTrackingService              | **No**   |
| Time HTTP / Workbench / APZ Time | **No**   |
| Integration SDK changes          | **No**   |
| Platform Services redesign       | **No**   |

---

## Validation summary

| Check                      | Result |
| -------------------------- | ------ |
| Repository tests (package) | PASS   |
| Architecture boundaries    | PASS   |
| SDK freeze held            | PASS   |
| APZ Time not started       | PASS   |

---

## STOP

Await explicit Owner Acceptance. Do not begin APZ Time.
