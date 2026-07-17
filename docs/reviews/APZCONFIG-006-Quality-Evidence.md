# APZCONFIG-006 — Quality Evidence

**Date:** 2026-07-16  
**Wave:** Configuration programme closeout

## Audits

| Command | Result |
| --- | --- |
| `pnpm audit:configuration-foundation` | PASS (via vertical) |
| `pnpm audit:configuration-platform-services` | PASS (via vertical) |
| `pnpm audit:configuration-http-client` | PASS (via vertical) |
| `pnpm audit:configuration-workbench` | PASS (via vertical) |
| `pnpm audit:configuration-vertical` | PASS |
| `pnpm audit:configuration-wave` | PASS |
| `pnpm openapi:validate:platform` | PASS |

## Versions frozen

| Package | Version |
| --- | --- |
| `@apzhub/configuration-contracts` | 0.2.0 |
| `@apzhub/configuration-core` | 0.2.0 |
| `@apzhub/configuration-persistence` | 0.1.0 |
| `@apzhub/platform-services` | 0.22.0 (additive Administration; Configuration surface unchanged) |
| `@apzhub/platform-service-contracts` | 0.16.0 |
| Platform OpenAPI | 1.5.0 |

## Coverage (retained from APZCONFIG-005)

| Metric | Value |
| --- | --- |
| Lines / statements | 93.11% |
| Functions | 92.17% |

## Classification

**PRODUCTION_READY_WITH_LIMITATIONS** — retained; wave frozen.
