# Workflow Engine HTTP Architecture

**Milestone:** APZWORKFLOW-008  
**Status:** Complete  
**OpenAPI:** Platform API **1.3.0** · tag **Workflow Engine**

---

## Chain

```text
HTTP /api/v1/workflows/engine/*
  → withPlatformApiAuth
  → handlers (presentation)
  → PlatformServiceGateway.workflow.engine.*
  → RequestPipeline
  → Production Authorization
  → Workflow Platform Services
  → Integration SDK
  → n8n Adapter
  → n8n
```

No shortcuts. Handlers never import Platform Services factories or adapters.

---

## Routes (read-only)

| Path | Gateway |
| --- | --- |
| `GET .../workflows` | `engine.workflows.list` |
| `GET .../workflows/{id}` | `engine.workflows.get` |
| `GET .../templates` | `engine.templates.list` |
| `GET .../templates/{id}` | `engine.templates.get` |
| `GET .../tags` | `engine.tags.list` |
| `GET .../users` | `engine.users.list` |
| `GET .../projects` | `engine.projects.list` |
| `GET .../capabilities` | `engine.capabilities.get` |
| `GET .../health` | `engine.health.get` |
| `GET .../diagnostics` | `engine.diagnostics.get` |
| `GET .../compatibility` | `engine.compatibility.get` |
| `GET .../validate` | `engine.connection.validate` |

SoR routes under `/api/v1/workflows/*` (without `/engine`) remain unchanged.

---

## Bootstrap

- `APZHUB_WORKFLOW_ENABLED` — Workflow SoR + engine HTTP gate
- `APZHUB_WORKFLOW_ENGINE_ENABLED` — optional adapter wiring
- Requires `APZHUB_WORKFLOW_ENGINE_BASE_URL` when engine enabled — no silent mock in production
