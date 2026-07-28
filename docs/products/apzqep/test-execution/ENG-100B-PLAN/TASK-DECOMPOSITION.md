# ENG-100B Task Decomposition (planning only)

| ID   | Task                                                                                   | Depends   |
| ---- | -------------------------------------------------------------------------------------- | --------- |
| T-01 | Status / mode / outcome value objects                                                  | —         |
| T-02 | SourceVersionRef · ExecutionContext · EvidenceReference VOs                            | T-01      |
| T-03 | ExecutionManifest entity + seal/hash rules                                             | T-02      |
| T-04 | ExecutionStep entity                                                                   | T-03      |
| T-05 | Observation / Review / ExternalSubmission entities                                     | T-01      |
| T-06 | TestExecution aggregate + revision/history                                             | T-03…T-05 |
| T-07 | Command handlers (lifecycle matrix)                                                    | T-06      |
| T-08 | Policies (seal, assignment, completion, review, cancel, supersede, ingestion, outcome) | T-07      |
| T-09 | Domain services                                                                        | T-08      |
| T-10 | Domain event types catalogue                                                           | T-07      |
| T-11 | Domain exception types                                                                 | T-07      |
| T-12 | Lifecycle matrix tests (APPENDIX-B)                                                    | T-07      |
| T-13 | Invariant tests (APPENDIX-C)                                                           | T-07      |
| T-14 | Boundary test update (Domain may grow; still no I/O)                                   | T-06      |
| T-15 | Wave docs + evidence                                                                   | T-12…T-14 |
