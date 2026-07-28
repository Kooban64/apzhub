# APZHUB Platform 1.0.0 — Operational Matrix

| Domain                         | Control                                                      | Portfolio posture             |
| ------------------------------ | ------------------------------------------------------------ | ----------------------------- |
| Health                         | Platform → workspace → module → service → connector → engine | Required hierarchy (014)      |
| Logs / metrics / traces        | Structured · correlation IDs                                 | Platform observability planes |
| Secrets                        | Refs only · never in repo/logs                               | Mandatory (013)               |
| Backups                        | PostgreSQL + blob stores                                     | Operator responsibility       |
| Rate limits / circuit breakers | Gateway / connectors                                         | Standards held                |
| Workers                        | Outbox / event relay identities                              | Least privilege               |
| Admin console                  | Administration Workspace permission-gated                    | Mask engine dashboards        |
| Host coexistence               | ENVIRONMENT.md                                               | Non-disruptive                |

Details: [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md).
