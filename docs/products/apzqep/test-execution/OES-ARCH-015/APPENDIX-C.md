# APZQEP-OES-ARCH-015 — APPENDIX C — Contract Catalogue

Architecture-level only — not an Engineering Specification.

## Commands

| Command                | Typical from → to / effect                  |
| ---------------------- | ------------------------------------------- |
| `createExecution`      | → `draft`                                   |
| `prepareExecution`     | `draft` → `ready` (seal manifest)           |
| `assignExecutor`       | `ready` → `assigned` (or update assignment) |
| `startExecution`       | `assigned` → `in_progress`                  |
| `recordStepResult`     | mutate step while `in_progress`             |
| `associateEvidence`    | add EvidenceReference                       |
| `recordObservation`    | add Observation                             |
| `pauseExecution`       | `in_progress` → `paused`                    |
| `blockExecution`       | `in_progress` → `blocked`                   |
| `resumeExecution`      | `paused`/`blocked` → `in_progress`          |
| `completeExecution`    | `in_progress` → `completed`                 |
| `submitForReview`      | `completed` → `submitted_for_review`        |
| `acceptExecution`      | review/fast-path → `accepted`               |
| `rejectExecution`      | `submitted_for_review` → `rejected`         |
| `cancelExecution`      | → `cancelled`                               |
| `supersedeExecution`   | → `superseded`                              |
| `ingestExternalResult` | create/update via trust boundary            |

## Queries

`getExecution` · `getManifest` · `listExecutions` · `listAssigned` · `listReviewQueue` · `getHistory` · `getAvailableActions` · `listEvidenceReferences` · `listObservations` · `getPlanExecutionProgress`

## Events

See Part 2 §7 (`test_execution.*` past-tense catalogue).

## Logical API resources

See Part 4 §4 (`/qep/executions` family).

## Error categories

`validation` · `unauthenticated` · `forbidden` · `not_found` · `conflict` · `precondition_failed` · `ingestion_rejected` · `gone` (superseded redirect metadata)

## Permission concepts

See Part 3 §1 (`qep.execution.*`).
