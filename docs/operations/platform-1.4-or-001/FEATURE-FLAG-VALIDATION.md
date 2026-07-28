# Feature Flag Validation — Platform-1.4-OR-001

> **Flag:** `APZHUB_NOTIFICATION_DURABLE_RUNTIME`  
> **Date:** 2026-07-23

## Default OFF

| Check                                                            | Observed               | Result   |
| ---------------------------------------------------------------- | ---------------------- | -------- |
| `isNotificationDurableRuntimeEnabled({})`                        | `false`                | **PASS** |
| `isNotificationDurableRuntimeEnabled(process.env)` (shell unset) | `false`                | **PASS** |
| `.env` explicit assignment                                       | Not set                | **PASS** |
| `.env.example` / `.env.production.example`                       | Commented example only | **PASS** |
| eng001b-p0 / p4 tests asserting default OFF                      | **PASS**               | **PASS** |

## Selection matrix (helper)

| Env value     | Enabled? |
| ------------- | -------- |
| unset / empty | false    |
| `false`       | false    |
| `true`        | true     |
| `on`          | true     |
| `1`           | true     |

## Runtime selection / rollback (code-path evidence)

| Scenario                                                  | Evidence                                                                      | Result                   |
| --------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| Runtime OFF                                               | Process-local Maps path remains; durable admin works with flag OFF (P4 tests) | **PASS** (unit)          |
| Runtime ON                                                | Durable store + worker paths behind flag (P2/P3 tests with flag ON fixtures)  | **PASS** (unit)          |
| Startup / shutdown                                        | Worker start/stop covered in eng001b-p2/p3 tests                              | **PASS** (unit)          |
| Rollback = leave/set flag OFF                             | Design + helper deny-by-default; no default ON in examples                    | **PASS** (config review) |
| Live process with flag ON against deployed durable schema | **NOT RUN** — schema absent (OR-DEF-001); flag left OFF                       | **NOT RUN**              |

## Confirm

**`APZHUB_NOTIFICATION_DURABLE_RUNTIME` continues to default OFF.** No change made to enable it.
