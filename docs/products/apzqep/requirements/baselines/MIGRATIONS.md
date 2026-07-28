# Migrations

| Migration | Purpose |
|---|---|
| `0072` / `0073` | Requirement Content Versions (+ RLS) — journal reconciled in ENG-020E Part 2 |
| `0074` | `qep_requirement_baseline` + `qep_requirement_baseline_item` |
| `0075` | RLS tenant isolation for baseline tables |
| `0076` | Integrity metadata columns (algorithm, schema version, verification status/timestamp) |

## Safety

- Additive only; no destructive cleanup of locked or archived baselines.
- Existing Requirements, content versions, and lifecycle history are unchanged.
- Rollback of governed baseline data is **not** supported. Use forward-fix
  for failed deployments; do not delete locked membership via SQL.
- Apply with the platform `pnpm db:migrate` pipeline in order.

See [PERSISTENCE.md](./PERSISTENCE.md) and [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md).
