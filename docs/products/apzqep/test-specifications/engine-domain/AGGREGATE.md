# Aggregate — TestSpecification

## Root

`TestSpecification` is the sole aggregate root. All mutations go through domain functions that enforce invariants and append history/events.

## Composition

| Member           | Role                                                 |
| ---------------- | ---------------------------------------------------- |
| `record`         | `SpecificationRecord` — identity and content         |
| `metadata`       | Extensible string attributes                         |
| `history`        | Append-only audit trail                              |
| `relationships`  | Reference-only links                                 |
| `approval`       | Latest review/approval decision                      |
| `versionLineage` | Version labels known to this aggregate               |
| `domainEvents`   | Uncommitted domain events (cleared at command start) |

## Commands (selected)

`createTestSpecification` · `startSpecificationReview` · `approveSpecification` · `rejectSpecification` · `returnSpecificationToDraft` · `withdrawSpecification` · `cancelSpecification` · `retireSpecification` · `supersedeSpecification` · `createSuccessorDraft` · `updateSpecificationContent` · `updateSpecificationMetadata` · `transferSpecificationOwnership` · `addSpecificationRelationship` · `removeSpecificationRelationship`

## Invariant enforcement

The aggregate refuses content edits outside `draft`, refuses `rejected → approved`, marks only `approved` as authoritative, and treats `superseded` / `retired` / `withdrawn` / `cancelled` as terminal.
