# APZHUB-ENG-0022 — Implementation Summary

> **Programme:** APZHUB-ENG-0022  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Scope:** QA-CERT-002 certification punch list only (Groups A–E)

## Preconditions verified

| Check                     | Result                                                      |
| ------------------------- | ----------------------------------------------------------- |
| APZHUB-ENG-0021           | **ACCEPTED** (Owner Decision)                               |
| Wave 2 remediation groups | **COMPLETE**                                                |
| QA-CERT-002               | Identified residual punch list (lint · Vitest · Playwright) |
| Authorisation             | Owner Programme Approval APZHUB-ENG-0022                    |

## Changes by group

### A — Lint

- `scripts/apzworkflow-001-workflow-foundation-audit.mjs` — remove useless regex escapes (`no-useless-escape`).

### B — Zammad capabilities

- Contract catalogue documents **11** core services (`support` … `synchronisation`).
- Updated `zammad-core-services.test.ts` expectation from 12 → **11**.

### C — Law API docs / health

- Repository architecture: endpoints live in **`apps/web`** (`/api/law/v1/openapi.*`, `/api/law/v1/health`, `/api/docs/guides/*`).
- No duplicate Law-suite-only surface introduced; routing unchanged.
- Playwright `law-api-developer-experience` **6/6 PASS**.

### D — Workbench navigation (platform root cause)

- `ViewEngine.resolveViewIdForRoute` now selects the **longest matching** registered view route (exact or prefix).
- Product deep links (`/workspace/projects/{id}`, `/workspace/analytics/dashboards/{id}`, `/workspace/time/timesheets/{id}`) activate the product workspace view so the shell sync effect no longer rewinds to Home.
- Overview (`/workspace/home/overview`) still wins over `/workspace/home` (longer match).
- Configuration locator: `getByRole('cell', { name: 'cfg_pw' })`.

### E — SPR-003 persistence

- Workbench manager flushes debounced Personalisation persist on disable; exposes `flushPendingPersist()`.
- Provider cleanup awaits flush before disable.
- Platform SessionStore throws on failed PUT.
- E2E waits for successful `PUT .../workbench-layout` after Overview selection (deterministic; no sleeps).

## Architecture / compatibility

| Gate                       | Result                                                               |
| -------------------------- | -------------------------------------------------------------------- |
| Platform Architecture      | Unchanged boundaries; shell uses Workbench Framework view resolution |
| Package Boundaries         | Fixes confined to authorised packages/scripts/tests                  |
| Domain Ownership           | Zammad catalogue unchanged; Law docs remain apps/web                 |
| Integration SDK Contracts  | Unchanged (capability count aligned to contract)                     |
| Platform Service Contracts | Unchanged                                                            |
| Database Compatibility     | Unchanged                                                            |
| Backward Compatibility     | Additive resolution behaviour; no API breaks                         |
| SemVer Compatibility       | No package version bumps required for punch-list hygiene             |

## Result

Punch list **complete**. Recommendation: **READY FOR FINAL PLATFORM CERTIFICATION**.
