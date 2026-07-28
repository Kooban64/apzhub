# APZQEP-OES-ENG-060B — APPENDIX D — Permissions & Events

## Permissions

`qep.plan.read` · `create` · `update` · `submit` · `approve` · `reject` · `ready` · `execute` · `complete` · `archive` · `cancel` · `clone` · `supersede` · `assign` · `schedule` · `search` · (`history.view` optional / implied)

## Domain events (wire)

```text
qep.plan.created
qep.plan.updated
qep.plan.review.requested
qep.plan.approved
qep.plan.rejected
qep.plan.ready
qep.plan.started
qep.plan.completed
qep.plan.archived
qep.plan.cancelled
qep.plan.superseded
qep.plan.item.added
qep.plan.item.updated
qep.plan.item.removed
```

## Error code concepts

`VALIDATION_FAILED` · `INVALID_STATE` · `INVARIANT_VIOLATION` · `READINESS_FAILED` · `REVISION_CONFLICT` · `LINEAGE_VIOLATION` · `NOT_FOUND` · `CONFLICT` · `REFERENCE_NOT_FOUND` · `FORBIDDEN`
