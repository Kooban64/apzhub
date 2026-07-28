# Engineering Specification Traceability Matrix — APZQEP-ECR-001

Authority: **APZQEP-OES-ENG-090A** (BASELINED)

| OES area       | Requirement theme                       | Status       | Implementation evidence                                                             |
| -------------- | --------------------------------------- | ------------ | ----------------------------------------------------------------------------------- |
| PART-01        | Package / layer layout                  | ✅           | `packages/qep-test-execution` domain/application/infrastructure/presentation        |
| PART-02        | Aggregate + lifecycle commands          | ✅           | 17 Domain command functions                                                         |
| PART-02        | Domain events catalogue                 | ✅           | 17 `test_execution.*` event types                                                   |
| PART-02        | Domain policies                         | ✅           | Manifest/Assignment/Completion/Review/Cancel/Supersede/Ingestion/Lifecycle          |
| PART-03        | Application command/query/ingestion     | ✅           | ExecutionCommand/Query/ExternalIngestion/AvailableActions services                  |
| PART-03        | Outbound ports                          | ✅           | Repository, History, Source, Permission, Audit, Outbox, Search, Evidence, Clock, Id |
| PART-03        | Persistence logical model               | ✅           | `qep_test_execution*` schema + 0087/0088                                            |
| PART-03        | Audit + outbox in UoW                   | ✅*          | Persist → outbox enqueue → audit · *dispatch deferred                               |
| PART-04        | REST catalogue `/api/v1/qep/executions` | ✅           | 14 route modules + handlers/schemas                                                 |
| PART-04        | Permission catalogue                    | ✅           | `qep.execution.*` + platform op map (28 ops)                                        |
| PART-04        | Workbench surfaces                      | ✅           | home/explorer/assigned/review/detail/history                                        |
| PART-04        | availableActions UI authority           | ✅           | Server-only action bar                                                              |
| PART-04 / L-01 | OpenAPI artefacts                       | ⚠ LIMITATION | Not produced under Engineering Waves (deferred)                                     |
| PART-05        | Testing pyramid expectations            | ✅*          | Unit strong; integration DB/live E2E limited                                        |
| Doc 029        | event.yaml registration                 | ⚠ LIMITATION | `events/qep-test-execution/` README only                                            |

## Omissions / variances

| ID    | Item                               | Classification                                                             |
| ----- | ---------------------------------- | -------------------------------------------------------------------------- |
| TR-01 | OpenAPI for live QEP execution API | Limitation — schedule under Certification prep or dedicated docs programme |
| TR-02 | Outbox dispatch / worker           | Limitation — enqueue present; platform dispatcher future                   |
| TR-03 | EvidenceAccessPort real check      | Limitation — default-allow until Platform wires check                      |
| TR-04 | SearchPublication default no-op    | Limitation — hook seam present                                             |
| TR-05 | event.yaml manifests               | Limitation — Document 029 future registration                              |

No OES requirement was found to be wholly unimplemented for the authorised Wave scopes.
