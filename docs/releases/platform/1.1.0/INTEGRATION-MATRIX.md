# APZHUB Platform 1.1.0 — Integration Matrix

> Updated from [Platform 1.0.0 INTEGRATION-MATRIX](../1.0.0/INTEGRATION-MATRIX.md) · PORTFOLIO XI-* posture

| ID    | Interaction              | 1.0.0 posture                   | 1.1.0 posture                                                           |
| ----- | ------------------------ | ------------------------------- | ----------------------------------------------------------------------- |
| XI-01 | Support → Projects link  | Not delivered                   | Still not delivered (AU-01); Support events now publish                 |
| XI-02 | Projects → Time link     | Not delivered                   | Unchanged                                                               |
| XI-06 | Workflow triggers        | Metadata only                   | AutomationFoundation can record deferred trigger intents; execute gated |
| XI-07 | Notification events      | Projects path; Support excluded | **Support in-app ENF Attention wired**                                  |
| XI-08 | Search federation        | Operational                     | Held                                                                    |
| XI-09 | Activity timeline        | Partial                         | Law durable stores; Support activity still limited                      |
| XI-10 | Global audit             | Platform-owned                  | Held                                                                    |
| XI-11 | Cross-product navigation | Shell prefixes                  | Held                                                                    |

| Adapter        | Version             | Certification                     |
| -------------- | ------------------- | --------------------------------- |
| Plane          | (integration-plane) | Production path                   |
| Kimai          | **0.2.0**           | CERTIFIED_DOMAIN                  |
| Zammad         | **0.6.0**           | CERTIFIED_WITH_LIMITATIONS        |
| Metabase       | **0.1.0**           | CERTIFIED_FOUNDATION              |
| n8n            | **0.1.0**           | CERTIFIED_FOUNDATION (no execute) |
| GitHub Actions | (testing)           | Frozen CI path                    |
| Meilisearch    | (search)            | Search Publication freeze applies |
