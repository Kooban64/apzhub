# APZQEP-151 Certification Evidence

Timestamp: 20260802T200407Z  
Baseline commit: 1629c30be0ff86f284862ff17ec2f5c4a55db361

## Test log

See `APZQEP-151-TESTS.log` — 10 files / 51 tests passed (Caps A–F unit + 151 integration).

APZQEP-150 enterprise product chain: PASS (regression).

## Gate results (engineering)

| #   | Gate                                     | Result                                                                          |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | Caps A–F PostgreSQL production SoR       | PASS                                                                            |
| 2   | Production in-memory fallback disabled   | PASS                                                                            |
| 3   | Restart durability                       | PASS                                                                            |
| 4   | Multi-instance writes safe               | PASS                                                                            |
| 5   | Optimistic concurrency                   | PASS                                                                            |
| 6   | Durable idempotency                      | PASS                                                                            |
| 7   | Handoff idempotent                       | PASS                                                                            |
| 8   | Completed execution immutability         | PASS                                                                            |
| 9   | Governed amendments                      | PASS                                                                            |
| 10  | Defects reference execution facts        | PASS                                                                            |
| 11  | Requirements durable                     | PASS                                                                            |
| 12  | Derived traceability rebuildable         | PASS                                                                            |
| 13  | Reporting projection                     | PASS                                                                            |
| 14  | QKI rebuildable                          | PASS (documented)                                                               |
| 15  | Transactional event persistence          | PASS                                                                            |
| 16  | Tenant isolation                         | PASS                                                                            |
| 17  | Project isolation                        | PASS                                                                            |
| 18  | Migrations                               | PASS (0095/0096)                                                                |
| 19  | Backup and restore                       | PROCEDURE READY (`pg_dump` tooling present; controlled restore in ops cert env) |
| 20  | E2E product chain regression             | PASS                                                                            |
| 21  | Repository clean                         | After engineering commit                                                        |
| 22  | No new product functionality             | PASS                                                                            |
| 23  | No package release/deploy                | PASS                                                                            |
| 24  | RB-001 objectively cleared (engineering) | PASS                                                                            |

RB-002: OPEN — unchanged.

## Migrations

- `packages/config/drizzle/0095_apz_qep_core_qe_persistence.sql`
- `packages/config/drizzle/0096_apz_qep_core_qe_persistence_rls.sql`

## Provider

`APZQEP_CORE_QE_PERSISTENCE_MODE` / production-like fail-closed via `resolve-core-qe-persistence.ts`.  
Health facet: `coreQePersistence`.
