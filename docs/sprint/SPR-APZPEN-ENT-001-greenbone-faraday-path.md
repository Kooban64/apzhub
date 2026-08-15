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

| ID            | Ship             | Progress (2026-08-15)                                                                                                                                                                                                                                                                                                         |
| ------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ENT-001-A** | Greenbone live   | **In progress** — `@apzhub/integration-greenbone` (`integrations/greenbone/`): `normalizeGreenboneSimplified`, `probeGreenboneHealth` (UI `:9392` / `GREENBONE_UI_URL`). Catalogue notes + provider-health probe wired. Ingest uses integration normalize for `toolId: greenbone`. Host compose `apzqep-greenbone` unchanged. |
| **ENT-001-B** | Faraday path     | **In progress** — `@apzhub/integration-faraday` (`integrations/faraday/`): `normalizeFaradayPayload` (`vulns` or simplified findings), health returns planned/`compose not deployed — ingest via artefact` unless `FARADAY_URL`. Catalogue row `faraday` (`ingest_ready`, Specialist, not dispatchable).                      |
| **ENT-001-C** | Kali runner      | **Unchanged / documented** — Kali remains cluster runner image only (`provider-catalogue` + PENTEST-CLUSTER); no Kali UI / QEP module in this slice.                                                                                                                                                                          |
| ENT-001-D     | Operator UX      | Not started this slice (catalogue + health rows only).                                                                                                                                                                                                                                                                        |
| ENT-001-E     | Bridge contracts | Not started.                                                                                                                                                                                                                                                                                                                  |

### First-slice artefacts

- `integrations/greenbone/` — package + `integration.yaml` (status `in_progress`, capabilities `health` + `findings_normalize`, `engineBranding: hidden`, `product: apzpen`)
- `integrations/faraday/` — same shape
- `apps/web/lib/apzpen/provider-catalogue.ts` — Faraday provider; Greenbone notes → normalize path
- `apps/web/lib/apzpen/provider-health.ts` — Greenbone UI probe + Faraday row
- `apps/web/lib/apzpen/provider-ingest.ts` — optional wire to integration normalize helpers
