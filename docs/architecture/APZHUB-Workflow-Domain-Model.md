# APZHUB Workflow Domain Model

**Milestone:** APZWORKFLOW-001  
**Package:** `@apzhub/workflow-contracts`

---

## Entities

| Entity                               | Description                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Workflow**                         | Named tenant workflow definition; lifecycle; optional current version, category, folder, template   |
| **WorkflowVersion**                  | Immutable numbered snapshot of graph + variables/parameters/triggers/actions/conditions/connections |
| **WorkflowTemplate**                 | Reusable graph blueprint with parameters/variables                                                  |
| **WorkflowCategory**                 | Taxonomy node                                                                                       |
| **WorkflowFolder**                   | Folder path taxonomy                                                                                |
| **WorkflowVariable**                 | Typed variable metadata                                                                             |
| **WorkflowParameter**                | Typed parameter metadata (non-json scalars)                                                         |
| **WorkflowTrigger**                  | Engine-neutral trigger metadata (`kind` + allowlisted config)                                       |
| **WorkflowAction**                   | Engine-neutral action metadata                                                                      |
| **WorkflowCondition**                | Engine-neutral condition metadata                                                                   |
| **WorkflowConnection**               | Edge between graph nodes                                                                            |
| **WorkflowMetadata**                 | Labels/tags/custom string map                                                                       |
| **WorkflowAuditEntry**               | Append-only audit record                                                                            |
| **WorkflowValidationResult / Issue** | Structural/reference/parameter/version/lifecycle issues (not runtime)                               |

---

## Engine-neutral graph

Triggers, actions, and conditions use a string `kind` plus `Record<string, string | number | boolean>` config. They are **never** n8n node types or vendor SDK schemas.

Graph snapshot (`WorkflowGraphSnapshot`) stores JSON-safe nodes (`nodeKind`: `trigger` | `action` | `condition`) and connections.

---

## Lifecycle catalogue

`draft` · `active` · `inactive` · `archived` · `deprecated` · `restored`

No execution-state fields (`running`, `queued`, `failed`, etc.) belong on foundation entities.

---

## Identifiers

Branded platform IDs (`WorkflowId`, `WorkflowVersionId`, …) with shape validation via `asWorkflow*` / `isPlatformIdShape`.
