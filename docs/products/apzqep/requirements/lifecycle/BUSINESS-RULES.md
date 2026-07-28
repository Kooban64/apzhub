# Business Rules

Policy guards enforce the following in `requirement-lifecycle-policy.ts`:

| Rule | Enforcement |
| ---- | ----------- |
| Cannot transition from `archived` | Guard blocks all outbound transitions |
| Cannot approve archived | No transition path to `approved` from `archived` |
| Cannot verify draft | No direct or indirect path from `draft` to `verified` without intermediate states |
| Cannot implement rejected | No transition from `rejected` to `implemented` |
| Archive only from `deprecated` or `rejected` | Guard on `canTransition` when target is `archived` |
| Reject requires reason | Application service validates non-empty reason |

## Content vs status

- `createRequirement` always creates `draft` (non-draft create status rejected)
- `updateRequirement` rejects `status` field — content fields remain editable
- Legacy free archive from any state removed — `archiveRequirement` uses lifecycle `archive` action

## Concurrency

- Optional `expectedRevision` on transitions
- Mismatch raises `QepRevisionConflictError` (HTTP 409)
