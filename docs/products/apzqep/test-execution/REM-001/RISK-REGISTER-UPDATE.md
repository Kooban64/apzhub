# RISK-REGISTER-UPDATE — APZQEP-REM-001

| ID           | Related                                | Prior disposition                          | Update under REM-001                                                                | Binding?                                      |
| ------------ | -------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------- |
| RA-02        | L-02 EvidenceAccessPort default-allow  | Accepted with mandatory pre-GA remediation | Engineering remediation **implemented** in candidate **1.0.1-rc.1**; **not closed** | **Yes** until Owner acceptance after CERT-002 |
| R-01 (ECR)   | Incorrect evidence allow in production | Open / mitigated by LA controls            | Mitigated in candidate by fail-closed + bootstrap wiring                            | Pending verification                          |
| SEC-01 (ECR) | Default-allow when check not injected  | Certification limitation                   | Code path removed; residual = verification                                          | Pending verification                          |

## Recommendation

Do **not** close RA-02 under REM-001. Keep Limited Availability controls until CERT-002 and Owner Security Remediation Decision.

## Unchanged risks (not in scope)

| ID             | Topic                         | Status                      |
| -------------- | ----------------------------- | --------------------------- |
| L-01 / related | OpenAPI deferred              | Open (accepted for release) |
| L-03           | Outbox enqueue-only           | Open (accepted for release) |
| L-04           | No Postgres integration tests | Open (accepted with RA)     |
