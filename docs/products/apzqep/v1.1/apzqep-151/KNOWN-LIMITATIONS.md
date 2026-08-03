# Known Limitations — APZQEP-151

Product Board classifications (20260803T062200Z). None reopen APZQEP-151.

| #   | Limitation                                                          | Classification                            | Notes                                                                   |
| --- | ------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Controlled `pg_restore` drill not executed in agent session         | **Operational Certification Requirement** | Complete before production deployment; not a release blocker for RB-001 |
| 2   | Some Cap list filters (tags/query) apply in-process after SQL fetch | **Medium Risk**                           | Acceptable on bounded datasets; future optimisation if scale requires   |
| 3   | No migration of historical in-memory Cap data                       | **Accepted**                              | Never production-authoritative; nothing to migrate                      |
| 4   | Cap aggregate JSONB + indexed scalar columns                        | **Accepted**                              | Governed DDD pattern; indexed fields remain query SoR                   |
| 5   | Package versions remain 0.1.0                                       | **Correct**                               | Promotion after production certification                                |
| 6   | Cap F reporting facts remain derived                                | **By design**                             | Only saved-report metadata / optional trend samples are Cap F SoR       |
| 7   | RB-002 remains OPEN                                                 | **Separate programme**                    | APZQEP-152 when Owner authorised                                        |
