# SPR-BRIDGE-001 — QEP ↔ APZPEN assurance bridge

> **Status:** **AUTHORISED · IN PROGRESS** — 2026-08-15  
> **Parent:** [SPR-FULL-001](./SPR-FULL-001-full-product-bar-option-3.md) Track A3  
> **Authority:** [OWNER-FULL-PRODUCT-BAR-OPTION-3](../decisions/OWNER-FULL-PRODUCT-BAR-OPTION-3.md)  
> **Depends on:** APZPEN CE + ENT-001 contracts (can stub contract first); QEP readiness/cert (210)  
> **Does not:** Merge pillars · QEP calling Greenbone/Faraday · auto GO from security findings

## Outcome

Release Readiness / Certification in **APZQEP** can show **security assurance signals** sourced from **APZPEN** (engagement status, open critical findings, cert/assurance summary) via Platform Services — one client API, permission-filtered.

## Ships

| ID       | Ship            | Approach                                                                                            |
| -------- | --------------- | --------------------------------------------------------------------------------------------------- |
| BR-001-A | Contract        | Platform Service interface: assurance summary by project/change/engagement ref                      |
| BR-001-B | APZPEN provider | APZPEN implements summary from SoR (findings, engagement, optional Greenbone/Faraday freshness)     |
| BR-001-C | QEP consumer    | Readiness + Home/RCC show bridged security posture; deep-link to APZPEN when entitled               |
| BR-001-D | AuthZ           | Product entitlements: QEP sees summaries only if tenant entitled to both (or explicit bridge grant) |
| BR-001-E | Audit           | Bridge reads audited; no silent elevation                                                           |

## Acceptance

1. QEP module code never imports Faraday/Greenbone clients or APZPEN adapter packages — only Platform Service APIs.
2. Readiness shows honest security section (healthy / degraded / unavailable / not entitled).
3. Deep link to APZPEN engagement works when user has APZPEN product access.
4. Scanners never flip QEP certification to GO.
5. Tests cover deny paths and empty APZPEN tenants.

## Delivery record

_(in progress)_
