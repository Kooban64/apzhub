# REM-001-TRACEABILITY — APZQEP-CERT-002

| Trace ID | Requirement / finding                 | Implementation                                       | Test evidence                                    | CERT-002 verification                   |
| -------- | ------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ | --------------------------------------- |
| TR-01    | CERT-001 L-02 default-allow           | Fail-closed `createEvidenceAccessPort`               | `evidence-access-port.test.ts` unconfigured deny | Source inspection + re-run PASS         |
| TR-02    | RA-02 mandatory pre-GA remediation    | REM-001 accepted; candidate 1.0.1-rc.1               | REM-001 pack                                     | Owner acceptance recorded               |
| TR-03    | Silent `if (!check) return` removed   | `if (!check) deny(...)`                              | port tests                                       | Confirmed in source                     |
| TR-04    | Optional associate skip removed       | `evidenceAccess` required; always `assertAccessible` | enforcement tests                                | Confirmed in command service            |
| TR-05    | Typed decisions                       | `EvidenceAccessDecision` outcomes                    | ports + tests                                    | Contract inspection PASS                |
| TR-06    | Indeterminate / null / undefined deny | `normalizeCheckResult` → indeterminate → forbid      | port tests                                       | PASS                                    |
| TR-07    | Adapter exception deny                | catch → unavailable → forbid                         | port + enforcement                               | PASS                                    |
| TR-08    | Production wiring affirmative         | bootstrap + factory baseline check                   | bootstrap inspection                             | PASS                                    |
| TR-09    | Cross-tenant                          | tenant-keyed repo; get → null                        | enforcement test                                 | PASS                                    |
| TR-10    | Deny audit                            | `evidence_access_denied`                             | enforcement test                                 | PASS                                    |
| TR-11    | Authorised associate                  | allow / baseline                                     | enforcement + port                               | PASS                                    |
| TR-12    | API route enforcement                 | POST evidence-references → service.associateEvidence | handler source + handler tests                   | Wiring PASS; handler unit mocks service |
| TR-13    | Workbench non-authority               | `availableActions` / no client grant                 | available-actions tests + view source            | PASS by design                          |
| TR-14    | No migration                          | none introduced                                      | schema inspection                                | PASS                                    |
| TR-15    | Candidate identity                    | 1.0.1-rc.1 markers                                   | architecture-boundaries test                     | PASS                                    |

## Gap analysis

No open remediation requirement from L-02 without corresponding implementation and automated evidence. Residual: browser L-02 deny/allow scenarios not covered by dedicated Playwright specs (existing E2E mocks associate success).
