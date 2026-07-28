# APZHUB-ENG-0001 — Quality Evidence

> **Programme:** APZHUB-ENG-0001  
> **Date:** 2026-07-20  
> **Scope:** R12-PERSIST-01 only

---

## Commands executed

| Gate                  | Command                                                                          | Result              |
| --------------------- | -------------------------------------------------------------------------------- | ------------------- |
| Typecheck             | `pnpm --filter @apzhub/platform-services typecheck`                              | **PASS**            |
| Typecheck             | `pnpm exec tsc --noEmit -p apps/web/tsconfig.json`                               | **PASS**            |
| Lint                  | `eslint src/services/automation/` (platform-services)                            | **PASS**            |
| Unit / integration    | `vitest run …/services/automation …/cross-product-automation-foundation.test.ts` | **PASS** (15 tests) |
| Architecture boundary | `automation-persist-01-boundary.test.ts`                                         | **PASS**            |
| Compatibility         | Async journal + foundation + web wire                                            | **PASS**            |

---

## Test coverage (this programme)

| Suite                                           | Focus                                                          |
| ----------------------------------------------- | -------------------------------------------------------------- |
| `automation-foundation.test.ts`                 | In-memory journal behaviour (idempotency, deferred, fail-soft) |
| `automation-execution-journal-postgres.test.ts` | Mocked Postgres insert/select/list + production guard          |
| `automation-persist-01-boundary.test.ts`        | Migrations **0061/0062** present in drizzle journal            |
| `cross-product-automation-foundation.test.ts`   | Event Bus → Support automation journal (async list)            |

---

## Architecture verification

| Rule                                                       | Evidence                                            |
| ---------------------------------------------------------- | --------------------------------------------------- |
| Platform Service owns journal                              | Port + foundation in `@apzhub/platform-services`    |
| No module direct DB writes                                 | Modules unchanged                                   |
| No Event Bus redesign                                      | `wireEventAutomation` unchanged                     |
| No Workflow Execute                                        | Deferred reason `WORKFLOW_EXECUTE_GATED` retained   |
| No Integration SDK unfreeze                                | SDK untouched                                       |
| Production forbids silent “production postgres” without db | `createProductionAutomationExecutionJournal` throws |

---

## Compatibility notes

- Callers of `AutomationFoundation.listExecutions` must `await` (breaking within **0.x**; package **0.29.0**).
- In-memory journal remains default when no journal injected and when `DATABASE_URL` absent (tests / local without DB).
- With `DATABASE_URL`, server bootstrap uses PostgreSQL SoR.
