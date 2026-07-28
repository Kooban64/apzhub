# PostgreSQL Validation — Platform-1.4-OR-001

> **Date:** 2026-07-23 · Host: `apzhub-postgres` (port 54334) · **No product code changes**

## Schema deployment status (live)

| Artefact                                            | Expected           | Observed on live DB                           | Result      |
| --------------------------------------------------- | ------------------ | --------------------------------------------- | ----------- |
| Migration journal through **0067**                  | Present in repo    | Journal has idx 65–67                         | Repo **OK** |
| Applied migrations count                            | ≥ 68 (0–67)        | **61** rows in `drizzle.__drizzle_migrations` | **GAP**     |
| `platform_notification_delivery_record`             | Present after 0065 | `to_regclass` → **NULL**                      | **ABSENT**  |
| `platform_notification_delivery_try`                | Present            | **ABSENT**                                    | **ABSENT**  |
| Lease columns (0066)                                | Present            | N/A (base table missing)                      | **ABSENT**  |
| `platform_notification_delivery_admin_audit` (0067) | Present            | **ABSENT**                                    | **ABSENT**  |

### Defect (not remediated)

**OR-DEF-001** — Live `apzhub-postgres` has **not** applied migrations **0065–0067** (and appears behind journal for **0062+**). Durable delivery SoR tables are not deployed. **Do not migrate under OR-001.** Remediation requires a separate Owner-approved change/deployment programme.

## Engine capability probes (throwaway table)

A temporary table `or001_validation_probe` was created, exercised, and **DROPPED**. No durable product schema was altered.

| Scenario                                                                             | Observed                                                                                                               |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `FOR UPDATE SKIP LOCKED` claim (batch 1000 of 5000)                                  | **PASS** — 1000 rows claimed; `psql \timing` **20.862 ms**                                                             |
| Two concurrent workers claim LIMIT 50                                                | **PASS** — wA=50, wB=50; aggregate shows no double-claim; `comm` overlap line-count artefact = 1 (blank), IDs disjoint |
| Lease expiry → reclaim to `retry_scheduled` when `attempt_count>0`                   | **PASS** (probe SQL mirroring reclaim CTE)                                                                             |
| Stale fence token update (`tok-wrong`)                                               | **PASS** — 0 rows updated                                                                                              |
| Correct fence token completion                                                       | **PASS** — row → `delivered`                                                                                           |
| Application store live claim against `platform_notification_delivery_record`         | **NOT RUN** — table absent (OR-DEF-001)                                                                                |
| Multiple durable workers / graceful shutdown / worker restart against product tables | **NOT RUN** — blocked by OR-DEF-001                                                                                    |
| Retry / DLQ durability on product tables                                             | **NOT RUN** — blocked by OR-DEF-001                                                                                    |
| Transaction integrity on product claim SQL                                           | **NOT RUN** on product tables; CTE pattern validated on probe                                                          |

## In-memory / mocked suite (proxy evidence)

| Suite                                                            | Result               |
| ---------------------------------------------------------------- | -------------------- |
| `claim-lease-engine.test.ts` (8)                                 | **PASS**             |
| `notification-delivery-persistence-postgres.test.ts` (mocked, 3) | **PASS**             |
| eng001b-p2/p3 worker+dispatch tests                              | **PASS** (in-memory) |

## Verdict

PostgreSQL **engine** SKIP LOCKED / reclaim / fencing pattern: **validated** on throwaway probe.  
PostgreSQL **product durable runtime schema**: **not deployed** on live DB — **OR-DEF-001**. Full product live validation **incomplete pending migration deployment** (separate programme).
