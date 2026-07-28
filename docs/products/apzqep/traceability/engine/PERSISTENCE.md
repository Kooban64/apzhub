# Persistence — Trace Links

| Field      | Value                                                                 |
| ---------- | --------------------------------------------------------------------- |
| Migrations | `0079_apz_qep_trace_link.sql`, `0080_apz_qep_trace_link_rls.sql`      |
| Schema     | `packages/config/src/db/qep-traceability-schema.ts`                   |
| Tables     | `qep_trace_link`, `qep_trace_link_history`, `qep_trace_link_taxonomy` |

## Design notes

- Distinct from Requirements Relationship tables (0077/0078).
- Optimistic concurrency via `revision`.
- Partial unique index on `(tenant_id, duplicate_key)` for active lifecycle states.
- History is append-only with `(tenant_id, trace_id, sequence)` uniqueness.
- Taxonomy table stores display seed metadata; **domain taxonomy remains authoritative**.
- RLS uses `app.tenant_id` (migration 0080).
