# APZWORKFLOW-009 Completion Report

**Milestone:** APZWORKFLOW-009 — n8n Workbench Integration  
**Status:** COMPLETE  
**Date:** 2026-07-15  
**Route:** `/workspace/workflow-engine`  
**Next:** **APZWORKFLOW-010 — n8n Vertical Certification & Production Readiness** (**await owner approval — do not start**)

---

## Executive Summary

Delivered a presentation-only Workflow Engine Workbench over `createHttpWorkflowEngineClient()` / `engine-api` facades. Manifest-driven Activity Bar + Sidebar navigation. Read-only lists, definition metadata viewer, capabilities/health/diagnostics/compatibility. Commands: Refresh, View Details, Copy ID, Open API Metadata, Validate Connection. No execution, scheduling, mutations, designer, drag-drop, or Event Bus.

## Architecture

```text
Workflow Engine Workbench
  → createHttpWorkflowEngineClient() / engine-api
  → /api/v1/workflows/engine/*
  → PlatformServiceGateway.workflow.engine.*
  → RequestPipeline → Authorization → Platform Services
  → Integration SDK → n8n Reference Adapter → n8n
```

UI never imports Gateway, Platform Services, Integration SDK, Workflow Core, or persistence.

## Navigation

Parent + ten child manifests under `packages/workbench-framework/manifests/platform-workflow-engine*`. Workspace `workflow-engine`, order **53**. Permissions: `workflow.engine.read` / `.health` / `.diagnostics` / `.capabilities`.

## Views

Overview (READ-ONLY ENGINE), Workflows (+ definition viewer), Templates, Projects, Users, Tags, Capabilities, Health, Diagnostics, Compatibility. Loading / empty / error / forbidden states.

## Commands

Refresh · View Details · Copy ID · Open API Metadata · Validate Connection (hideable via `canValidateConnection`). No execute/activate/schedule/deploy/run.

## Accessibility

ARIA toolbar/status/alert regions, keyboard-selectable table rows, responsive layout, semantic headings, token colours.

## Tests

Component, navigation/router, permission props, boundary, definition viewer, routes, typed-client reuse, Playwright mock (`apzworkflow-009-workflow-engine-workbench.spec.ts`).

## Coverage

Scoped `components/workflow-engine/**`: **98.9%** lines · **100%** functions · **~86%** branches. See [APZWORKFLOW-009 Coverage Baseline](../reviews/APZWORKFLOW-009-coverage-baseline.md).

## Quality Gates

| Gate | Result |
| --- | --- |
| `pnpm audit:workflow-engine-workbench` | PASS |
| Vitest workflow-engine suite (28) | PASS |
| Boundary audit (components) | PASS |
| Coverage ≥95% lines/functions | PASS |
| No execute / designer / n8n UI branding | PASS |

## Technical Debt

- Engine definition API returns counts, not node/connection graphs — viewer documents that explicitly
- Project/owner fields not in engine DTO — UI states unavailability
- Live n8n E2E deferred to certification (010)
- Engine remains off until `APZHUB_WORKFLOW_ENGINE_ENABLED`

## Recommendation

**APZWORKFLOW-010 — n8n Vertical Certification & Production Readiness** only. Do **not** implement until explicit owner approval.

---

**Stop condition met.** Await owner approval before APZWORKFLOW-010.
