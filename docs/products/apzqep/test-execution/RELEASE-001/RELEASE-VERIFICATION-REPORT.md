# Release Verification Report — APZQEP-RELEASE-001

## Pre-release checks

| Check                                             | Result | Evidence                                                    |
| ------------------------------------------------- | ------ | ----------------------------------------------------------- |
| RC identity existed (1.0.0-rc.1)                  | ✅     | FREEZE-001 pack                                             |
| Version promoted to 1.0.0 consistently            | ✅     | `package.json`, `module.yaml`, `QEP_TEST_EXECUTION_VERSION` |
| Package tests after promotion                     | ✅     | 56/56 (revalidated under RELEASE-001)                       |
| No functional code changes in promotion           | ✅     | Identity/markers/docs only                                  |
| Freeze + CERT + Risk Acceptance baselines present | ✅     | Programme packs                                             |
| Release notes / ops docs finalised                | ✅     | This pack + FREEZE guides carried forward                   |
| Secrets absent from capability paths              | ✅     | Hygiene from FREEZE                                         |
| Source tree committed                             | ✅     | Release commit under this programme                         |
| Immutable tag created                             | ✅     | `apzqep-test-execution-v1.0.0`                              |

## Reproducibility

| Item                         | Value                                             |
| ---------------------------- | ------------------------------------------------- |
| Production tag               | `apzqep-test-execution-v1.0.0`                    |
| Package version              | `1.0.0`                                           |
| Release commit (at tag peel) | `62d4e38e2b98e49db15bf74778c6bb1843255570`        |
| Resolve                      | `git rev-parse 'apzqep-test-execution-v1.0.0^{}'` |
| Checkout                     | `git checkout apzqep-test-execution-v1.0.0`       |
| Install                      | `pnpm install --frozen-lockfile`                  |
| Test                         | `pnpm --filter @apzhub/qep-test-execution test`   |

Monorepo note: commitlint type is `chore(apzqep):`; package SemVer is **1.0.0**. Tag is capability-scoped for monorepo safety (not a bare `v1.0.0` platform tag).

## Blockers

**None.** Freeze acceptance commit condition is satisfied by the RELEASE-001 source-control activity.
