# SPR-APZQEP-201 — Release Control Centre & surface completion

> **Status:** **DELIVERED** — 2026-08-14  
> **Parent:** [SPR-APZQEP-200](./SPR-APZQEP-200-competitive-full-swing.md)  
> **Depends on:** APZQEP V1.1 CLOSED; Quality Flow Workspace + Certification/RC APIs live  
> **Next:** [SPR-APZQEP-202](./SPR-APZQEP-202-provider-wave.md)

## Outcome (met)

Operator opens **Quality → Home** and answers **“Can we release with confidence?”** with:

- Live Quality Flow posture
- Honest APZPEN security assurance (never hardcoded pass)
- Drill-in to Quality Flows, Release Readiness, Release Candidate
- RC product entry via recent SCM changes + APZPEN on security domain

## Ships delivered

| ID    | Ship                | Evidence                                                          |
| ----- | ------------------- | ----------------------------------------------------------------- |
| 201-A | Home Command Centre | `qep-home-views.tsx`, workbench manifest, M01 enabled             |
| 201-B | Release Readiness   | `qep-release-readiness-views.tsx`, security from bridge           |
| 201-C | Activity → Home     | `packages/workbench-framework/manifests/qep/module.yaml`          |
| 201-D | Permissions         | `qep.home.read`, `qep.release_readiness.read`                     |
| 201-E | Catalogue honesty   | M01 + M12 `enabled`                                               |
| 201-F | APZPEN bridge       | `apzpen-security-bridge.ts`, `GET /api/v1/qep/security-assurance` |
| 201-G | RC UX               | Recent SCM picker + APZPEN strip on RC home/workbench             |

## Tests

- Vitest: `home-routes.test.ts`, `apzpen-security-bridge.test.ts`, `qep-types` catalogue
- Playwright: `testing/playwright/e2e/apzqep-201-release-control-centre.spec.ts`

## Non-goals held

No new SoR; no AI certify; no 202+ scope.

## Acceptance

Owner authorised programme continuation through 202–204 (2026-08-14). SPR-201 closed as foundation for provider wave.
