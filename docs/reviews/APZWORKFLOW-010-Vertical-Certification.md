# APZWORKFLOW-010 — Workflow Engine Vertical Certification

**Date:** 2026-07-15  
**Scope:** Workflow Engine vertical (n8n Reference Adapter track — read-only)  
**Classification:** See [Production Readiness](./APZWORKFLOW-010-Production-Readiness.md)

## Certified path

```text
Workflow Engine Workbench
→ createHttpWorkflowEngineClient() / engine-api
→ /api/v1/workflows/engine/*
→ PlatformServiceGateway.workflow.engine.*
→ RequestPipeline
→ Production Authorization
→ Workflow Platform Services
→ Integration SDK
→ n8n Reference Adapter (@apzhub/integration-n8n 0.1.0)
→ n8n
```

Workflow Platform SoR (`/workspace/workflows`, `/api/v1/workflows` excluding `/engine`) remains separately certified under APZWORKFLOW-005.

## Gates

| Gate                                        | Result                                     |
| ------------------------------------------- | ------------------------------------------ |
| `pnpm audit:workflow-n8n-adapter`           | PASS                                       |
| `pnpm audit:workflow-n8n-platform-services` | PASS                                       |
| `pnpm audit:workflow-engine-http`           | PASS                                       |
| `pnpm audit:workflow-engine-workbench`      | PASS                                       |
| `pnpm audit:workflow-engine-vertical`       | PASS (required)                            |
| `pnpm openapi:validate:platform`            | PASS                                       |
| Vitest `testing/workflow-engine-vertical`   | Required harness                           |
| Vitest engine/client/workbench suites       | PASS (regression evidence)                 |
| Playwright mock suite (`apzworkflow-009-*`) | Shipped; live webServer LIMITED (external) |

## Intentional non-defects

No execution, scheduling, workflow mutations, Event Bus, workers, designer, drag-and-drop, runtime credentials, or webhooks.

## Architecture freeze

Workflow Engine vertical is certified and frozen. Next approved milestone only: **APZWORKFLOW-011 — Workflow Engine Wave Certification & Reference Adapter Closeout**.
