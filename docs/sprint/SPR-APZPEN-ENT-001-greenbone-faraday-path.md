# SPR-APZPEN-ENT-001 — Greenbone + Faraday path (Kali runner only)

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Parent:** [SPR-FULL-001](./SPR-FULL-001-full-product-bar-option-3.md) Track A2  
> **Authority:** [OWNER-FULL-PRODUCT-BAR-OPTION-3](../decisions/OWNER-FULL-PRODUCT-BAR-OPTION-3.md)  
> **Unparks:** Greenbone/Faraday from [APZPEN-ENTERPRISE-LATER-OPTIONS](../strategy/APZPEN-ENTERPRISE-LATER-OPTIONS.md) **for this scope only**  
> **Depends on:** APZPEN CE **COMPLETE** (SPR-APZPEN-014)  
> **Does not:** Kali UI module · QEP-owned scanners · auto-certify · WORM/SBOM/legal-hold (still parked) · full GMP API client (deferred — artefact path authorised)

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

| ID            | Ship             | Progress (2026-08-15)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ENT-001-A** | Greenbone live   | **Advanced** — Catalogue `ingest_ready` (dispatchable false); notes: operator scan → artefact ingest; GMP deferred. `greenbone-artefact.ts` lists/reads under `{APZTOOLS_ROOT\|~/apztools}/security/out/greenbone` safely. `GET /api/v1/apzpen/providers/greenbone/artefacts`. Optional path ingest when `APZPEN_GREENBONE_ARTEFACT_INGEST=true` via engagement ingest `fromArtefactPath`/`artefactPath` → `normalizeGreenboneSimplified`. Host README documents APZHUB path. Prior: `@apzhub/integration-greenbone` normalize + UI probe.                                                                                                                    |
| **ENT-001-B** | Faraday path     | **Advanced** — Artefact path landed: `faraday-artefact.ts` lists/reads under `{APZTOOLS_ROOT\|~/apztools}/security/out/faraday` (`faraday-findings.json`, `*-findings.json`, `vulns.json`). `GET /api/v1/apzpen/providers/faraday/artefacts`. Optional path ingest when `APZPEN_FARADAY_ARTEFACT_INGEST=true` via engagement ingest `fromArtefactPath`/`artefactPath` (path root or `toolId`) → `normalizeFaradayPayload`. Compose scaffold docs: `infrastructure/docker/clusters/faraday/` (profile-gated, optional / Owner-enabled; primary path = export → ingest + `FARADAY_URL` probe). Prior: `@apzhub/integration-faraday` + catalogue `ingest_ready`. |
| **ENT-001-C** | Kali runner      | **Unchanged / documented** — Kali remains cluster runner image only (`provider-catalogue` + PENTEST-CLUSTER); no Kali UI / QEP module in this slice.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **ENT-001-D** | Operator UX      | **Done this slice** — Engagement Provider ingest preselects via `?tool=` / `?format=` (greenbone→simplified, faraday→auto                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | format). Mild VA / Security Ops copy. Providers table: Ingest artefact links to engagement detail (or engagements list) with query. No QEP Faraday/Greenbone modules. |
| ENT-001-E     | Bridge contracts | Not started (BRIDGE attaches Greenbone freshness via APZPEN lib — see SPR-BRIDGE-001).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

### First-slice artefacts

- `integrations/greenbone/` — package + `integration.yaml` (status `in_progress`, capabilities `health` + `findings_normalize`, `engineBranding: hidden`, `product: apzpen`)
- `integrations/faraday/` — same shape
- `apps/web/lib/apzpen/provider-catalogue.ts` — Faraday provider; Greenbone → `ingest_ready`
- `apps/web/lib/apzpen/greenbone-artefact.ts` — safe list/read of findings artefacts
- `apps/web/lib/apzpen/faraday-artefact.ts` — safe list/read of Faraday findings / vulns artefacts
- `apps/web/app/api/v1/apzpen/providers/greenbone/artefacts/route.ts` — GET latest artefacts
- `apps/web/app/api/v1/apzpen/providers/faraday/artefacts/route.ts` — GET latest Faraday artefacts
- `apps/web/app/api/v1/apzpen/engagements/[engagementId]/ingest/route.ts` — optional `fromArtefactPath` for Greenbone and Faraday when env enabled
- `apps/web/lib/apzpen/provider-health.ts` — Greenbone UI probe + Faraday row
- `apps/web/lib/apzpen/provider-ingest.ts` — optional wire to integration normalize helpers
- `apps/web/components/apzpen/apzpen-pages.tsx` — Provider ingest query preselect + Providers “Ingest artefact” links (ENT-001-D)
- `infrastructure/docker/clusters/greenbone/README.md` — APZHUB path: scan → artefacts → ingest
- `infrastructure/docker/clusters/faraday/README.md` + profile-gated `docker-compose.yml` — optional CE scaffold; artefact ingest primary
