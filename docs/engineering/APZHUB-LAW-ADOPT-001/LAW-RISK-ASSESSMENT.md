# LAW-RISK-ASSESSMENT

| Field     | Value                |
| --------- | -------------------- |
| Programme | APZHUB-LAW-ADOPT-001 |
| Timestamp | 20260803T100641Z     |

| ID    | Risk                                                                                        | Likelihood | Impact | Mitigation (not implemented)                          |
| ----- | ------------------------------------------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------- |
| LR-01 | Status confusion (In Development vs Production ACCEPTED) causes wrong engineering decisions | High       | High   | LAW-ADOPT-002 authoritative PRODUCT-STATUS            |
| LR-02 | Engineering starts before governance alignment                                              | Medium     | High   | Board gate; eng authority CLOSED until 003 Owner Auth |
| LR-03 | ES non-citation → non-conformant future slices                                              | Medium     | High   | ES mapping in 002 before 003                          |
| LR-04 | Ops gap → GA claim under ENG-003 without standing ops                                       | Medium     | High   | LAW-ADOPT-005 before Board adoption cert              |
| LR-05 | Layer drift (app-local services) vs platform model                                          | Medium     | Medium | Scoped eng in 003 if Board requires                   |
| LR-06 | OpenAPI/runtime mismatch creates support risk                                               | Medium     | Medium | Verify in 003/004                                     |
| LR-07 | Parallel modernisation of other products dilutes pilot                                      | Medium     | Medium | Keep Law as sole active adoption product              |

Overall risk posture for proceeding to **engineering now**: **UNACCEPTABLE**. Proceed to Board review of this assessment, then Governance Alignment (002).
