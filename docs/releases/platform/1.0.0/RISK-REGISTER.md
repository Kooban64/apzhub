# APZHUB Platform 1.0.0 — Risk Register

| ID   | Risk                                            | Likelihood | Impact | Mitigation                                        |
| ---- | ----------------------------------------------- | ---------- | ------ | ------------------------------------------------- |
| R-01 | Stale docs contradict disk                      | Medium     | Medium | AI-MANIFEST + SemVer evidence packs authoritative |
| R-02 | Cross-product coupling / bypass                 | Low        | High   | Architecture gates · PDS · frozen SDK             |
| R-03 | Secret leakage                                  | Low        | High   | Zero Trust · secrets never in repo                |
| R-04 | Over-claiming polish (Law UX, stubs)            | Medium     | Medium | KL register · PRWL class                          |
| R-05 | Premature Financial Engine extraction           | Medium     | High   | FIN-001 DEFER held                                |
| R-06 | Engine brand leakage in UX                      | Low        | Medium | Naming standards · reviews                        |
| R-07 | Host coexistence disruption                     | Medium     | High   | ENVIRONMENT.md · Owner approval for ops changes   |
| R-08 | Programme ID confusion (PORTFOLIO-001 dual use) | Medium     | Low    | Disambiguation note in platform release README    |
| R-09 | Unauthorised Patch/Minor/Major                  | Medium     | Medium | Release naming standard · Owner gates             |

No new residual risk authorised engineering under this documentation programme.
