# Performance Recertification — APZQEP-150R

| Field     | Value                             |
| --------- | --------------------------------- |
| Result    | **PASS** (measured observational) |
| Timestamp | 20260803T065345Z                  |

## Measured values (this audit)

| Measurement                            | Value                                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Vitest Cap A–F + 150/151/152 suite     | **69 tests passed**                                                                           |
| Wall duration                          | **8.51 s**                                                                                    |
| Cap A–F unit tests                     | Suites 48ms · Plans 52ms · Workspace 51ms · Defects 45ms · Requirements 46ms · Reporting 61ms |
| PostgreSQL Cap persistence integration | **5 tests · 234 ms**                                                                          |
| Restart durability                     | **1 test · 114 ms**                                                                           |
| Multi-instance concurrency             | **1 test · 112 ms**                                                                           |
| Cap RBAC fail-closed                   | **10 tests · ~31 ms combined**                                                                |

## Not claimed

- Production-scale load / large-tenant benchmarks
- HTTP gateway latency under concurrent users (not measured in this audit)
- Direct `node` microbench of Cap packages failed (ESM resolution tooling) — **not** treated as product defect; Vitest path is authoritative for Cap unit timing

## Conclusion

No performance release blocker. Persistence and security overhead remain within observed certification timings.
