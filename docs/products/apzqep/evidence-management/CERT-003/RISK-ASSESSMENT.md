# Risk Assessment — APZQEP-CERT-003

| ID   | Risk                                                                                  | Severity | Classification                            | Disposition                                                                                            |
| ---- | ------------------------------------------------------------------------------------- | -------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| R-01 | Process restart loses Evidence metadata/content/audit (memory)                        | **High** | Intentional deferral (ADR-0088)           | Accept for LIMITED_AVAILABILITY; block GA / durable SoR                                                |
| R-02 | No Evidence-specific health/metrics/traces                                            | Medium   | Intentional deferral                      | Accept; platform ops covers host process                                                               |
| R-03 | Domain events not published to platform bus                                           | Medium   | Intentional deferral                      | Accept; no async fan-out                                                                               |
| R-04 | Tenant-wide list/search for `qep.evidence.read` without per-item ACL filter (L-EM-01) | **High** | Residual of ENG-110E Owner-accepted model | Owner risk acceptance required for LIMITED_AVAILABILITY; remediation only via separate ENG if declined |
| R-05 | Workbench capture may use demo/placeholder content hash in UI path                    | Medium   | Integrity posture limitation              | Accept for controlled demos; not for forensic SoR                                                      |
| R-06 | Package remains **0.0.0**                                                             | Low      | SemVer / Freeze concern                   | Version promotion outside CERT-003                                                                     |
| R-07 | Module-root discovery / service.yaml live registration incomplete                     | Low      | Ops deferral                              | Documented; shell routes still wired                                                                   |

## Owner risk acceptance (required for recommended class)

Accept R-01…R-05 as limitations of LIMITED_AVAILABILITY.

If **R-04 / L-EM-01** is declined, Certification recommendation becomes **RETURN TO ENGINEERING** for filtered enumeration only — not a mandate to implement ADR-0088 storage under CERT-003.
