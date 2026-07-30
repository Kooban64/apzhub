# Risk Register Update — APZQEP-OPS-001

| ID        | Risk                                                 | Likelihood | Impact | Mitigation / status                                           |
| --------- | ---------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------- |
| R-OPS-001 | Operators mistake memory runtime for durable SoR     | Medium     | High   | Explicit factory names + docs; ADR-0088 undecided             |
| R-OPS-002 | Process restart loses Evidence data                  | High       | High   | Accepted limitation until storage programme                   |
| R-OPS-003 | No Evidence health on `/api/health`                  | Medium     | Medium | Documented; platform health still covers host                 |
| R-OPS-004 | Module discovery does not scan `modules/` by default | Medium     | Medium | Workbench wired via QEP router; catalogue activation deferred |
| R-OPS-005 | Security audit not exported to SIEM/bus              | Medium     | Medium | Local audit only; event publication deferred                  |
| R-OPS-006 | Hash algorithm not implemented in Application        | Low        | Medium | Caller supplies hash; verifyIntegrity uses providedActualHash |
| R-OPS-007 | Certification attempted without storage              | Low        | High   | OPS-001 stops at Owner; cert not authorised                   |
| R-OPS-008 | TE regression from Evidence changes                  | Low        | High   | TE 1.0.1 untouched — **77 PASS**                              |

## Residual risk statement

Evidence Management may operate in **limited availability** with full understanding that persistence is ephemeral. Unrestricted production SoR use is a **certification / storage programme** concern, not OPS-001 scope.
