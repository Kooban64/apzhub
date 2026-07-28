# Workflow Contracts — Release Notes

> **Package:** `@apzhub/workflow-contracts` **0.4.0**  
> **Programme:** APZHUB-PLATFORM-WORKFLOW-003  
> **Date:** 2026-07-19

---

## Summary

Additive release delivering the canonical provider-neutral Workflow Platform Contracts aligned to the Workflow Information Model, while preserving the APZWORKFLOW SoR and engine discovery surfaces.

## Added

- Runtime / operations domain models (`WorkflowRun`, `WorkflowRunStep`, `WorkflowSchedule`, `WorkflowTriggerBinding`, HITL tasks, secrets refs, health, capability, provider, …)
- Service interfaces: `WorkflowRunService`, `WorkflowScheduleService`, `WorkflowTaskService`, `ApprovalService`, `NotificationService`, `CapabilityService`, `HealthService`
- Composition type `WorkflowCanonicalGateway`
- Permission keys for runs / schedules / tasks / credentials / admin + `WORKFLOW_PERMISSION_OPERATIONS` mappings
- Example shapes + contract validation tests
- Documentation pack under `docs/platform/workflow/WORKFLOW-CONTRACTS*.md`

## Changed

- Package version **0.3.0 → 0.4.0**
- Programme attribution on package description

## Unchanged

- Existing definition-plane models and `PlatformWorkflowService`
- `WorkflowPlatformGateway` required facets
- `WorkflowEngineGateway` read-only discovery surface
- Integration SDK **1.0.0**

## Prerequisite Owner Decision

- Workflow Platform Foundation **COMPLETE**
- Workflow Information Model **COMPLETE**
- n8n Integration Foundation **CERTIFIED** (APZHUB-INTEGRATION-N8N-001)
