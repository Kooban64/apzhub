# APZHUB Platform Workflow OpenAPI Guide

**Milestone:** APZWORKFLOW-003  
**Spec:** [`docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`](../specs/APZHUB-Platform-OpenAPI-v1.yaml)  
**Tag:** **Platform Workflow**  
**Info version:** **1.2.0**

## Validate

```bash
pnpm openapi:validate:platform
```

## Coverage

All `/api/v1/workflows` routes are declared under tag **Platform Workflow**, including optional HTTP-only stubs (`capabilities`, `health`, `readiness`, `diagnostics`).

Request schemas:

- `CreateWorkflowRequest` / `UpdateWorkflowRequest` / `TransitionWorkflowRequest`
- `CreateWorkflowVersionRequest` / `WorkflowGraphSnapshot`
- `CreateWorkflowTemplateRequest` / `UpdateWorkflowTemplateRequest`
- `CreateWorkflowCategoryRequest` / `CreateWorkflowFolderRequest`
- `ValidateWorkflowRequest`

## Non-goals in OpenAPI

No execute/runs/n8n/schedule paths. No activate/deactivate. Categories/folders have no PATCH/DELETE.
