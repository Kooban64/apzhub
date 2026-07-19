# Kimai Integration — Feature Detection

> **Programme:** APZHUB-INTEGRATION-KIMAI-002

| Probe        | Endpoint                                                     | Role                                    |
| ------------ | ------------------------------------------------------------ | --------------------------------------- |
| Ping         | `GET /api/ping`                                              | Connectivity / health                   |
| Version      | `GET /api/version`                                           | Compatibility                           |
| Domain lists | `GET /api/timesheets` (+ activities/customers/projects/tags) | Domain availability (via core services) |

`detectKimaiFeatures` records foundation probe results and notes domain CE API scope. Optional domain failures never alone prevent adapter construction; readiness/certification reflect availability.
