# Decision Matrix

Scoring: 1=poor · 3=adequate · 5=strong. Selected = highest total with constraint fit.

| Criterion                            | A Postgres | B +Redis | C Bus/Outbox | D Broker | E Process-local |
| ------------------------------------ | ---------: | -------: | -----------: | -------: | --------------: |
| Durability                           |          5 |        4 |            3 |        4 |               1 |
| Restart recovery                     |          5 |        4 |            3 |        4 |               1 |
| Duplicate-delivery control           |          5 |        4 |            2 |        3 |               2 |
| Idempotency                          |          5 |        5 |            3 |        3 |               3 |
| Retry durability                     |          5 |        4 |            3 |        4 |               1 |
| Dead-letter durability               |          5 |        4 |            2 |        4 |               1 |
| Replay safety                        |          5 |        4 |            3 |        3 |               2 |
| Operational visibility               |          5 |        4 |            3 |        4 |               2 |
| Administrative control               |          5 |        4 |            2 |        3 |               2 |
| Tenant/org isolation                 |          5 |        5 |            4 |        3 |               4 |
| Security/audit                       |          5 |        4 |            4 |        3 |               3 |
| POPIA relevance (control)            |          4 |        4 |            3 |        3 |               2 |
| Database impact                      |          4 |        4 |            3 |        2 |               5 |
| Infrastructure impact                |          5 |        3 |            4 |        1 |               5 |
| Operational complexity               |          4 |        2 |            3 |        1 |               5 |
| Shared-host suitability              |          5 |        3 |            4 |        2 |               3 |
| Horizontal scalability               |          4 |        4 |            3 |        5 |               1 |
| Platform neutrality                  |          5 |        4 |            5 |        2 |               5 |
| Provider independence                |          5 |        5 |            5 |        5 |               5 |
| Compatibility (ADR-0071/0065)        |          5 |        4 |            3 |        2 |               2 |
| Migration complexity                 |          4 |        3 |            3 |        2 |               5 |
| Testability                          |          5 |        3 |            3 |        2 |               4 |
| Failure-mode clarity                 |          5 |        3 |            2 |        3 |               2 |
| Implementation risk                  |          4 |        3 |            3 |        2 |               2 |
| Maintenance burden                   |          4 |        2 |            3 |        2 |               3 |
| Cost                                 |          5 |        3 |            4 |        2 |               5 |
| Future extensibility                 |          5 |        4 |            3 |        4 |               1 |
| Alignment with accepted architecture |          5 |        3 |            3 |        1 |               1 |
| **Total**                            |    **128** |  **105** |       **88** |   **81** |          **76** |

## Selection

**Option A — PostgreSQL-Owned Durable Runtime** selected.

Option B may be revisited later as a non-SoR wake-up optimisation under a separate decision if capacity evidence demands it — **not** part of ADR-0073 mandatory architecture.
