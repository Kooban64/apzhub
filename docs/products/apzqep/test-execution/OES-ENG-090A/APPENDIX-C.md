# APZQEP-OES-ENG-090A — APPENDIX C — Invariants & Business Rules Catalogue

## Domain invariants

| ID   | Rule                                                                    |
| ---- | ----------------------------------------------------------------------- |
| I-01 | No `in_progress` without sealed manifest + authorised source refs       |
| I-02 | Sealed source versions never silently change after start                |
| I-03 | Completed/accepted not altered except correction policy / supersession  |
| I-04 | `passed` requires actual result when manifest requires one              |
| I-05 | Evidence refs only when association permitted                           |
| I-06 | `cancelled` rejects ordinary completion                                 |
| I-07 | UI actions never invent transitions (`availableActions` sole authority) |
| I-08 | Imported results identify source system + agent                         |
| I-09 | Review only by authorised reviewers                                     |
| I-10 | Finalised records preserve historical truth                             |
| I-11 | Absolute tenant isolation                                               |
| I-12 | No Evidence / Defect / Test Runs SoR absorption                         |
| I-13 | Stale revision fails command                                            |
| I-14 | Ingestion idempotency unique per tenant+source+key                      |
| I-15 | Manifest content hash integrity                                         |
| I-16 | Supersession bidirectional lineage                                      |

## Business rules (selected)

| ID    | Rule                                                                                     |
| ----- | ---------------------------------------------------------------------------------------- |
| BR-01 | Prepare blocks if Plan/Spec version unresolved                                           |
| BR-02 | Post-seal runtime uses sealed manifest if live source read unavailable                   |
| BR-03 | Reassignment in progress is explicit audited command                                     |
| BR-04 | Permission loss mid-execution blocks further mutating actions until reassigned/cancelled |
| BR-05 | Review override retains pre-review derived outcome in history                            |
| BR-06 | Re-execution after failure creates new execution or supersession — no silent rewrite     |
| BR-07 | Late ingestion after accepted/cancelled → reject/quarantine                              |
| BR-08 | Plan progress query is factual projection owned by Test Execution; Plan SoR unchanged    |
| BR-09 | Sensitive actual-result bodies not search-indexed by default                             |
| BR-10 | AI suggestions never auto-apply Domain commands                                          |

## Layer rules

| ID    | Rule                                                       |
| ----- | ---------------------------------------------------------- |
| LR-01 | Domain pure — no I/O                                       |
| LR-02 | Application sole `availableActions` computer               |
| LR-03 | Workbench presentation only                                |
| LR-04 | Frozen packages reference-only                             |
| LR-05 | Central audit/search/notify — no module private subsystems |
