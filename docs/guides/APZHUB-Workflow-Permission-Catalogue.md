# APZHUB Workflow Permission Catalogue

**Milestone:** APZWORKFLOW-001  
**Package:** `@apzhub/workflow-contracts`

---

## Keys

| Key | Purpose |
| --- | --- |
| `workflow.*` | Wildcard grant (not a security bypass) |
| `workflow.view` | Read definitions |
| `workflow.create` | Create definitions |
| `workflow.update` | Update metadata |
| `workflow.delete` | Delete definitions |
| `workflow.publish` | Publish / activate |
| `workflow.archive` | Archive |
| `workflow.restore` | Restore |
| `workflow.audit` | Read audit trail |
| `workflow.template.*` | Template wildcard |
| `workflow.template.view` | View templates |
| `workflow.template.create` | Create templates |
| `workflow.template.update` | Update templates |
| `workflow.template.delete` | Delete templates |

Helpers: `hasWorkflowPermission`, `hasWorkflowTemplatePermission`.

No `workflow.execute` key in foundation — execution is deferred.
