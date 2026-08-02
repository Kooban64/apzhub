# PERSISTENCE-DISCOVERY — APZQEP-151

| Field         | Value                                                           |
| ------------- | --------------------------------------------------------------- |
| Programme     | APZQEP-151                                                      |
| Baseline      | `1629c30b`                                                      |
| Timestamp     | 20260802T194500Z                                                |
| Decision gate | PostgreSQL = production SoR; in-memory = test/dev adapters only |

---

## Classification rollup

| Cap                                       | Persistence area                       | Classification                            |
| ----------------------------------------- | -------------------------------------- | ----------------------------------------- |
| A                                         | Suite aggregate + history              | **IN-MEMORY** → migrate to PostgreSQL SoR |
| B                                         | Execution Plan + history + handoff     | **IN-MEMORY** → PostgreSQL SoR            |
| C                                         | Execution Session + steps + amendments | **IN-MEMORY** → PostgreSQL SoR            |
| D                                         | Defect + history                       | **IN-MEMORY** → PostgreSQL SoR            |
| E                                         | Requirement + suiteLinks + history     | **IN-MEMORY** → PostgreSQL SoR            |
| E                                         | Coverage / trace matrix                | **DERIVED ONLY** — not SoR                |
| F                                         | SavedReport + trend samples            | **IN-MEMORY** metadata → PostgreSQL       |
| F                                         | Facts / metrics / generated reports    | **DERIVED ONLY** — not SoR                |
| Evidence / QKI / Notifications / Commands | Existing platforms                     | **CURRENTLY DURABLE** / consume-only      |

No conflicting approved Cap A–F Postgres decision found. Prior ENG packages (`qep-evidence`, `qep-test-execution`, …) already use Drizzle + `packages/config/drizzle` — **follow that convention**.

---

## Platform tooling (consume)

| Item               | Location                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Client             | `packages/config/src/db/client.ts` — drizzle + pg                                        |
| Migrations         | `packages/config/drizzle/` — next IDs **0095+**                                          |
| Latest             | `0094_apz_platform_outbox_event_rls`                                                     |
| Outbox             | `platform_outbox_event` via `@apzhub/platform-outbox`                                    |
| Tenant RLS helper  | `applyPostgresTenantSession`                                                             |
| Reference adapters | `qep-evidence`, `qep-test-execution` factories (`mode: memory \| postgres`, fail-closed) |

---

## Repository ports (ready for adapters)

| Cap | Port                         | File                                                                   |
| --- | ---------------------------- | ---------------------------------------------------------------------- |
| A   | `SuiteRepository`            | `packages/qep-suites/src/application/repository.ts`                    |
| B   | `ExecutionPlanRepository`    | `packages/qep-execution-plans/src/application/repository.ts`           |
| C   | `ExecutionSessionRepository` | `packages/qep-execution-workspace/src/application/repository.ts`       |
| D   | `DefectRepository`           | `packages/qep-defects/src/application/repository.ts`                   |
| E   | `RequirementRepository`      | `packages/qep-requirements-traceability/src/application/repository.ts` |
| F   | `ReportingRepository`        | `packages/qep-reporting/src/application/repository.ts`                 |

Compose factories already accept `options.repository`. Web `*-runtime.ts` currently injects nothing (always in-memory).

---

## Concurrency & events (as found)

| Cap | Optimistic concurrency                           | Events                                          |
| --- | ------------------------------------------------ | ----------------------------------------------- |
| A   | revision counter; no stale check                 | drainEvents + optional publisher; outbox unused |
| B   | `expectedRevision` on update; handoff idempotent | same                                            |
| C   | revision; step resultRevision for amendments     | same                                            |
| D   | `expectedRevision`                               | same                                            |
| E   | `expectedRevision`                               | same                                            |
| F   | SavedReport revision; no stale check             | same                                            |

APZQEP-151 will enforce stale-write protection at PostgreSQL repository layer (`WHERE revision = expected`) and wire transactional outbox enqueue where feasible.

---

## Ephemeral data note

Current Cap A–F in-memory records are **not** production durable data. No migration of process-local state into PostgreSQL as if it were authoritative production data. Seeds/fixtures remain separate from schema migrations.

---

## Decision (confirmed)

```text
PostgreSQL is the durable production Source of Record.
In-memory repositories remain as test / explicit non-production adapters.
Production and staging certification environments fail closed without PostgreSQL.
```

## Post-implementation note

Web Cap A–F runtimes now inject PostgreSQL persistence via `resolveCoreQePersistence` (APZQEP-151). Prior discovery statement that runtimes always used in-memory is superseded.
