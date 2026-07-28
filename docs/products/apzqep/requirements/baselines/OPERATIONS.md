# Operations

No new background jobs, migrations runner, or operational tooling is
introduced beyond the standard Drizzle migrations (`0074`–`0076`) applied by the
existing `pnpm db:migrate` pipeline. Baseline integrity verification is
synchronous and on-demand (`verifyBaselineIntegrity`); it is not a scheduled job
in this programme increment. Observability follows the existing QEP application
service pattern: every command emits an `onObservation` event with operation
name, duration, and outcome, and audit trail rows are queryable per baseline id.
