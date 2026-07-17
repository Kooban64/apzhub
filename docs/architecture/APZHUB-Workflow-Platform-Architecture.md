# APZHUB Workflow Platform Architecture

**Milestone:** APZWORKFLOW-001 — Platform Workflow Foundation  
**Status:** Authoritative for foundation packages  
**Audience:** Architects, platform engineers, AI agents

---

## Purpose

Defines the foundation architecture for the **APZHUB Workflow Platform**: engine-neutral workflow metadata, lifecycle, validation, and persistence. This milestone does **not** include execution engines, n8n, Event Bus, HTTP gateway, Workbench UI, workers, queues, scheduling, AI, or notifications.

---

## Layered request path

```text
Consumers → (future Platform Services) → Workflow Core → Persistence → (future engines)
```

| Layer | Package | Responsibility |
| --- | --- | --- |
| Contracts | `@apzhub/workflow-contracts` **0.1.0** | Domain types, permission catalogue, service ports |
| Core | `@apzhub/workflow-core` **0.1.0** | Lifecycle transitions, validation composition, foundation factory |
| Persistence | `@apzhub/workflow-persistence` **0.1.0** | In-memory + PostgreSQL metadata repositories |

Contracts must not import core or persistence. Core must not import persistence. Consumers of future services call ports only — never connectors or engines.

---

## Explicitly out of scope (APZWORKFLOW-001)

- n8n (or any vendor workflow engine) node types or SDKs
- Workflow execution / run state
- Event Bus publishing
- HTTP / Next.js routes / Workbench
- Workers, queues, BullMQ, scheduling
- Notifications / AI
- Platform Services gateway facet

---

## Persistence model

Canonical tables (migrations **0044** / **0045** RLS):

- `platform_workflow`
- `platform_workflow_version`
- `platform_workflow_template`
- `platform_workflow_category`
- `platform_workflow_folder`
- `platform_workflow_audit`

Metadata and JSONB graph snapshots only. Tenant RLS on all tables. No execution / queue / runtime tables.

---

## Related documents

- [Workflow Domain Model](./APZHUB-Workflow-Domain-Model.md)
- [Workflow Lifecycle Guide](../guides/APZHUB-Workflow-Lifecycle-Guide.md)
- [Workflow Validation Guide](../guides/APZHUB-Workflow-Validation-Guide.md)
- [Workflow Persistence Guide](../guides/APZHUB-Workflow-Persistence-Guide.md)
- [Workflow Permission Catalogue](../guides/APZHUB-Workflow-Permission-Catalogue.md)
- [Workflow Platform Developer Guide](../developer/APZHUB-Workflow-Platform-Developer-Guide.md)
