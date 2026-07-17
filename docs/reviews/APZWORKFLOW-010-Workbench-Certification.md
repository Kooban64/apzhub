# APZWORKFLOW-010 — Workbench Certification

**Result:** PASS

## Navigation

Manifests `platform-workflow-engine*` · Activity Bar order **53** · `/workspace/workflow-engine` · permissions `workflow.engine.*`.

## Views certified

Overview (prominent **READ-ONLY ENGINE**), Workflows + Definition Viewer (metadata counts), Templates, Projects, Users, Tags, Capabilities, Health, Diagnostics, Compatibility.

## Commands certified

Refresh · View Details · Copy ID · Open API Metadata · Validate Connection.

No execute / activate / deactivate / schedule / deploy / run controls.

## UX states

Loading · Empty · Error · Forbidden · responsive · keyboard rows · ARIA toolbar/status/alert.

## Client consumption

`engine-api` + `workflowEngineQueryKeys` only — audited by `pnpm audit:workflow-engine-workbench` and vertical audit.
