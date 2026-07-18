# APZADMIN-005 — Dependency Review

**Date:** 2026-07-16

## Package versions (certified)

| Package                     | Version |
| --------------------------- | ------- |
| `@apzhub/admin-contracts`   | 0.2.0   |
| `@apzhub/admin-core`        | 0.2.0   |
| `@apzhub/admin-persistence` | 0.1.0   |
| `@apzhub/platform-services` | 0.22.0  |

## Forbidden dependencies (verified absent)

| Package           | Must not depend on                               |
| ----------------- | ------------------------------------------------ |
| admin-contracts   | admin-core, admin-persistence, platform-services |
| admin-core        | admin-persistence, platform-services             |
| admin-persistence | platform-services                                |

## Allowed infrastructure note

`@apzhub/admin-persistence` may depend on `@apzhub/config` for shared database executor infrastructure only — this is distinct from Administration SoR runtime behaviour and is not a runtime administration manager.

## Verdict

**PASS** — dependency direction and package isolation certified.
