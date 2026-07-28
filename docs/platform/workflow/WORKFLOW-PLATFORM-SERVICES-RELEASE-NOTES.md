# Workflow Platform Services — Release Notes

> **Programme:** APZHUB-PLATFORM-WORKFLOW-004  
> **Date:** 2026-07-19  
> **platform-services:** **0.28.0** · **workflow-contracts:** **0.4.1**

---

## Summary

Adds the Workflow runtime orchestration plane to `gateway.workflow`, implementing Owner-listed service classes over Workflow Contracts and the certified n8n integration (ops).

## Added

- `WorkflowRunServiceImpl`, `WorkflowScheduleServiceImpl`, `WorkflowTaskServiceImpl`, `ApprovalServiceImpl`, `NotificationServiceImpl`, `CapabilityServiceImpl`, `HealthServiceImpl`, `WorkflowServiceImpl`
- In-memory runtime registry + mock / n8n ops providers
- AuthZ operation mappings for runtime facets
- `services/workflow/service.yaml`
- Tests: **8** new (suite total workflow package **41**)
- Documentation pack under `docs/platform/workflow/WORKFLOW-PLATFORM-SERVICES*.md`

## Changed

- `WorkflowPlatformGateway` gains runtime facets (contracts **0.4.1**)
- Workflow factories compose runtime + SoR + engine

## Unchanged

- Integration SDK **1.0.0**
- n8n adapter execute freeze (read-only foundation)
- No HTTP / Workbench

## Prerequisite Owner Decision

- Workflow Contracts **ACCEPTED** (APZHUB-PLATFORM-WORKFLOW-003)
- n8n Integration Foundation **CERTIFIED**
