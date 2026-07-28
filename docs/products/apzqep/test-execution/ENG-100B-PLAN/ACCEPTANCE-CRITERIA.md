# ENG-100B Acceptance Criteria (planning only)

| ID    | Criterion                                                              |
| ----- | ---------------------------------------------------------------------- |
| AC-01 | `TestExecution` aggregate is sole transactional Domain boundary        |
| AC-02 | Commands match OES catalogue; no silent status writes                  |
| AC-03 | Sealed manifest immutable after prepare/start                          |
| AC-04 | Lifecycle matches APPENDIX-B                                           |
| AC-05 | Invariants enforced in Domain                                          |
| AC-06 | Domain events raised (not published)                                   |
| AC-07 | Domain remains dependency-free of I/O frameworks                       |
| AC-08 | Tests cover happy path + illegal transitions                           |
| AC-09 | No API / Workbench / persistence code in this Wave                     |
| AC-10 | Wave stops at IMPLEMENTED / AWAITING OWNER ENGINEERING WAVE 2 DECISION |
