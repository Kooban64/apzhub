# ENG-100B Risk Register (planning only)

| ID   | Risk                                       | Mitigation                                                        |
| ---- | ------------------------------------------ | ----------------------------------------------------------------- |
| R-01 | Inventing method shapes beyond OES         | Trace every type to PART-02; escalate gaps                        |
| R-02 | Leak Application concerns into Domain      | Boundary tests; no port impl in Domain                            |
| R-03 | Outcome derivation ambiguity               | Follow ARCH-015/OES derivation policy; escalate if underspecified |
| R-04 | Scope creep into persistence               | Hard stop — ENG-100D only                                         |
| R-05 | Conflict with frozen Plans/Specs contracts | Reference-only; SourceResolutionPort remains Application/Infra    |
