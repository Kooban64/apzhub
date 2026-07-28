# Application Services — APZQEP-ENG-060B

## Factory

`createPlanApplicationService(deps)`

## Commands

Create · Update Content/Metadata/Ownership/Assignment/Schedule · Add/Update/Reorder/Remove Item · Submit For Review · Approve · Reject · Return To Draft · Mark Ready · Start Execution · Complete · Archive · Cancel · Supersede · Clone

## Queries

Get · Get By Number · List / Search · History · Revisions · Execution Readiness

## Orchestration pattern

1. Assert permission
2. Load aggregate
3. Invoke Domain function (business rules stay in Domain)
4. Persist atomically (`save(plan, expectedRevision)`)
5. Audit append (optional `audits` hook)
6. Search upsert (optional `onPlanUpserted` hook)
7. Observation metrics hook (`onObservation`)

Number allocation (via `existsByNumber`) runs before create, clone, and supersede to guarantee tenant-unique plan numbers. Services never encode lifecycle or validation rules — those remain in the certified Domain.
