# Known Limitations — Platform-1.4-OR-001

| ID       | Limitation                                                                                                        | Source                             |
| -------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| OR-KL-01 | Live Postgres missing durable delivery migrations **0065–0067** (and behind journal for earlier 0062+)            | Live DB inspection                 |
| OR-KL-02 | No automated live SKIP LOCKED / multi-worker suite wired to `DATABASE_URL` for notification-delivery-persistence  | Repo evidence (P1–P4 TEST-RESULTS) |
| OR-KL-03 | Durable runtime default OFF; process-local retained — dual-path operational complexity                            | ADR-0073 / ENG-001B                |
| OR-KL-04 | Admin metrics are process-scoped counters, not a global Prometheus redesign                                       | ENG-001B-P4                        |
| OR-KL-05 | SMTP / Email SoR / WebSockets / Workflow Execute / FIN-001 still excluded                                         | Platform freezes                   |
| OR-KL-06 | Web admin HTTP bootstrap defaults to in-memory durable store until DB bind                                        | ENG-001B-P4 KNOWN-LIMITATIONS      |
| OR-KL-07 | Full product live worker lifecycle (restart, graceful shutdown) not exercised on this host against product tables | OR-DEF-001                         |

Inherited engineering KLs remain in ENG-001B-P3/P4 packs.
