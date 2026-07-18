# APZHUB APZ TCMS — Release Domain Model

**Milestone:** APZTCMS-014

## Entities

| Entity                   | Mutability                                            |
| ------------------------ | ----------------------------------------------------- |
| Release                  | Mutable metadata + lifecycle status via state machine |
| ReleaseCandidate         | Mutable label/status under release                    |
| ReleasePackage           | Mutable package descriptors                           |
| ReleaseScope             | Links to TCMS artefacts (plan/suite/case/execution/…) |
| ReleaseApproval          | Human stage decisions                                 |
| ReleaseDecision          | Human decision record (`isAutomatic: false`)          |
| ReleaseEvidence          | Evidence refs (metadata only)                         |
| ReleaseManifest          | Derived snapshot of scope/packages/deps               |
| ReleaseWindow            | Optional time-window metadata                         |
| ReleaseDependency        | Release-to-artefact dependency refs                   |
| ReleaseSummary           | Advisory summary (`isDecision: false`)                |
| ReleaseNote              | Notes                                                 |
| ReleaseRiskAssessment    | Immutable evaluation snapshot                         |
| ReleaseReadinessSnapshot | Immutable evaluation snapshot (`isDecision: false`)   |
| ReleaseAuditEntry        | Append-only audit                                     |

Source: `packages/testing-contracts/src/domain/release-governance.ts`.
