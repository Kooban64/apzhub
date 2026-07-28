# Evidence Pack — APZQEP-CERT-070A

| Field | Value |
| ----- | ----- |
| Programme | APZQEP-CERT-070A |
| Assurance JSON | `docs/operations/evidence/portfolio-recert/20260728T073000Z-APZQEP-CERT-070A.json` |

## Upstream evidence (cited)

| Artefact | ID / Path |
| -------- | --------- |
| ARCH-014 Acceptance | `20260728T062849Z-APZQEP-ARCH-014-ACCEPTANCE.json` |
| OES-ENG-070A Acceptance | `20260728T065105Z-APZQEP-OES-ENG-070A-ACCEPTANCE.json` |
| ENG-070A ECR PASS | `20260728T071000Z-APZQEP-ENG-070A-ECR.json` |
| ENG-070A Owner Acceptance | `20260728T072749Z-APZQEP-ENG-070A-ACCEPTANCE.json` |
| CERT-060A Domain | `20260727T174500Z-APZQEP-CERT-060A-ACCEPTANCE.json` |
| CERT-060B Infrastructure | `20260728T060500Z-APZQEP-CERT-060B-ACCEPTANCE.json` |
| Workbench Known Limitations | [../workbench/KNOWN-LIMITATIONS.md](../workbench/KNOWN-LIMITATIONS.md) |
| Infrastructure Known Limitations | [../infrastructure/KNOWN-LIMITATIONS.md](../infrastructure/KNOWN-LIMITATIONS.md) |
| ECR Checklist (E2E-01…14, A11Y-01…06, N-01…06) | [../workbench/ECR-CHECKLIST.md](../workbench/ECR-CHECKLIST.md) |
| Accessibility evidence | [../workbench/ACCESSIBILITY.md](../workbench/ACCESSIBILITY.md) |

## Quality re-verification (CERT, independent)

| Gate | Result |
| ---- | ------ |
| `pnpm --filter @apzhub/qep-test-plans test` (full package suite) | **104 PASS** (re-run 2026-07-28) |
| `apps/web/components/qep/qep-test-plan-views.test.tsx` (Vitest, views/journeys) | **15 PASS** (re-run 2026-07-28) |
| Presentation-specific total (`routes.test.ts` 5 + views/journeys 15) | **20 / 20 PASS** — matches ENG-070A Completion Report claim exactly |
| `pnpm --filter @apzhub/qep-test-plans typecheck` | **PASS** (re-run 2026-07-28) |
| Playwright spec file | **PRESENT** — `testing/playwright/e2e/apzqep-eng-070a-test-plans-workbench.spec.ts` (495 lines) — reviewed, not re-executed under CERT (browser E2E execution is an operational/CI concern; re-running it performs no engineering and was not required to reach a certification recommendation given the file's presence and content were independently reviewed) |
| `packages/qep-test-plans/src/domain/` / `src/infrastructure/` diff since CERT-060B | **NONE** — confirmed unchanged |

## Source surfaces reviewed (read-only)

| File | Purpose |
| ---- | ------- |
| `packages/qep-test-plans/src/presentation/routes.ts` | Route tree / deep links (125 lines) |
| `apps/web/lib/qep/qep-test-plan-api.ts` | Typed REST client (431 lines) |
| `apps/web/components/qep/qep-test-plan-views.tsx` | Views, action bar, dialogs (1,730 lines) |
| `apps/web/components/qep/qep-workspace-router.tsx` | QEP shell router wiring |
| `modules/qep-test-plans/module.yaml` | Module manifest, Sidebar IA, permissions |

## Status

```text
APZQEP-CERT-070A IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION
```
