# APZHUB Workflow Engine — Operational Readiness Guide

**Milestone:** APZWORKFLOW-011  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Audience:** Operators, platform engineers

---

## Supported capabilities

- Read-only engine metadata: workflows, templates, tags, users, projects
- Capabilities / health / diagnostics / compatibility
- Connection validation
- Engine Workbench at `/workspace/workflow-engine` (presentation only)
- Typed client + OpenAPI **Workflow Engine** tag
- Production Authorization (`workflow.engine.*`) via RequestPipeline

## Intentionally unsupported

- Execution / runs
- Activate / deactivate
- Scheduling
- Definition mutations
- Designer / drag-and-drop
- Event Bus / workers / queues / notifications / AI
- Runtime credential management UI
- Webhooks

## Known limitations

- Live n8n optional — requires explicit `APZHUB_WORKFLOW_ENGINE_*` bootstrap
- Definition viewer shows metadata counts (not full node graphs)
- Playwright live webServer may be LIMITED by unrelated Testing slug conflict
- No silent mock adapter in production

## Security posture

- Auth required on every engine HTTP route
- Authz via Production Authorization (no allow-all)
- Secrets not in UI/client view models
- Provider/stack details filtered in client errors
- Adapter read-only security boundary

## Production deployment expectations

1. Deploy Workflow Platform SoR as certified (001–005)
2. Optionally enable engine: set `APZHUB_WORKFLOW_ENGINE_ENABLED=true` with `APZHUB_WORKFLOW_ENGINE_BASE_URL` (+ API key / auth mode refs)
3. Grant `workflow.engine.*` permissions as needed
4. Monitor health/diagnostics via Workbench or HTTP

## Configuration requirements

| Variable                                          | Role                              |
| ------------------------------------------------- | --------------------------------- |
| `APZHUB_WORKFLOW_ENGINE_ENABLED`                  | Opt-in engine wiring              |
| `APZHUB_WORKFLOW_ENGINE_BASE_URL`                 | Required when enabled             |
| `APZHUB_WORKFLOW_ENGINE_API_BASE_URL`             | Optional API prefix               |
| `APZHUB_WORKFLOW_ENGINE_API_KEY` / `_API_KEY_REF` | Auth material / secret ref        |
| `APZHUB_WORKFLOW_ENGINE_AUTH_MODE`                | `api_key` (default) / PAT / basic |

## Maintenance expectations

- Re-run `pnpm audit:workflow-vertical` and `pnpm audit:workflow-engine-vertical` / `pnpm audit:workflow-engine-wave` on regressions
- Do not change frozen architecture without ADR + owner approval
- Future engines follow [Reference Adapter Standard](../architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md)
