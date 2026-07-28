# Risk Register — APZQEP-ECR-001

| ID   | Risk                                                    | Likelihood | Impact | Mitigation (recommended, not implemented)                         |
| ---- | ------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------- |
| R-01 | Evidence access incorrectly allowed in production       | Medium     | High   | Inject EvidenceAccessPort check before Certification close        |
| R-02 | Events never reach consumers (outbox enqueue-only)      | High       | Medium | Deliver dispatcher before depending on async notify/search        |
| R-03 | Production DB bugs undetected (no PG integration tests) | Medium     | High   | Add Compose repository contract tests                             |
| R-04 | API contract drift without OpenAPI                      | Medium     | Medium | Publish OpenAPI and consumer contract tests                       |
| R-05 | Search index stale (no-op publisher)                    | Low        | Low    | Wire SearchPublication when Search programme ready                |
| R-06 | Certification starts without closing High limitations   | Medium     | High   | Owner gate: READY_WITH_LIMITATIONS → explicit Certification scope |

No risk is classified as an uncontrolled critical defect against baselined Wave scopes.
