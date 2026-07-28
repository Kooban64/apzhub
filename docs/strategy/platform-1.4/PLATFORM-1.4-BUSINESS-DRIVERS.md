# Platform 1.4 Business Drivers

| Driver                                       | Business need                                                                                                      | Technical preference (not a driver alone) | Evidence                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------- |
| Production adoption of Notification Delivery | Operators need restart-safe delivery and recoverable queues before enabling in-app/external delivery in production | Prefer Postgres over process memory       | CERT-002 · ENG-004 P13-KL-ND-03             |
| Operational support burden                   | Support/ops need DLQ triage, diagnostics, and runbooks                                                             | Prefer more dashboards                    | CERT-002 ops residuals · ENG-003/004 config |
| Regulated-service readiness                  | POPIA formal approval before external notification                                                                 | Prefer SMTP immediately                   | P13-KL-ND-07                                |
| Reliability / trust                          | Capacity evidence before shared-host enablement                                                                    | Prefer Kubernetes redesign                | P13-KL-ND-08 · ENVIRONMENT coexistence      |
| Release quality honesty                      | Full regression + Playwright for release claim                                                                     | Prefer selective tests only               | CERT-002 NOT RUN gates                      |
| Provider independence                        | External delivery must remain interchangeable adapter, not product lock-in                                         | Prefer vendor SDK in modules              | ADR-0071                                    |
| Customer-impacting gaps                      | Attachment delete residual (Support) is secondary                                                                  | Prefer Support 2.0 chat                   | PL12-KL-05                                  |
| Portfolio sequencing                         | Keep Email SoR / Workflow Execute / FIN-001 gated until deliberate programmes                                      | Prefer unlock everything                  | PL12-KL-07…09                               |

## Separated conclusions

**Business need (authoritative for theme):** durable delivery operations, capacity evidence, compliance gate, and release-quality completeness.

**Not authorised as 1.4 drivers:** Email SoR productisation, Workflow Execute, FIN-001, WebSockets, marketing automation, bulk messaging.
