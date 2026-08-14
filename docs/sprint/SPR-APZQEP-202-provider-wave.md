# SPR-APZQEP-202 — Provider wave (Playwright · CI · SCM · Integrations)

> **Status:** **DELIVERED** — 2026-08-14  
> **Parent:** [SPR-APZQEP-200](./SPR-APZQEP-200-competitive-full-swing.md)  
> **Depends on:** [SPR-APZQEP-201](./SPR-APZQEP-201-release-control-centre.md) **DELIVERED**  
> **Next:** [SPR-APZQEP-203](./SPR-APZQEP-203-governed-quality-assist.md)

## Outcome (met)

Engineering evidence flows into APZQEP via matrix providers; CI/workflow events become change objects; Integration Centre is operational.

## Ships delivered

| ID    | Ship                                           | Evidence                                                                                         |
| ----- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 202-A | JUnit + Allure + axe (existing) + CI providers | `matrix-providers.ts`, normalize-junit/allure/ci-check                                           |
| 202-B | CI result on SCM change                        | `workflow_run` / `check_suite` → `ci_run` change events; `POST /api/v1/qep/automation/ci-ingest` |
| 202-C | Playwright runner path                         | `playwright-runner-health.ts` + Integration Centre panel; live only with flags                   |
| 202-D | Integration Centre MVP                         | `qep-integrations` active; providers + runner health UI                                          |

## Tests

`packages/platform-automation/src/providers/ingest/spr202-adapters.test.ts`

## Non-goals held

No AI (203); no Evidence GA claim beyond runner honesty.
