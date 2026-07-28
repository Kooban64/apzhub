# ADR-0073 Risk Register

| ID     | Risk                                   | Severity | Mitigation                          |
| ------ | -------------------------------------- | -------- | ----------------------------------- |
| R73-01 | ENG implements memory dual-SoR forever | High     | Cutover flag + CERT checks          |
| R73-02 | Lease bugs → duplicate send            | High     | Tests · provider_ref · max attempts |
| R73-03 | DB hotspot on queue index              | Medium   | Indexes · batch limits · E02        |
| R73-04 | Email SoR creep via provider_ref       | High     | Exclusions · ADR-0074 scope         |
| R73-05 | Skip capacity evidence                 | Medium   | Gate enablement on E02              |
| R73-06 | Event-as-queue regression              | High     | This ADR forbids                    |
| R73-07 | Destructive migration temptation       | Critical | Additive only                       |
