# APZQEP-OES-ENG-090A — APPENDIX D — Contract Catalogue

## Commands → action keys

| Domain command         | Action key                   | Event (past-tense)                        |
| ---------------------- | ---------------------------- | ----------------------------------------- |
| `createExecution`      | (create via POST collection) | `test_execution.created`                  |
| `prepareExecution`     | `prepare`                    | `test_execution.prepared`                 |
| `assignExecutor`       | `assign`                     | `test_execution.assigned`                 |
| `startExecution`       | `start`                      | `test_execution.started`                  |
| `recordStepResult`     | `recordStepResult`           | `test_execution.step_result_recorded`     |
| `associateEvidence`    | `associateEvidence`          | `test_execution.evidence_associated`      |
| `recordObservation`    | `recordObservation`          | `test_execution.observation_recorded`     |
| `pauseExecution`       | `pause`                      | `test_execution.paused`                   |
| `blockExecution`       | `block`                      | `test_execution.blocked`                  |
| `resumeExecution`      | `resume`                     | `test_execution.resumed`                  |
| `completeExecution`    | `complete`                   | `test_execution.completed`                |
| `submitForReview`      | `submitForReview`            | `test_execution.submitted_for_review`     |
| `acceptExecution`      | `accept`                     | `test_execution.accepted`                 |
| `rejectExecution`      | `reject`                     | `test_execution.rejected`                 |
| `cancelExecution`      | `cancel`                     | `test_execution.cancelled`                |
| `supersedeExecution`   | `supersede`                  | `test_execution.superseded`               |
| `ingestExternalResult` | (POST ingestions)            | `test_execution.external_result_received` |

## Queries

`getExecution` · `getManifest` · `listExecutions` · `listAssigned` · `listReviewQueue` · `getHistory` · `getAvailableActions` · `listEvidenceReferences` · `listObservations` · `getPlanExecutionProgress`

## Permissions

`qep.execution.read` · `create` · `prepare` · `assign` · `execute` · `control` · `review` · `supersede` · `ingest` · `admin`

## API resources (summary)

`/api/v1/qep/executions` family — see PART-04 §1.

## Error categories

`validation` · `unauthenticated` · `forbidden` · `not_found` · `conflict` · `precondition_failed` · `ingestion_rejected` · `gone`

## Ports

`TestExecutionRepository` · `ExecutionHistoryStore` · `SourceResolutionPort` · `PermissionPort` · `AuditPort` · `EventOutboxPort` · `SearchPublicationPort` · `EvidenceAccessPort`

## Package

`@apzhub/qep-test-execution` (identity locked; versions via future Engineering/Certification)
