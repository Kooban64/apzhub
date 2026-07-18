# APZADMIN-006 — Quality Evidence

**Date:** 2026-07-16  
**Wave:** Administration programme closeout

## Audits

| Command                                       | Result              |
| --------------------------------------------- | ------------------- |
| `pnpm audit:admin-foundation`                 | PASS (via vertical) |
| `pnpm audit:administration-platform-services` | PASS (via vertical) |
| `pnpm audit:administration-http-client`       | PASS (via vertical) |
| `pnpm audit:administration-workbench`         | PASS (via vertical) |
| `pnpm audit:administration-vertical`          | PASS                |
| `pnpm audit:administration-wave`              | PASS                |
| `pnpm openapi:validate:platform`              | PASS                |

## Versions frozen

| Package                     | Version |
| --------------------------- | ------- |
| `@apzhub/admin-contracts`   | 0.2.0   |
| `@apzhub/admin-core`        | 0.2.0   |
| `@apzhub/admin-persistence` | 0.1.0   |
| `@apzhub/platform-services` | 0.22.0  |
| Platform OpenAPI            | 1.6.0   |

## Coverage (retained from APZADMIN-005)

| Metric             | Value  |
| ------------------ | ------ |
| Lines / statements | 99.37% |
| Functions          | 99.43% |
| Branches           | 82.75% |

## Classification

**PRODUCTION_READY_WITH_LIMITATIONS** — retained; wave frozen.
