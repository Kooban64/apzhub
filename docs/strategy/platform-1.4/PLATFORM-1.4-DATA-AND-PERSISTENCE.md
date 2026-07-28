# Platform 1.4 Data and Persistence

## Assessment

| Topic                   | Assessment                                                           |
| ----------------------- | -------------------------------------------------------------------- |
| PostgreSQL ownership    | Platform SoR remains Postgres                                        |
| Redis                   | Retain for cache/session as today; not authoritative delivery SoR    |
| Process-local state     | **Must be retired for production notification runtime** (theme MUST) |
| Migration 0065          | Schema ready; runtime wiring is the gap                              |
| Outbox                  | Candidate coordination with durable delivery — ADR-0073              |
| Event replay            | Retain correlation/idempotency                                       |
| Retry / DLQ persistence | Required under durable runtime                                       |
| Retention / archive     | Define under COMP-001 / ENG-001                                      |
| Backup / restore        | Ops expectation; no new DB technology                                |
| Tenant separation       | Retain RLS / tenant columns patterns                                 |

## ADR trigger

Any change to persistence ownership of delivery queue/retry/DLQ → **ADR-0073**.

## Explicit

Do **not** introduce a new database technology under Platform 1.4 ARCH-001 or without future ADR.
