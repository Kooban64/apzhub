# APZWORKFLOW-011 — Quality Evidence

**Date:** 2026-07-16  
**Nature:** Closeout evidence consolidation (no new product tests required)

## Audits

| Command | Result |
| ------- | ------ |
| `pnpm audit:workflow-foundation` … `audit:workflow-vertical` | PASS (SoR; 005 scoped to SoR paths) |
| `pnpm audit:workflow-n8n-adapter` … `audit:workflow-engine-vertical` | PASS |
| `pnpm audit:workflow-engine-wave` | PASS |
| `pnpm openapi:validate:platform` | PASS |

## Regression history (retained)

| Suite | Role |
| ----- | ---- |
| `testing/workflow-vertical` | SoR certification harness |
| `testing/workflow-engine-vertical` | Engine certification harness |
| Workbench / client / handler Vitest suites | Layer regressions |
| Playwright mock `apzworkflow-009-*` | Engine Workbench mock E2E (live LIMITED) |

## Coverage baselines (prior)

- SoR: APZWORKFLOW-005 Coverage Baseline  
- Engine Workbench: APZWORKFLOW-009 (≥95% lines/functions)  
- Engine HTTP/client/services: APZWORKFLOW-008 / 007 / 010 consolidated baselines  

## Certification defects corrected in 011

1. **001** — allow `workflow-contracts` **0.3.0** (sanctioned by 007)  
2. **005** — exclude engine-track paths from SoR scans; update frozen version pins to 0.3.0 / 0.20.0  
3. **SoR Vitest harness** — `testing/workflow-vertical` version expectations aligned to frozen packages  

No product behaviour changes.
