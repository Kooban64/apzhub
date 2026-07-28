# Permissions

Lifecycle permissions (in addition to CRUD from ENG-020B):

| Permission | Purpose |
| ---------- | ------- |
| qep.requirements.submit | draft → proposed |
| qep.requirements.review | proposed → in_review |
| qep.requirements.approve | in_review → approved |
| qep.requirements.reject | in_review → rejected |
| qep.requirements.implement | approved → implemented |
| qep.requirements.verify | implemented → verified |
| qep.requirements.deprecate | verified → deprecated |
| qep.requirements.archive | deprecated/rejected → archived |

`qep.requirements.delete` retained for future hard-delete; archive maps to `qep.requirements.archive`.

Registered in:

- `@apzhub/qep-contracts`
- `modules/qep-requirements/module.yaml`
- Platform permission catalogue
- Operation authorization map (`qepRequirement` service operations)
