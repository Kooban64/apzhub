# Application Services — APZQEP-ENG-050B

## Factory

`createSpecificationApplicationService(deps)`

## Commands

Create · Update Draft · Submit For Review · Approve · Reject · Withdraw · Supersede · Retire · Cancel · Add/Remove Relationship

## Queries

Get · List · Search · History · Versions · Latest Approved · Relationships

## Orchestration pattern

1. Assert permission
2. Load aggregate
3. Invoke Domain function
4. Persist atomically (`runInTransaction` + `save(expectedRevision)`)
5. Audit append (optional hook)
6. Publish domain events (optional hook)
7. Search upsert (optional hook)
8. Observation metrics hook

Services never encode lifecycle or validation rules.
