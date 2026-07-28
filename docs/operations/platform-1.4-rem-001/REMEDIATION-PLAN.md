# Remediation Plan — Platform-1.4-REM-001

| Defect     | Action                                                                                                            | Outcome                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| OR-DEF-001 | Apply/verify migrations 0065–0067; validate durable schema                                                        | **CLOSED** — schema present; `pnpm db:migrate` idempotent      |
| OR-DEF-002 | OpenAPI 1.14 allowlists; platform-services 0.32.0 pins; notification-contracts 0.3.5; ENG-004 delivery allowlists | **CLOSED** for pin/allowlist drift (affected cert suites PASS) |
| OR-DEF-003 | Fix RLS test gate; non-superuser tester role; `createDb` explicit-URL pool                                        | **CLOSED** (Platform) — 3/3 RLS tests PASS                     |
| OR-DEF-004 | Ownership of 4 Playwright failures                                                                                | **RECLASSIFIED** — see PLAYWRIGHT-REVIEW                       |

## Explicit non-goals

No feature work · no durable flag enablement · no package redesign · no SMTP / Email SoR / Workflow Execute / FIN-001 / Platform 2.0.
