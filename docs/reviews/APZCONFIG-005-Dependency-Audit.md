# APZCONFIG-005 — Dependency Audit

**Date:** 2026-07-16

## Package versions (certified)

| Package | Version |
| --- | --- |
| `@apzhub/configuration-contracts` | 0.2.0 |
| `@apzhub/configuration-core` | 0.2.0 |
| `@apzhub/configuration-persistence` | 0.1.0 |
| `@apzhub/platform-services` | 0.21.0 |
| `@apzhub/platform-service-contracts` | 0.16.0 |

## Forbidden dependencies (verified absent)

| Package | Must not depend on |
| --- | --- |
| configuration-contracts | core, persistence, platform-services, `@apzhub/config` |
| configuration-core | persistence, platform-services, `@apzhub/config` |
| configuration-persistence | platform-services, `@apzhub/config` |

## Verdict

**PASS** — dependency direction and package isolation certified.
