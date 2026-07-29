# DEFECT-REGISTER — APZQEP-CERT-002

| ID           | Severity | Title                                                                                                           | Disposition                                                                |
| ------------ | -------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| —            | Critical | —                                                                                                               | **None**                                                                   |
| —            | High     | —                                                                                                               | **None**                                                                   |
| D-CERT002-01 | Medium   | Playwright authenticated Workbench journeys timed out (8/10); no L-02 deny/allow browser specs                  | Limitation — does not prove L-02 bypass; blocks unrestricted GA confidence |
| D-CERT002-02 | Medium   | Production baseline evidence policy is coarse (URI scheme + authenticated actor), not fine-grained Evidence ACL | Documented REM design; monitor for GA; not L-02 default-allow              |
| D-CERT002-03 | Low      | Prettier style drift in 5 REM-001 source files                                                                  | Non-security; fix under patch packaging if Owner requires                  |
| D-CERT002-04 | Low      | Handler unit tests mock gateway (enforcement proven in application tests)                                       | Acceptable with source wiring inspection                                   |

## Counts

| Severity | Count |
| -------- | ----: |
| Critical |     0 |
| High     |     0 |
| Medium   |     2 |
| Low      |     2 |
