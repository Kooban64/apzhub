# Remediation Report — APZQEP-REM-002

## Change set (minimal)

| File                                                                | Change                                                                                                                                                                            |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/components/workbench-page.tsx`                            | Route-sync effect rewinds URL only when the **selected view route changes** (Activity Bar / Sidebar). Initial focus and same-view deep links are owned by `activateViewForRoute`. |
| `testing/playwright/e2e/apzqep-eng-110f-evidence-workbench.spec.ts` | Assert provenance URL; extend test timeout.                                                                                                                                       |

## Not changed

- Evidence Domain / Application / Security / REST handlers
- Persistence / ADR-0088 / events / observability
- Test Execution
- APIs / Workbench Evidence views (product UI)

## Behaviour after fix

Nested Evidence deep links such as `/workspace/qep/evidence/items/{id}/provenance` remain on the deep-link URL while Evidence is (or becomes) the resolved view. Sidebar/Activity Bar view changes still push the selected view base route when the URL is outside that view.
