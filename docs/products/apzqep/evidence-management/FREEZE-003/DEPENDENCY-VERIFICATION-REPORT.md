# Dependency Verification Report — APZQEP-FREEZE-003

## Direct package dependencies (`@apzhub/qep-evidence` **1.0.0-rc.1**)

| Package          | Version       | Notes           |
| ---------------- | ------------- | --------------- |
| `@apzhub/config` | `workspace:*` | Platform config |

No new external runtime dependencies introduced under Evidence Management waves or FREEZE-003.

## Workspace consumers

| Consumer                     | Dependency                           |
| ---------------------------- | ------------------------------------ |
| `apps/web`                   | `@apzhub/qep-evidence` `workspace:*` |
| `packages/platform-services` | `@apzhub/qep-evidence` `workspace:*` |
| `modules/qep-evidence`       | package reference in `module.yaml`   |

## Adjacent baseline

| Package                      | Version   | Status              |
| ---------------------------- | --------- | ------------------- |
| `@apzhub/qep-test-execution` | **1.0.1** | Unchanged · 77 PASS |

## Lockfile

Root `pnpm-lock.yaml` remains authoritative. **No dependency upgrades** performed under FREEZE-003.

## Freeze rule

Dependency upgrades are **not** authorised unless Owner declares a critical release blocker and authorises a narrow fix programme.
