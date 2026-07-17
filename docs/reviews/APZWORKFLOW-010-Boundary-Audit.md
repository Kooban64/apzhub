# APZWORKFLOW-010 — Boundary Audit

**Result:** PASS — 0 violations (`pnpm audit:workflow-engine-vertical`)

## Layer boundaries

| Boundary | Rule | Status |
| --- | --- | --- |
| UI → Services | Workbench never imports Gateway / platform-services / adapter | PASS |
| Client → Engines | Typed client never imports adapter or Workflow Core | PASS |
| HTTP → Adapter | Handlers call `gateway.workflow.engine.*` only | PASS |
| Services → HTTP/UI | Engine services have no apps/web imports | PASS |
| Adapter → Platform | Adapter has no platform-services / core / persistence deps | PASS |
| Execution | No execute/runs/schedules/activate surfaces | PASS |
| SoR vs Engine | `/workspace/workflows` vs `/workspace/workflow-engine` do not collide | PASS |

## Branding

Product-neutral UI copy (“Workflow Engine”); no `n8n` branding in Workbench presentation source (audit-enforced).
