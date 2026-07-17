# APZWORKFLOW-010 Completion Report

**Milestone:** APZWORKFLOW-010 — Workflow Engine Vertical Certification & Production Readiness  
**Status:** COMPLETE  
**Date:** 2026-07-15  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Next:** **APZWORKFLOW-011 — Workflow Engine Wave Certification & Reference Adapter Closeout** (**await owner approval — do not start**)

---

## Executive Summary

Certified the complete Workflow Engine vertical (Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authorization → Platform Services → Integration SDK → n8n Adapter → n8n) as **PRODUCTION_READY_WITH_LIMITATIONS**. Introduced `pnpm audit:workflow-engine-vertical` and `testing/workflow-engine-vertical/` harness. Re-validated prior audits 006–009, OpenAPI, package versions, route absences, Workbench/client/HTTP boundaries, authorization mapping, and review pack. No product functionality, routes, UI, execution, scheduling, mutations, or Event Bus added.

## Architecture

```text
Workflow Engine Workbench
  → createHttpWorkflowEngineClient() / engine-api
  → /api/v1/workflows/engine/*
  → PlatformServiceGateway.workflow.engine.*
  → RequestPipeline → Production Authorization
  → Workflow Platform Services
  → Integration SDK → @apzhub/integration-n8n 0.1.0 → n8n
```

## Dependency Audit

PASS — [Dependency Audit](../reviews/APZWORKFLOW-010-Dependency-Audit.md). Workbench/client/HTTP never import Gateway bypass targets, adapter, or Workflow Core incorrectly. Adapter has no platform-services/UI deps.

## Boundary Audit

PASS — [Boundary Audit](../reviews/APZWORKFLOW-010-Boundary-Audit.md). Zero architectural shortcuts. SoR vs Engine workspace routes do not collide.

## HTTP

PASS — [HTTP Certification](../reviews/APZWORKFLOW-010-HTTP-Certification.md). Twelve authenticated engine routes; OpenAPI **Workflow Engine** parity; `openapi:validate:platform` PASS.

## Typed Client

PASS — [Typed Client Certification](../reviews/APZWORKFLOW-010-Typed-Client-Certification.md). `createHttpWorkflowEngineClient()` + mock + `workflowEngineQueryKeys`.

## Workbench

PASS — [Workbench Certification](../reviews/APZWORKFLOW-010-Workbench-Certification.md). All required views/commands; **READ-ONLY ENGINE**; no execution controls.

## Authorization

PASS — [Authorization Review](../reviews/APZWORKFLOW-010-Authorization-Review.md). `workflowEngineOps` + RequestPipeline; anonymous/missing-permission denied; no allow-all.

## Security

PASS — [Security Review](../reviews/APZWORKFLOW-010-Security-Review.md). No secrets/credentials/execution payloads in presentation path; no silent production mock.

## Performance

Measured only — [Performance Baseline](../reviews/APZWORKFLOW-010-Performance-Baseline.md). No optimisation. No blocking defect.

## Coverage

Consolidated ≥95% lines/functions on engine vertical scopes — [Coverage Baseline](../reviews/APZWORKFLOW-010-Coverage-Baseline.md).

## Quality Gates

| Gate | Result |
| --- | --- |
| `pnpm audit:workflow-engine-vertical` | PASS |
| Prior 006–009 audits (nested) | PASS |
| `pnpm openapi:validate:platform` | PASS |
| Vitest `testing/workflow-engine-vertical` | PASS |
| Vitest workbench/client/handler regressions | PASS |
| Lint (engine workbench scoped) | PASS |
| Playwright mock (`apzworkflow-009-*`) | Shipped; live LIMITED (external) |

## Production Classification

**PRODUCTION_READY_WITH_LIMITATIONS** — [Production Readiness](../reviews/APZWORKFLOW-010-Production-Readiness.md).

Evidence: complete read-only vertical, audited boundaries, OpenAPI, authz, workbench. Limitations: no execution/scheduling/mutations; read-only adapter; live provider optional; Playwright live env dependent.

## Certification defects corrected

1. **APZWORKFLOW-006 audit `premature-wiring`** — obsolete after 007 Platform Services / apps bootstrap wiring; now skipped when 007 completion artefacts exist. Adapter upward-dependency bans unchanged.
2. **APZWORKFLOW-007 audit `web-no-direct-n8n`** — allowed only `apps/web/lib/api/v1/gateway/bootstrap.ts` after 008 (explicit optional engine wiring). Handlers/Workbench remain forbidden.
3. **Vitest include** — registered `testing/workflow-engine-vertical/**/*.test.{ts,tsx}` in root `vitest.config.ts` (harness wiring only).

No product/behaviour changes.

## Technical Debt

- Live n8n E2E deferred to wave closeout (011)
- Engine definition API returns counts, not node graphs — honest UI (009)
- Playwright webServer blocked by unrelated Testing slug conflict
- SoR Platform versions in APZWORKFLOW-005 audit script may lag engine track (0.20.0) — SoR freeze remains separate

## Architecture freeze

Workflow Engine architecture frozen after certification. Defects requiring behaviour change need a new approved milestone.

## Recommendation

**APZWORKFLOW-011 — Workflow Engine Wave Certification & Reference Adapter Closeout** only. Do **not** implement until explicit owner approval.

---

**Stop condition met.** Await owner approval before APZWORKFLOW-011.
