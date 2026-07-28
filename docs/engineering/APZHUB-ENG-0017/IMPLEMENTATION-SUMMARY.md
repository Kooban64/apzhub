# APZHUB-ENG-0017 — Implementation Summary

> **Programme:** APZHUB-ENG-0017  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Group:** RG-CERT-PIN-DRIFT

## Preconditions verified

| Check                        | Result                        |
| ---------------------------- | ----------------------------- |
| APZHUB-ENG-0016              | **ACCEPTED** (Owner Decision) |
| ENGINEERING-PLAN Step 2      | RG-CERT-PIN-DRIFT             |
| Group repository-approved    | Yes                           |
| Status before implementation | **OPEN**                      |
| Dependencies                 | None                          |

## STEP 2 — Group contract

| Field                      | Value                                                                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identifier                 | RG-CERT-PIN-DRIFT                                                                                                                                                                  |
| Title                      | Certification SemVer / OpenAPI pin refresh                                                                                                                                         |
| Root cause                 | RCA-02 — frozen certification / wave audits lagged Platform **1.2.0** catalogue                                                                                                    |
| Included failures          | QA2-V-001…050 (**50** Vitest)                                                                                                                                                      |
| Affected packages          | `testing/*` certification suites · `scripts/*-audit.mjs` · `apps/web` handler OpenAPI pins · `@apzhub/platform-services` version constant alignment · Zammad capability count pins |
| Affected products          | Platform (cross-cutting quality gates) · APZ Support (Zammad adapter pin) · APZ Workflow (contracts pin)                                                                           |
| Affected platform services | N/A (test/audit pin hygiene; `PLATFORM_SERVICES_VERSION` constant aligned to package **0.30.0**)                                                                                   |
| Dependencies               | None                                                                                                                                                                               |
| Acceptance criteria        | Pin-scope certification Vitest suites green; OpenAPI allowlists accept **1.12.0**; SemVer pins match live package.json                                                             |
| Architecture impact        | None — freeze audits updated to catalogue; SoR n8n scan excludes engine `n8n-ops-provider` (APZWORKFLOW-007 track)                                                                 |
| SemVer impact              | None — no package.json bumps; constant aligned to existing **0.30.0**                                                                                                              |
| Est. reduction             | **50** Vitest                                                                                                                                                                      |

## Changes (summary)

1. Refreshed frozen pins: `platform-services` **0.30.0**, `platform-service-contracts` **0.18.0**, `workflow-contracts` **0.4.2**, `integration-zammad` **0.8.0**.
2. OpenAPI allowlists / regexes include **1.11.0** / **1.12.0**.
3. Aligned `PLATFORM_SERVICES_VERSION` constant **0.28.0 → 0.30.0** with package.json.
4. Zammad certification capability count **11 → 12**.
5. Tightened workflow SoR n8n-import audits to exclude local/engine ops provider façade.
6. Retained Integration SDK **1.0.0** / Architecture Frozen marker in CURRENT-MILESTONE (OSS-100-11 audit).

## Result

RG-CERT-PIN-DRIFT **implemented**. Recommendation: **READY FOR OWNER ACCEPTANCE**.
