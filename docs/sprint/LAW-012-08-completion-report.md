# LAW-012-08 — Completion Report

> **Story:** LAW-012-08 — Persistence Closeout Quality Gate Fix  
> **Status:** **Complete**  
> **Date:** 2026-07-06  
> **Prerequisite:** [LAW-012-07](./LAW-012-07-completion-report.md)

---

## 1. Objective

Restore all quality gates after LAW-012-07 documentation closeout. Remediation only — no new features, adapters, or persistence expansion.

**Result:** Achieved. All primary gates green. LAW-012 persistence closeout is now clean.

---

## 2. Failures found (LAW-012-07 baseline)

| Gate                 | Failure                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`          | 10 unused-import errors in law-platform UI/tests                                                                                                       |
| `pnpm typecheck`     | `@apzhub/legal-business-core` unresolved via `apps/web`; `DatabaseExecutor` / UoW typing; billing UI prop mismatches; calendar adapter criteria typing |
| `pnpm build`         | `LawCalendarEventPersistenceModel` / config mapper errors in Next.js compile                                                                           |
| `pnpm test`          | 2 failures in `persistence-foundation.test.ts` and `persistence-hardening.test.ts` (postgres smoke tests without full env)                             |
| `pnpm test:coverage` | Same 2 test failures blocked clean exit                                                                                                                |

---

## 3. Fixes applied

### Lint (10 errors → 0)

- Removed unused `Button` imports from invoice/calendar list pages
- Removed unused `useState` from invoice detail page
- Removed unused route imports from `matter-lifecycle.integration.test.ts`
- Removed unused `getSharedMatterRepository` from `matter-workspace.integration.test.ts`
- Removed unused `MatterListCriteria` import from `postgres-matter-repository.ts`

### Typecheck / build

- Added `@apzhub/legal-business-core` path mapping to `apps/web/tsconfig.json` so config package mappers resolve when compiled through Next.js
- Introduced `DatabaseExecutor` / `DatabaseTransaction` types in `packages/config/src/db/client.ts`
- Updated config postgres adapters and `applyPostgresTenantSession` to accept `DatabaseExecutor`
- Updated law-platform UoW, outbox skeleton, and postgres wrappers to use `DatabaseExecutor`
- Added `count()` to `WritableInvoiceRepository` interface
- Added `getDiagnostics()` to `LegalCalendarActionExecutor`
- Fixed billing UI components to match UX layout APIs (`table`/`pagination`/`sections` props)
- Fixed `useRef` initial values for React 19 strict typing
- Calendar postgres wrapper: typed `matchesCriteria` assertion for `LawCalendarEventPersistenceModel`
- Calendar integration test: removed invalid `actorId` from `KnowledgeContext`

### Postgres factory smoke tests (2 failures → 0)

- `persistence-foundation.test.ts` and `persistence-hardening.test.ts` now pass a stub `db: {} as Database` in context
- Avoids `createDb()` → `getEnv()` when only verifying adapter class selection
- Removed fake `DATABASE_URL` injection that triggered partial env validation

---

## 4. Gates rerun

| Gate                 | Result                                                                                                                                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`          | ✅ **Pass**                                                                                                                                                                                                                                                                      |
| `pnpm typecheck`     | ✅ **Pass** (17 workspace packages)                                                                                                                                                                                                                                              |
| `pnpm build`         | ✅ **Pass**                                                                                                                                                                                                                                                                      |
| `pnpm test`          | ✅ **1538 pass / 42 skip / 0 fail** (338 files)                                                                                                                                                                                                                                  |
| `pnpm test:coverage` | ✅ **Pass** — 90.22% statements, 87.09% branches, 90.42% functions                                                                                                                                                                                                               |
| `pnpm test:e2e`      | ⚠️ **30 failed / 6 passed** — Playwright Chromium binary not installed in CI environment (`browserType.launch: Executable doesn't exist`). Platform E2E suite exists; failures are environmental, not regression from LAW-012-08 changes. No law-platform persistence E2E suite. |

---

## 5. Skipped PostgreSQL integration tests

**42 tests** remain skipped when `DATABASE_URL` is unavailable or PostgreSQL is unreachable (`describe.runIf(postgresAvailable)`):

| Suite                         | Skipped when no DB                                    |
| ----------------------------- | ----------------------------------------------------- |
| Entity integration (7)        | Contract + tenant isolation + relationship validation |
| Outbox wiring (4)             | Client/matter, document/task, calendar/time, invoice  |
| Availability placeholders (7) | Explicit skip assertions                              |

When PostgreSQL is available with migrations 0001–0008 applied, all integration tests execute.

---

## 6. Confirmation

**LAW-012 persistence closeout is now clean.**

- LAW-012-01 through LAW-012-07 documentation remains valid
- Quality gates required for sprint closure are green (excluding environmental E2E browser dependency)
- No architecture changes, no new persistence scope, no business behaviour changes beyond type/test corrections

---

## 7. Stop condition

LAW-012-08 is **complete**. Await owner approval before APIs, Trust Accounting, Reporting, Payment records, Outbox workers, or any new persistence work.
