# Performance Report

Measured 20260802T200331Z against local/certification PostgreSQL (not production-scale claim).

| Operation                     | Observation                                          |
| ----------------------------- | ---------------------------------------------------- |
| Cap A save/get                | Integration suite < 200ms wall for full file         |
| Optimistic concurrency reject | Immediate on conflict                                |
| Cap B–F factory + roundtrip   | Pass in integration suite                            |
| Outbox TX rollback            | Aggregate + outbox both absent after forced rollback |

Known limit: list/search still application-side tag/query filters for some Caps; large-tenant index tuning deferred.
