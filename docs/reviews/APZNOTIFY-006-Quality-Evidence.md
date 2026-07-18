# APZNOTIFY-006 — Quality Evidence

**Date:** 2026-07-16  
**Milestone:** Notification Wave Certification & Architecture Freeze

## Audits

| Command                            | Result |
| ---------------------------------- | ------ |
| `pnpm audit:notification-vertical` | PASS   |
| `pnpm audit:notification-wave`     | PASS   |
| `pnpm openapi:validate:platform`   | PASS   |

## Package versions (frozen)

| Package                              | Version |
| ------------------------------------ | ------- |
| `@apzhub/notification-contracts`     | 0.2.0   |
| `@apzhub/notification-core`          | 0.2.0   |
| `@apzhub/notification-persistence`   | 0.1.0   |
| `@apzhub/platform-services`          | 0.21.0  |
| `@apzhub/platform-service-contracts` | 0.16.0  |

## Coverage (retained from APZNOTIFY-005)

Consolidated Notification vertical: **98.42%** lines · **96.95%** functions · **83.18%** branches  
Baseline: [APZNOTIFY-005 Coverage Baseline](./APZNOTIFY-005-Coverage-Baseline.md)

## Harness

- `testing/notification-vertical/apznotify-005-certification.test.ts`
- `testing/notification-vertical/apznotify-005-boundary.test.ts`
- `testing/notification-vertical/apznotify-006-wave-closeout.test.ts`

## Classification

**PRODUCTION_READY_WITH_LIMITATIONS** — unchanged from APZNOTIFY-005; wave frozen at APZNOTIFY-006.
