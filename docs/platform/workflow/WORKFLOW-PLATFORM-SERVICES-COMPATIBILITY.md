# Workflow Platform Services — Compatibility Statement

> **Programme:** APZHUB-PLATFORM-WORKFLOW-004  
> **Date:** 2026-07-19

---

## Compatibility class

**ADDITIVE** relative to APZWORKFLOW-002/007 platform services.

| Concern                              | Status                                    |
| ------------------------------------ | ----------------------------------------- |
| Existing SoR gateway facets          | Retained                                  |
| Engine discovery facets              | Retained                                  |
| Runtime facets on `gateway.workflow` | Added                                     |
| `@apzhub/workflow-contracts`         | **0.4.0 → 0.4.1** (gateway type extended) |
| `@apzhub/platform-services`          | **0.28.0** (additive runtime plane)       |
| n8n adapter                          | Unchanged **0.1.0** CERTIFIED_FOUNDATION  |

## Consumer impact

| Consumer                                          | Impact                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| HTTP / Workbench                                  | None yet (not implemented)                                            |
| Existing SoR callers                              | Compatible — additional required gateway fields supplied by factories |
| TypeScript consumers of `WorkflowPlatformGateway` | Must account for new required facets if constructing manually         |

## Provider matrix

| Provider | Ops                            | Execute                            |
| -------- | ------------------------------ | ---------------------------------- |
| Mock     | Default in tests               | Optional                           |
| n8n      | `createN8nWorkflowOpsProvider` | Not supported (records failed run) |
