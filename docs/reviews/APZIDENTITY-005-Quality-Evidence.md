# APZIDENTITY-005 — Quality Evidence Pack

**Date:** 2026-07-17  
**Milestone:** Identity Administration Vertical Certification

## Audits

| Command                                 | Result |
| --------------------------------------- | ------ |
| `pnpm audit:identity-foundation`        | PASS   |
| `pnpm audit:identity-platform-services` | PASS   |
| `pnpm audit:identity-http-client`       | PASS   |
| `pnpm audit:identity-workbench`         | PASS   |
| `pnpm audit:identity-vertical`          | PASS   |
| `pnpm certify:identity-vertical`        | PASS   |
| `pnpm openapi:validate:platform`        | PASS   |

## Harness

| Suite                                                             | Result                                                          |
| ----------------------------------------------------------------- | --------------------------------------------------------------- |
| `testing/identity-vertical/apzidentity-005-certification.test.ts` | PASS — Journeys 1–10                                            |
| Layer harnesses 001–004                                           | PASS                                                            |
| Playwright Identity Workbench spec                                | LIMITED — listed; mock-routed; live webServer external conflict |

## Versions

| Package                        | Version |
| ------------------------------ | ------- |
| `@apzhub/identity-contracts`   | 0.2.0   |
| `@apzhub/identity-core`        | 0.2.0   |
| `@apzhub/identity-persistence` | 0.1.0   |
| `@apzhub/platform-services`    | 0.23.0  |
| Platform OpenAPI               | 1.7.0   |

## Coverage (scoped vertical)

| Metric    | Value      |
| --------- | ---------- |
| Lines     | **99.00%** |
| Functions | **99.19%** |
| Branches  | **81.35%** |

## Classification

**PRODUCTION_READY_WITH_LIMITATIONS** — see [Production Readiness](./APZIDENTITY-005-Production-Readiness.md).
