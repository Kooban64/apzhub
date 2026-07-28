# Persistence — Verifications

| Field      | Value                                                                |
| ---------- | -------------------------------------------------------------------- |
| Migrations | `0081_apz_qep_verification.sql`, `0082_apz_qep_verification_rls.sql` |
| Schema     | `packages/config/src/db/qep-verification-schema.ts`                  |
| Tables     | `qep_verification`, `qep_verification_history`                       |

## Design notes

- Distinct from Trace Link (`qep_trace_link`) and Requirements Relationship tables.
- Optimistic concurrency via `revision`.
- Status and outcome stored separately (Status ≠ Outcome — ARCH-009 / ENG-040A).
- History is append-only with `(tenant_id, verification_id, sequence)` uniqueness.
- No hard delete — retire / supersede / withdraw / cancel are the only terminal paths.
- Subject artefact content is **not** stored; references only (`subject_kind`, `subject_artefact_id`, optional version/baseline/uri).
- RLS uses `app.tenant_id` (migration 0082).

## Indexes

Tenant-scoped indexes on id, status, outcome, subject `(kind, artefact_id)`, authority, scope; history by `(tenant_id, verification_id)`.
