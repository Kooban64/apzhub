# Repository Implementation

| Cap | Factory                             | Postgres adapter                           |
| --- | ----------------------------------- | ------------------------------------------ |
| A   | `createSuitePersistence`            | `createPostgresSuiteRepository`            |
| B   | `createExecutionPlanPersistence`    | `createPostgresExecutionPlanRepository`    |
| C   | `createExecutionSessionPersistence` | `createPostgresExecutionSessionRepository` |
| D   | `createDefectPersistence`           | `createPostgresDefectRepository`           |
| E   | `createRequirementPersistence`      | `createPostgresRequirementRepository`      |
| F   | `createReportingPersistence`        | `createPostgresReportingRepository`        |

Web wiring: `apps/web/lib/qep/*-runtime.ts` + `resolve-core-qe-persistence.ts`.

Optimistic concurrency: update conditioned on `revision === expectedPrior` (aggregate.revision − 1).
