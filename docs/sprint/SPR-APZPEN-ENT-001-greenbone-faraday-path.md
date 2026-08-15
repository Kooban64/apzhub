# SPR-APZPEN-ENT-001 — Greenbone + Faraday path (Kali runner only)

> **Status:** **AUTHORISED · IN PROGRESS** — 2026-08-15  
> **Parent:** [SPR-FULL-001](./SPR-FULL-001-full-product-bar-option-3.md) Track A2  
> **Authority:** [OWNER-FULL-PRODUCT-BAR-OPTION-3](../decisions/OWNER-FULL-PRODUCT-BAR-OPTION-3.md)  
> **Unparks:** Greenbone/Faraday from [APZPEN-ENTERPRISE-LATER-OPTIONS](../strategy/APZPEN-ENTERPRISE-LATER-OPTIONS.md) **for this scope only**  
> **Depends on:** APZPEN CE **COMPLETE** (SPR-APZPEN-014)  
> **Does not:** Kali UI module · QEP-owned scanners · auto-certify · WORM/SBOM/legal-hold (still parked)

## Outcome

APZPEN operates a **live Greenbone** vulnerability path and a **Faraday** (or equivalent OSS pen-test management) adapter path into engagements/findings/evidence. Kali remains a **pen-test cluster runner image** only.

## Ships

| ID        | Ship                 | Approach                                                                                       |
| --------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| ENT-001-A | Greenbone live       | Compose health + `GreenboneAdapter` (or existing host stack) → findings ingest into APZPEN SoR |
| ENT-001-B | Faraday path         | `integration.yaml` + FaradayAdapter → engagements/findings sync; CE/OSS first                  |
| ENT-001-C | Kali runner          | Document + verify Kali as cluster runner image only; no shell module                           |
| ENT-001-D | Operator UX          | APZPEN surfaces to trigger/monitor VA/pentest ingest; mask engine brands                       |
| ENT-001-E | Contracts for bridge | Stable assurance summary / finding export contract for SPR-BRIDGE-001                          |

## Acceptance

1. Operator can run/ingest Greenbone results into an APZPEN engagement without leaving APZHUB UX.
2. Faraday (or documented interim OSS aggregator) findings appear as APZPEN findings with audit.
3. No Kali/Greenbone/Faraday Activity Bar module under QEP.
4. Bridge contract published (OpenAPI or service interface) without QEP importing engine clients.
5. Never auto-certify from scan severity.

## Host note

Prefer existing `apztools/security` + `apzqep-greenbone` layout ([APZTOOLS-HOST-LAYOUT](../operations/APZTOOLS-HOST-LAYOUT.md)).

## Delivery record

_(in progress)_
