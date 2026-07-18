# APZMETRICS-005 — Quality Evidence Pack

**Date:** 2026-07-18  
**Milestone:** Metrics Vertical Certification

## Audits

| Command                                | Result |
| -------------------------------------- | ------ |
| `pnpm audit:metrics-foundation`        | PASS   |
| `pnpm audit:metrics-platform-services` | PASS   |
| `pnpm audit:metrics-http-client`       | PASS   |
| `pnpm audit:metrics-workbench`         | PASS   |
| `pnpm audit:metrics-vertical`          | PASS   |
| `pnpm certify:metrics-vertical`        | PASS   |
| `pnpm openapi:validate:platform`       | PASS   |

## Harness

| Suite                                                           | Result                                                          |
| --------------------------------------------------------------- | --------------------------------------------------------------- |
| `testing/metrics-vertical/apzmetrics-005-certification.test.ts` | PASS — Journeys 1–10                                            |
| Layer harnesses 001–004                                         | PASS                                                            |
| Playwright Metrics Workbench spec                               | LIMITED — listed; mock-routed; live webServer external conflict |

## Versions

| Package                       | Version |
| ----------------------------- | ------- |
| `@apzhub/metrics-contracts`   | 0.2.0   |
| `@apzhub/metrics-core`        | 0.2.0   |
| `@apzhub/metrics-persistence` | 0.1.0   |
| `@apzhub/platform-services`   | 0.25.0  |
| Platform OpenAPI              | 1.9.0   |

## Coverage (scoped vertical)

| Metric    | Value      |
| --------- | ---------- |
| Lines     | **97.32%** |
| Functions | **99.04%** |
| Branches  | **73.00%** |

See [Coverage Baseline](./APZMETRICS-005-Coverage-Baseline.md).

## Classification

**PRODUCTION_READY_WITH_LIMITATIONS** — see [Production Readiness](./APZMETRICS-005-Production-Readiness.md).
