# Analytics Platform Services — Compatibility Matrix

> **Programme:** APZHUB-PLATFORM-ANALYTICS-004

| Dimension                      | Compatible                                                  |
| ------------------------------ | ----------------------------------------------------------- |
| `@apzhub/analytics-contracts`  | **0.1.0**                                                   |
| `@apzhub/integration-metabase` | **0.1.0** CERTIFIED_FOUNDATION                              |
| `@apzhub/platform-services`    | **0.27.0**                                                  |
| Integration SDK                | **1.0.0** (unchanged)                                       |
| AuthZ pipeline                 | `operation-authorization-map` analytics* ops                |
| Registry persistence           | In-memory MVP (Postgres SoR deferred)                       |
| Embed token issuance           | Metadata placeholder only — provider token issuance planned |
| Metrics / Reporting SoRs       | Link/ref only — no ownership                                |
| Future providers               | Swap `AnalyticsOpsProvider` — contracts unchanged           |
