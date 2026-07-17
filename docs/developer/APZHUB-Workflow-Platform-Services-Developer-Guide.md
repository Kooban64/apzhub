# APZHUB — Workflow Platform Services Developer Guide

**Milestone:** APZWORKFLOW-002  
**Date:** 2026-07-15

---

## Packages

| Package | Version | Role |
| ------- | ------- | ---- |
| `@apzhub/workflow-contracts` | 0.2.0 | Models, permissions, nested gateway types |
| `@apzhub/workflow-core` | 0.1.1 | Domain service + validation + lifecycle |
| `@apzhub/workflow-persistence` | 0.1.1 | In-memory + PostgreSQL repos |
| `@apzhub/platform-services` | 0.19.0 | Thin wrappers + gateway + authz |

## Consume via gateway

```ts
const wf = await gateway.workflow.workflows.create(ctx, {
  key: "invoice-approval",
  name: "Invoice Approval",
});
await gateway.workflow.versions.create(ctx, {
  workflowId: wf.id,
  graph,
});
await gateway.workflow.workflows.publish(ctx, wf.id);
```

## Do not

- Call persistence repos from products
- Import n8n / Event Bus / execute APIs
- Add a second gateway
- Hardcode modules into the shell

## Audits

```bash
pnpm audit:workflow-foundation
pnpm audit:workflow-platform-services
```

## Next (not implemented)

**APZWORKFLOW-004 — Workflow Workbench** (owner approval required).
