# APZHUB Workflow Lifecycle Guide

**Milestone:** APZWORKFLOW-001  
**Package:** `@apzhub/workflow-core`

---

## Catalogue

| State | Meaning |
| --- | --- |
| `draft` | Editable definition |
| `active` | Published / in use |
| `inactive` | Temporarily disabled |
| `archived` | Soft-retired |
| `deprecated` | Marked for removal |
| `restored` | Recovered from archive/deprecation |

---

## Allowed transitions (fail closed)

| From | To |
| --- | --- |
| draft | active, inactive, archived, deprecated |
| active | inactive, archived, deprecated |
| inactive | active, archived, deprecated |
| archived | restored, deprecated |
| deprecated | restored |
| restored | active, inactive, draft, archived |

Same-state transitions are allowed (no-op). All other transitions throw `WorkflowDomainError` (`invalid_lifecycle_transition`).

API:

- `canTransitionWorkflowLifecycle(from, to)`
- `assertWorkflowLifecycleTransition(from, to)`
- `listAllowedWorkflowLifecycleTransitions(from)`
