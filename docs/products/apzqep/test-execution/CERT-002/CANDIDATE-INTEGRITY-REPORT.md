# CANDIDATE-INTEGRITY-REPORT — APZQEP-CERT-002

## Identity

| Marker                       | Value                                                             | Verified |
| ---------------------------- | ----------------------------------------------------------------- | -------- |
| package.json version         | `1.0.1-rc.1`                                                      | Yes      |
| `QEP_TEST_EXECUTION_VERSION` | `1.0.1-rc.1`                                                      | Yes      |
| Programme marker             | `APZQEP-REM-001 — L-02 SECURITY REMEDIATION CANDIDATE 1.0.1-rc.1` | Yes      |
| module.yaml version          | `1.0.1-rc.1`                                                      | Yes      |
| Stale `1.0.0-rc.1` identity  | Absent on package markers                                         | Yes      |
| Production baseline identity | Remains documented as **1.0.0**                                   | Yes      |

## Change classification vs 1.0.0

| Class                       | Examples                                                                  |
| --------------------------- | ------------------------------------------------------------------------- |
| Required L-02 remediation   | evidence-access-port, command service, factories, bootstrap               |
| Required tests              | evidence-access-port.test.ts, evidence-access-enforcement.service.test.ts |
| Required version/docs       | package.json, module.yaml, REM-001 pack, indexes                          |
| Unrelated functional change | **None identified** in product behaviour outside L-02                     |

## Conclusion

Candidate identity is clean and reproducible via workspace sources. Unrelated functional change: **none**. Suitable input to patch freeze (recommendation).
