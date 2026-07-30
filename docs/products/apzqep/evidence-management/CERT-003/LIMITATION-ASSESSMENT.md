# Limitation Assessment — APZQEP-CERT-003

Limitations are classified as **intentional architectural deferrals**, **Owner-accepted residual model**, or **out-of-scope product depth** — not unauthorised defects.

| ID           | Limitation                                                                         | Class                        | Blocks GA?                   | Blocks LIMITED_AVAILABILITY?       |
| ------------ | ---------------------------------------------------------------------------------- | ---------------------------- | ---------------------------- | ---------------------------------- |
| L-EM-STOR-01 | Durable storage undecided (ADR-0088); runtime memory                               | Deferral                     | **Yes** (durable SoR)        | No (if accepted)                   |
| L-EM-OBS-01  | No Evidence-specific health/metrics/traces                                         | Deferral                     | Recommended                  | No                                 |
| L-EM-EVT-01  | Event bus publication not implemented                                              | Deferral                     | Recommended                  | No                                 |
| L-EM-01      | list/search: permission + tenant scope only; no per-item ACL filter on enumeration | Residual (ENG-110E accepted) | Recommended remediation path | **Owner risk acceptance required** |
| L-EM-UI-01   | Workbench audit/preview/download surfaces incomplete vs full PART-04 vision        | Scope accepted ENG-110F      | No for LA                    | No                                 |
| L-EM-HASH-01 | Hash supplied by caller; platform hashing deferred                                 | Deferral                     | Recommended for forensic SoR | No for LA demos                    |
| L-EM-VER-01  | Package **0.0.0** pending Freeze/Release                                           | Process                      | N/A                          | No                                 |

## Defect vs limitation

| Finding                               | Defect?         | Why                                                                                                      |
| ------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| Memory persistence                    | No              | ADR-0088 + wave exclusions                                                                               |
| Missing Evidence metrics              | No              | Explicitly deferred                                                                                      |
| No event publish                      | No              | Explicitly deferred                                                                                      |
| List without ACL filter               | No (residual)   | Explicitly coded + Owner-accepted in ENG-110E (`operationRequiresEvidenceResource` excludes list/search) |
| SQL / provider / bus secretly present | Would be defect | **Not found**                                                                                            |

## Traceability

Deferred register: [../OPS-001/DEFERRED-IMPLEMENTATION-REGISTER.md](../OPS-001/DEFERRED-IMPLEMENTATION-REGISTER.md)  
ADR: [ADR-0088](../../../../adr/ADR-0088-evidence-storage-abstraction.md)
