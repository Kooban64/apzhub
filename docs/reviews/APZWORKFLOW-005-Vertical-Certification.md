# APZWORKFLOW-005 — Vertical Certification

**Date:** 2026-07-15  
**Scope:** Workflow Platform management plane (engine-neutral)  
**Classification:** See [Production Readiness](./APZWORKFLOW-005-Production-Readiness.md)

## Certified path

```text
Workflow Workbench
→ createHttpWorkflowClient() / workflow-api
→ /api/v1/workflows/*
→ PlatformServiceGateway.workflow.*
→ RequestPipeline
→ Production Authorization
→ Workflow Platform Services
→ Workflow Core
→ Workflow Persistence
→ PostgreSQL
```

## Gates

| Gate                                    | Result                                     |
| --------------------------------------- | ------------------------------------------ |
| `pnpm audit:workflow-foundation`        | PASS                                       |
| `pnpm audit:workflow-platform-services` | PASS                                       |
| `pnpm audit:workflow-http-client`       | PASS                                       |
| `pnpm audit:workflow-workbench`         | PASS                                       |
| `pnpm audit:workflow-vertical`          | PASS (required)                            |
| `pnpm openapi:validate:platform`        | PASS                                       |
| Vitest `testing/workflow-vertical`      | Required harness                           |
| Playwright live webServer               | LIMITED (Testing slug conflict — external) |

## Intentional non-defects

No execution engine, runs, schedules, n8n, Event Bus, workers, designer, drag-and-drop, or runtime credentials.

## Architecture freeze

Workflow management-plane vertical is certified and frozen. Next approved milestone only: **APZWORKFLOW-006 — n8n Reference Adapter Foundation** (adapter-only; no Platform Services / HTTP / Workbench execution).
