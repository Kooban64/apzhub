# Transitions

| From | To | Action | Permission |
| ---- | -- | ------ | ---------- |
| draft | proposed | submit | qep.requirements.submit |
| proposed | in_review | review | qep.requirements.review |
| proposed | in_review | start_review | qep.requirements.review |
| in_review | approved | approve | qep.requirements.approve |
| in_review | rejected | reject | qep.requirements.reject |
| approved | implemented | mark_implemented | qep.requirements.implement |
| implemented | verified | mark_verified | qep.requirements.verify |
| verified | deprecated | deprecate | qep.requirements.deprecate |
| deprecated | archived | archive | qep.requirements.archive |
| rejected | draft | revise | qep.requirements.edit |
| rejected | archived | archive | qep.requirements.archive |

## HTTP API

- `POST /api/v1/qep/requirements/{id}/transitions` — body: `{ action, reason?, comments?, expectedRevision? }`
- `GET /api/v1/qep/requirements/{id}/transitions` — available transitions
- `GET /api/v1/qep/requirements/{id}/lifecycle` — history entries
- `DELETE /api/v1/qep/requirements/{id}` — archive via lifecycle (deprecated/rejected only)
