# Dependency Manifest — Test Execution 1.0.0-rc.1

## Direct package dependencies (`@apzhub/qep-test-execution`)

| Package          | Version       | Notes                         |
| ---------------- | ------------- | ----------------------------- |
| `@apzhub/config` | `workspace:*` | Platform config / schema      |
| `drizzle-orm`    | `^0.45.2`     | ORM (same family as platform) |

## Workspace consumers

| Consumer                     | Dependency                                 |
| ---------------------------- | ------------------------------------------ |
| `apps/web`                   | `@apzhub/qep-test-execution` `workspace:*` |
| `modules/qep-test-execution` | package reference in `module.yaml`         |
| `packages/platform-services` | gateway / bootstrap wiring (workspace)     |

## Lockfile

Root `pnpm-lock.yaml` is the authoritative lock. **No dependency upgrades** performed under FREEZE-001.

## Advisory posture

No Freeze-time critical advisory remediation was authorised or applied. Continue platform-wide `pnpm audit` / advisory process under separate security programmes. Capability introduces no new external runtime dependency beyond existing `drizzle-orm` already used across the monorepo.

## Freeze rule

Dependency upgrades are **not** authorised unless Owner declares a critical release blocker and authorises a narrow fix programme.
