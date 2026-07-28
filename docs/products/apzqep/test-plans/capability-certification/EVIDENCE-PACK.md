# Evidence Pack — APZQEP-CERT-080A

| Field | Value |
| ----- | ----- |
| Programme | APZQEP-CERT-080A |
| Assurance JSON | `docs/operations/evidence/portfolio-recert/20260728T081500Z-APZQEP-CERT-080A.json` |

## Upstream evidence (cited)

| Artefact | ID / Path |
| -------- | --------- |
| ARCH-013 Acceptance | `20260727T101800Z-APZQEP-ARCH-013-ACCEPTANCE.json` |
| OES-ENG-060A Acceptance | `20260727T151900Z-APZQEP-OES-ENG-060A-ACCEPTANCE.json` |
| ENG-060A Owner Acceptance | `20260727T165200Z-APZQEP-ENG-060A-ACCEPTANCE.json` |
| CERT-060A Owner Acceptance | `20260727T174500Z-APZQEP-CERT-060A-ACCEPTANCE.json` |
| OES-ENG-060B Acceptance | `20260727T181000Z-APZQEP-OES-ENG-060B-ACCEPTANCE.json` |
| ENG-060B Owner Acceptance | `20260727T194000Z-APZQEP-ENG-060B-ACCEPTANCE.json` |
| CERT-060B Owner Acceptance | `20260728T060500Z-APZQEP-CERT-060B-ACCEPTANCE.json` |
| ARCH-014 Acceptance | `20260728T062849Z-APZQEP-ARCH-014-ACCEPTANCE.json` |
| OES-ENG-070A Acceptance | `20260728T065105Z-APZQEP-OES-ENG-070A-ACCEPTANCE.json` |
| ENG-070A Owner Acceptance | `20260728T072749Z-APZQEP-ENG-070A-ACCEPTANCE.json` |
| CERT-070A Assurance | `20260728T073000Z-APZQEP-CERT-070A.json` |
| CERT-070A Owner Acceptance | `20260728T080924Z-APZQEP-CERT-070A-ACCEPTANCE.json` |
| Domain Known Limitations | [../domain-certification/KNOWN-LIMITATIONS.md](../domain-certification/KNOWN-LIMITATIONS.md) |
| Infrastructure Known Limitations | [../infrastructure/KNOWN-LIMITATIONS.md](../infrastructure/KNOWN-LIMITATIONS.md) |
| Workbench Known Limitations | [../workbench/KNOWN-LIMITATIONS.md](../workbench/KNOWN-LIMITATIONS.md) |
| CERT-070A Known Limitations Review | [../CERT-070A/KNOWN-LIMITATIONS-REVIEW.md](../CERT-070A/KNOWN-LIMITATIONS-REVIEW.md) |
| Workbench ECR Checklist (E2E-01…14, A11Y-01…06, N-01…06) | [../workbench/ECR-CHECKLIST.md](../workbench/ECR-CHECKLIST.md) |
| Workbench Accessibility evidence | [../workbench/ACCESSIBILITY.md](../workbench/ACCESSIBILITY.md) |

## Quality re-verification (CERT-080A, independent)

| Gate | Result |
| ---- | ------ |
| `pnpm exec vitest run packages/qep-test-plans apps/web/components/qep/qep-test-plan-views.test.tsx apps/web/lib/api/v1/handlers/qep-test-plan.test.ts` | **124 / 124 PASS** (re-run 2026-07-28) |
| `pnpm --filter @apzhub/qep-test-plans typecheck` | **PASS** (re-run 2026-07-28) |
| `packages/qep-test-plans/src/domain/`, `src/infrastructure/`, `src/presentation/` diff since CERT-070A | **NONE** — confirmed unchanged |
| `packages/qep-test-plans/package.json` version | **0.2.0** — confirmed unchanged (not bumped) |
| `modules/qep-test-plans/module.yaml` version | **0.2.0** — confirmed unchanged (not bumped) |

## Source surfaces reviewed (read-only)

| File | Purpose |
| ---- | ------- |
| `packages/qep-test-plans/src/index.ts` | Package export surface, version marker |
| `packages/qep-test-plans/src/application/available-actions.ts` | `availableActions` computation (Domain/Application authority) |
| `packages/qep-test-plans/src/application/adapters/plan-dto-adapter.ts` | DTO projection |
| `apps/web/lib/api/v1/handlers/qep-test-plan.ts` | REST handler (Infrastructure layer, hosted in `apps/web`) |
| `apps/web/lib/qep/qep-test-plan-api.ts` | Typed REST client (431 lines) |
| `apps/web/components/qep/qep-test-plan-views.tsx` | Views, action bar, dialogs (1,730 lines) |
| `packages/qep-test-plans/src/presentation/routes.ts` | Route tree / deep links (125 lines) |
| `modules/qep-test-plans/module.yaml` | Module manifest, Sidebar IA, permissions |
| `packages/qep-test-plans/package.json` | Version / export map |

## Status

```text
APZQEP-CERT-080A IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION
```
