# APZWORKFLOW-007 Completion Report

**Milestone:** APZWORKFLOW-007 — n8n Platform Services Integration  
**Status:** COMPLETE  
**Date:** 2026-07-15  
**Packages:** `@apzhub/workflow-contracts` **0.3.0** · `@apzhub/platform-services` **0.20.0** · `@apzhub/integration-n8n` **0.1.0** (unchanged)  
**Next:** **APZWORKFLOW-008 — n8n HTTP API & Production Typed Client** (**await owner approval — do not start**)

---

## Executive Summary

Wired the certified n8n Reference Adapter into Platform Services as a read-only nested gateway surface `gateway.workflow.engine.*`. Every operation flows Gateway → RequestPipeline → Production Authorization → thin Platform Services → adapter. No HTTP, Workbench, execution, scheduling, Event Bus, or mutations.

## Architecture

```text
Workflow Platform (SoR)
  → Platform Services
    → Integration SDK
      → n8n Adapter
        → n8n
```

SoR workflow packages remain n8n-free. Engine façade files alone depend on `@apzhub/integration-n8n`.

## Gateway Integration

Nested under the existing Workflow Platform gateway — no second gateway. Facets: workflows, templates, tags, users, projects, capabilities, health, diagnostics, compatibility, connection.validate.

## Platform Services

Thin `createWorkflowEngineServiceImpls` delegates to `adapter.core` / `adapter.operations` / `adapter.testConnection`. Mutations always `PROVIDER_CAPABILITY_UNSUPPORTED`.

## Authorization

Catalogue extended with `workflow.engine.*` / `read` / `health` / `diagnostics` / `capabilities`. Mapped via `workflowEngineOps`. Production Authorization only — no allow-all implementation for this surface’s production path.

## RequestPipeline

Engine facets wrapped with `wrapServiceWithPipeline` using dedicated service names (`workflowEngineWorkflows`, …).

## Bootstrap

- Production: `createWorkflowEngineServicesForProduction({ adapter })` — adapter required.
- Test: mock adapter via `createMockN8nFetch` or unavailable stubs.
- Platform factories accept a prebuilt `engine` bundle (never silent mock).

## Error Mapping

`mapEngineError` / `mapProviderError` → `PlatformServiceError`. No REST errors or provider-specific leakage.

## Tests

Vitest suites `apzworkflow-007-n8n-platform-services.test.ts` + `apzworkflow-007-coverage.test.ts` — Platform Services, Gateway, Authorization, RequestPipeline, Bootstrap, error translation, capabilities/health/diagnostics/compatibility. Mock adapter only.

## Coverage

Scoped engine façade files (`*engine*`, `unavailable-workflow-engine*`): **100%** statements / branches / functions / lines.

## Quality Gates

| Gate                                                       | Result      |
| ---------------------------------------------------------- | ----------- |
| Typecheck (`workflow-contracts`, `platform-services`)      | PASS        |
| Lint (`platform-services`)                                 | PASS        |
| Vitest (workflow + 007 suites)                             | PASS        |
| Scoped coverage ≥95%                                       | PASS (100%) |
| `pnpm audit:workflow-n8n-platform-services`                | PASS        |
| `pnpm audit:workflow-platform-services` (updated versions) | PASS        |
| Boundary: apps/web no direct n8n import                    | PASS        |

## Technical Debt

- Engine unavailable in apps/web bootstrap until 008 configures production adapter wiring via HTTP.
- Users/projects remain edition-dependent (adapter NOT_SUPPORTED on 404).
- No HTTP/OpenAPI yet (008).

## Recommendation

**APZWORKFLOW-008 — n8n HTTP API & Production Typed Client** only. Do **not** implement until explicit owner approval.

---

**Stop condition met.** Await owner approval before APZWORKFLOW-008.
