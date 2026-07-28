# APZ QEP — Non-Functional Requirements

> **Programme:** APZQEP-REQ-001 · IDs: NFR-*

| ID      | Category            | Requirement                                                                  | Priority | Risk     | Acceptance criteria                        |
| ------- | ------------------- | ---------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------ |
| NFR-001 | Performance         | Interactive UI actions p95 < 2s under nominal load (measure in Architecture) | P0       | High     | Targets documented; verified in later CERT |
| NFR-002 | Performance         | API collections paginated; no unbounded queries                              | P0       | High     | Pagination on list APIs                    |
| NFR-003 | Availability        | Target 99.5% single-node self-hosted; HA optional enterprise                 | P1       | Medium   | SLO in ops model                           |
| NFR-004 | Scalability         | Grow to enterprise volumes via horizontal workers where needed               | P1       | Medium   | Scaling model in Definition/Architecture   |
| NFR-005 | Reliability         | Idempotent ingestion of automated/continuous results; safe retries           | P0       | High     | Duplicate imports do not corrupt SoR       |
| NFR-006 | Accessibility       | WCAG AA for QEP UI                                                           | P0       | High     | a11y gate in product CERT                  |
| NFR-007 | Security            | Zero Trust on every QEP API; Platform Authn/Authz                            | P0       | Critical | Align SEC-*                                |
| NFR-008 | Auditability        | Privileged and certification actions auditable and exportable                | P0       | Critical | Align RR-*                                 |
| NFR-009 | Observability       | Health, metrics, logs, traces with correlation IDs                           | P0       | High     | Health hierarchy reporting                 |
| NFR-010 | Maintainability     | Manifest-first modules/services; typed contracts; no secrets in repo         | P0       | High     | SDK/manifest compliance                    |
| NFR-011 | Extensibility       | New CI/ALM/AI/MCP connectors via Integration SDK without SoR redesign        | P0       | Medium   | Connector pattern required                 |
| NFR-012 | Business Continuity | Degraded read of evidence/certs if write path impaired (intent)              | P2       | Medium   | Degraded behaviour defined later           |
| NFR-013 | Disaster Recovery   | Documented RTO/RPO intent for QEP SoR                                        | P0       | High     | RTO/RPO in Definition ops section          |
| NFR-014 | Backup              | Platform PostgreSQL backup includes QEP schemas                              | P0       | High     | Backup includes QEP SoR                    |
| NFR-015 | Compliance          | Support POPIA/GDPR/ISO/SOC intent without Platform freeze violations         | P0       | High     | Align SECURITY-REQUIREMENTS                |
| NFR-016 | Known limitations   | Publish limitations per release/edition                                      | P0       | Medium   | KNOWN-LIMITATIONS required                 |
| NFR-017 | AI performance      | AI suggestions async where long-running; never block certification UI path   | P1       | Medium   | Async jobs for AI generation               |
