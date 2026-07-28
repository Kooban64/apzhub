# Part 2 Implementation — APZQEP-ENG-040B

| Area               | Delivery                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Persistence        | Tables `qep_verification`, `qep_verification_history`; migrations **0081** / **0082** (RLS)               |
| Repositories       | PostgreSQL + in-memory; contract tests                                                                    |
| Subject resolution | Contract + in-memory registry; optional Requirements / Trace Link adapters                                |
| Application        | Commands/queries via `createVerificationApplicationService`                                               |
| availableActions   | Server-authoritative via `computeVerificationAvailableActions` / `computeQepVerificationAvailableActions` |
| REST               | `/api/v1/qep/verifications/*`                                                                             |
| Permissions        | `qep.verification.*`                                                                                      |
| Audit              | `qep.verification.*` actions via audit appender                                                           |
| Search             | Projection entity `verification_record` via `verificationToSearchDraft` / `onVerificationUpserted`        |
| Observability      | `onObservation` hooks on commands/queries                                                                 |
| Package            | `@apzhub/qep-verification` **0.2.0**                                                                      |
| Domain baseline    | ENG-040A ACCEPTED at package **0.1.0** (domain remains sole business-rule authority)                      |

## Explicit non-delivery

Workbench · React presentation routes · Coverage Engine · Impact Engine · Evidence · Certification · AI · MCP · Owner Acceptance of ENG-040B.
