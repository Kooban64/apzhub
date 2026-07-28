# Known Limitations — Platform-1.4-ENG-001B-P4

| Limitation                          | Notes                                                                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Durable runtime default OFF         | Admin tooling only; no cut-over                                                                                                   |
| Process-local Maps runtime retained | Intentional dual path until later phase                                                                                           |
| Admin metrics process-scoped        | In-memory counters on admin service instance; not a global Prometheus registry redesign                                           |
| Postgres live admin path            | Unit tests use in-memory store; Postgres path present but live DB admin E2E not claimed unless executed                           |
| HTTP listing filters                | Handler uses fixed limit defaults; full query-string filter surface may expand later                                              |
| No Administration Workspace UI      | API/service only — no shell module                                                                                                |
| No SMTP / providers                 | Explicitly out of scope                                                                                                           |
| Bootstrap default store             | Web bootstrap starts with in-memory durable store; bind Postgres via `bindNotificationDeliveryAdminStoreFromDb` when DB available |

## Non-claims

- Production cut-over not performed
- Feature flag not enabled
- Phase 5 not started
