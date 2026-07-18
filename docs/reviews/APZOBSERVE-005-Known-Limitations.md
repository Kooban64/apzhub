# APZOBSERVE-005 — Known Limitations Register

| ID   | Limitation                                                | Gate impact                           | Production impact                                                 |
| ---- | --------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| L-01 | No Grafana provider                                       | Intentional                           | None for metadata plane                                           |
| L-02 | No Prometheus provider                                    | Intentional                           | None                                                              |
| L-03 | No Loki provider                                          | Intentional                           | None                                                              |
| L-04 | No OpenTelemetry provider                                 | Intentional                           | None                                                              |
| L-05 | No AlertManager provider                                  | Intentional                           | None                                                              |
| L-06 | No live metrics/logs/traces collection/ingest             | Intentional                           | None                                                              |
| L-07 | No alert evaluation/delivery                              | Intentional                           | None                                                              |
| L-08 | No incident-response execution                            | Intentional                           | None                                                              |
| L-09 | No Event Bus / AI                                         | Intentional                           | None                                                              |
| L-10 | Playwright live webServer LIMITED (Testing slug conflict) | LIMITED                               | Residual E2E env risk; mock-routed + unit coverage authoritative  |
| L-11 | Live PostgreSQL integration may be LIMITED in CI          | LIMITED                               | Mitigated by production factory requiring postgresDb + migrations |
| L-12 | Branch coverage may be &lt;95% on aggregate               | Accepted if critical branches covered | Documented residual                                               |

These are **not** architecture defects unless the platform claims live telemetry providers.
