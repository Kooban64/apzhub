# Authorization — Requirements

> **Programme:** APZQEP-ENG-020B  
> **Rule:** Platform PermissionService / RequestPipeline only

## Permissions enforced

| Operation           | Permission                |
| ------------------- | ------------------------- |
| list / get / search | `qep.requirements.view`   |
| create              | `qep.requirements.create` |
| update              | `qep.requirements.edit`   |
| archive             | `qep.requirements.delete` |

## Registration

- Catalogue: `@apzhub/qep-contracts` → `QEP_REQUIREMENTS_PERMISSIONS`
- Namespace: `qep` in `CANONICAL_PERMISSION_NAMESPACES`
- Operation map: service `qepRequirement` → resource `qep_requirement`
- Module manifest: `modules/qep-requirements/module.yaml`

Approve / baseline / export / import remain registered but unused in ENG-020B.
