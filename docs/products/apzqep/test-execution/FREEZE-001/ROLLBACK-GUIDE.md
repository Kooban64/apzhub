# Rollback Guide — Test Execution 1.0.0-rc.1

## Principles

- Prefer **application rollback** before destructive schema rollback.
- Schema migrations `0087`/`0088` introduce new tables; rolling back application code while leaving empty/unused tables is usually safest for a failed pilot.
- Do **not** drop tables with production data without an Owner-authorised data programme.

## Application rollback

1. Redeploy previous `apps/web` / platform build **without** Test Execution Workbench routes (prior commit).
2. Optionally set `APZHUB_QEP_ENABLED=false` only if acceptable for **all** QEP capabilities sharing that gate — prefer module/permission restriction if other QEP modules must stay up.
3. Revoke or tighten `qep.execution.*` permissions if leaving APIs briefly exposed on a mixed deploy.

## Schema rollback (emergency only)

| Migration   | Rollback approach                                                                           |
| ----------- | ------------------------------------------------------------------------------------------- |
| 0088 RLS    | Disable/drop RLS policies on `qep_test_execution*` only if authorised and tables unused     |
| 0087 tables | `DROP TABLE` cascade for `qep_test_execution*` family **only** if no retained data required |

Record Owner authorisation before any DROP in shared production databases.

## Data considerations

- Executions, history, and audit rows are SoR for the capability — export before destructive rollback if any pilot data must be preserved.
- Outbox rows may exist unprocessed (L-03) — safe to discard with tables if unused.

## Verification after rollback

- Workbench routes for Test Execution unavailable or non-registered
- `/api/v1/qep/executions` returns 404/503 as expected for rolled-back build
- Platform health remains green
- Other QEP capabilities unaffected
