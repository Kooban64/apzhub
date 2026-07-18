# n8n Platform Services Developer Guide

**APZWORKFLOW-007**

## Packages

| Package                      | Role                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| `@apzhub/workflow-contracts` | `WorkflowEngineGateway` + `workflow.engine.*` permissions     |
| `@apzhub/platform-services`  | Thin engine services, factories, authz map, pipeline wrap     |
| `@apzhub/integration-n8n`    | Certified adapter (frozen **0.1.0**) — Platform Services only |

## Layout

```text
packages/platform-services/src/services/workflow/
  create-workflow-engine-services.ts
  workflow-engine-service-impls.ts
  unavailable-workflow-engine-services.ts
  create-workflow-platform-services.ts   # injects engine bundle; no direct adapter import
```

## Tests

```bash
pnpm exec vitest run --config vitest.config.ts packages/platform-services/src/services/workflow/apzworkflow-007
pnpm audit:workflow-n8n-platform-services
```

Mock adapter only — no live n8n.

## Out of scope

HTTP · OpenAPI · typed client · Workbench · execution · scheduling · Event Bus · mutations · webhooks.
