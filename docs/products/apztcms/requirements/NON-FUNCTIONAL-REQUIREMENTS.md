# APZ TCMS — Non-Functional Requirements

> **Programme:** APZTCMS-REQ-001 · IDs: NFR-*

| ID      | Category            | Requirement                                                                           | Priority | Risk     | Acceptance criteria                                    |
| ------- | ------------------- | ------------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------------------ |
| NFR-001 | Performance         | Interactive UI actions p95 &lt; 2s under nominal load (measure in Architecture)       | P0       | High     | Performance targets documented; verified in later CERT |
| NFR-002 | Performance         | API list endpoints support pagination; avoid unbounded queries                        | P0       | High     | Pagination required on collection APIs                 |
| NFR-003 | Availability        | Target 99.5% for single-node self-hosted; HA optional enterprise                      | P1       | Medium   | SLO stated in ops model                                |
| NFR-004 | Scalability         | Support growth to enterprise project/case volumes via horizontal workers where needed | P1       | Medium   | Scaling model in Definition/Architecture               |
| NFR-005 | Reliability         | Idempotent ingestion of automated results; safe retries                               | P0       | High     | Duplicate run imports do not corrupt SoR               |
| NFR-006 | Accessibility       | WCAG AA for TCMS UI                                                                   | P0       | High     | a11y gate in product CERT                              |
| NFR-007 | Security            | Zero Trust on every TCMS API; Platform Authn/Authz                                    | P0       | Critical | No unauthenticated mutating routes                     |
| NFR-008 | Auditability        | Privileged and certification actions auditable and exportable                         | P0       | Critical | Audit records retained per RR-*                        |
| NFR-009 | Maintainability     | Manifest-first modules/services; typed contracts; no secrets in repo                  | P0       | High     | SDK/manifest compliance                                |
| NFR-010 | Extensibility       | New CI/ALM connectors via Integration SDK without redesigning SoR                     | P0       | Medium   | Connector pattern required                             |
| NFR-011 | Backup              | Platform PostgreSQL backup includes TCMS schemas                                      | P0       | High     | Backup includes TCMS SoR                               |
| NFR-012 | Recovery            | Documented RTO/RPO intent for TCMS SoR                                                | P0       | High     | RTO/RPO in Definition ops section                      |
| NFR-013 | Business Continuity | Degradation mode: read evidence/certs if write path impaired (intent)                 | P2       | Medium   | Degraded behaviour defined later                       |
| NFR-014 | Monitoring          | Health for TCMS services/connectors; metrics/logs/traces with correlation IDs         | P0       | High     | Health hierarchy reporting                             |
| NFR-015 | Maintainability     | Known limitations published per release                                               | P0       | Medium   | KNOWN-LIMITATIONS required                             |
