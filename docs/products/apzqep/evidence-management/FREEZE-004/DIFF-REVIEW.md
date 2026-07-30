# Diff Review — APZQEP-FREEZE-004 vs FREEZE-003 `ce220a5d`

## Intended behavioural change (only)

| Path                                     | Change                                                         |
| ---------------------------------------- | -------------------------------------------------------------- |
| `apps/web/components/workbench-page.tsx` | REM-002: route-sync rewinds only on selected-view-route change |

## Packaging identity

| Path                                                        | Change                    |
| ----------------------------------------------------------- | ------------------------- |
| `packages/qep-evidence/package.json`                        | version **1.0.0-rc.2**    |
| `packages/qep-evidence/src/index.ts`                        | version/programme markers |
| `packages/qep-evidence/src/architecture-boundaries.test.ts` | marker expectations       |
| `packages/qep-evidence/README.md`                           | RC docs                   |
| `modules/qep-evidence/module.yaml`                          | version/programme         |

## Validation hygiene

| Path                                                                | Change                                             |
| ------------------------------------------------------------------- | -------------------------------------------------- |
| `testing/playwright/e2e/apzqep-eng-110f-evidence-workbench.spec.ts` | provenance URL assert + FREEZE-004 deep-link suite |

## Documentation / governance (non-runtime)

REM-002 pack · FREEZE-004 pack · RELEASE-003 blocked records · index updates · evidence JSON.

## Confirmed absent

- No ADR-0088 / storage / SQL / migrations
- No event publication / observability features
- No Evidence Domain/API/security behaviour changes
- No Test Execution source changes
- No `pnpm-lock.yaml` dependency upgrades
