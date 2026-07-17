# Workflow Engine HTTP Developer Guide

**APZWORKFLOW-008**

## Layout

```text
apps/web/app/api/v1/workflows/engine/**/route.ts
apps/web/lib/api/v1/handlers/workflow-engine.ts
apps/web/lib/api/v1/schemas/workflow-engine.ts
apps/web/lib/workflows/engine-client.ts
apps/web/lib/workflows/mock-engine-client.ts
apps/web/lib/workflows/engine-api.ts
apps/web/lib/workflows/engine-query-keys.ts
apps/web/lib/workflows/engine-errors.ts
apps/web/lib/workflows/engine-types.ts
```

## Quality

```bash
pnpm openapi:validate:platform
pnpm audit:workflow-engine-http
pnpm exec vitest run --config vitest.config.ts apps/web/lib/workflows/engine apps/web/lib/api/v1/handlers/workflow-engine
```

## Rules

- Handlers: gateway only
- Client: `/api/v1/workflows/engine` only
- No Workbench UI in this milestone
