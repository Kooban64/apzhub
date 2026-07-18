# APZHUB Workflow Engine Reference Adapter Standard

> **Purpose:** Mandatory engineering standard for every future Workflow Engine provider adapter  
> **Audience:** Platform engineers, integration authors, AI agents, reviewers  
> **Status:** Mandatory — Wave closeout APZWORKFLOW-011  
> **Last updated:** 2026-07-16  
> **Reference implementation:** `@apzhub/integration-n8n` (n8n) **0.1.0**  
> **Parent standard:** [REFERENCE-ADAPTER-STANDARD](./REFERENCE-ADAPTER-STANDARD.md) · [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [008](../008-module-plugin-connector-architecture.md)

---

## 1. Purpose

This document freezes the architecture proven by the **n8n** Workflow Engine programme (APZWORKFLOW-006 … APZWORKFLOW-011). Every future workflow-engine adapter **must** comply.

**`@apzhub/integration-n8n` is the official APZHUB Workflow Engine Reference Adapter.** Copy the **standard**, not n8n product semantics.

Future engines (documentation examples only — **not implemented**):

- Camunda
- Temporal
- Flowable
- Zeebe
- Other workflow engines approved by owner

Deviations require an ADR and owner approval.

---

## 2. System of Record rules

| Concern                                                                            | Owner                                                                |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Workflow **management plane** (definitions, versions, lifecycle, templates, audit) | **APZHUB Workflow Platform** (SoR)                                   |
| Engine **runtime metadata** (provider workflows, tags, users, projects, health)    | External engine via adapter (read-only in this wave)                 |
| Execution / scheduling / mutations                                                 | **Not in scope** for Reference Adapter wave — future milestones only |

Adapters are **information providers** for engine metadata. They must not execute workflows, own schedules, or expose credentials unless a future milestone explicitly authorises it.

---

## 3. Layering (non-negotiable)

```text
Workflow Engine Workbench
       ↓
createHttpWorkflowEngineClient() / engine-api
       ↓
HTTP API (/api/v1/workflows/engine/*)
       ↓
PlatformServiceGateway.workflow.engine.*
       ↓
RequestPipeline + Production Authorization (workflow.engine.*)
       ↓
Platform Services (thin orchestration)
       ↓
Integration SDK
       ↓
Vendor Workflow Engine Adapter (@apzhub/integration-{provider})
       ↓
Internal REST client (package-private)
       ↓
Vendor engine API
```

| Layer                    | May depend on                               | Must not depend on                                  |
| ------------------------ | ------------------------------------------- | --------------------------------------------------- |
| Workbench / typed client | HTTP `/api/v1/workflows/engine/*` only      | Gateway, platform-services, adapters, workflow-core |
| HTTP handlers            | Gateway bootstrap, contracts, auth          | Adapter packages, workflow-core, persistence        |
| Platform Services        | Adapter **public** API via Integration SDK  | Adapter `internal/`, vendor DTOs, apps/web          |
| Adapter                  | Integration SDK, workflow-contracts (types) | `platform-services`, HTTP routes, Workbench         |
| Workflow Platform SoR    | Core + persistence                          | Engine adapter internals                            |

---

## 4. Package layout

```text
integrations/{provider}/
  integration.yaml
  package.json                 # @apzhub/integration-{provider}
  src/
    index.ts                   # Public exports only
    {provider}-adapter.ts      # extends IntegrationAdapterBase
    {provider}-factory.ts
    {provider}-config.ts
    {provider}-error-mapper.ts
    capabilities/
    services/                  # read-only metadata capabilities
    mappers/
    models/                    # canonical metadata (no vendor DTO exports)
    internal/                  # REST client + vendor DTOs — never public
    operations/                # health, diagnostics, compatibility
    testing/                   # mock + fixtures
```

---

## 5. Mandatory capabilities (Reference Adapter wave)

| Capability                           | Requirement                            |
| ------------------------------------ | -------------------------------------- |
| Connection / auth config             | Explicit; no silent mock in production |
| Health / diagnostics / compatibility | Required                               |
| Capability discovery                 | Supported vs unsupported operations    |
| Workflow list/get (metadata)         | Read-only                              |
| Templates / tags / users / projects  | As provider allows (partial OK)        |
| Validate connection                  | Required                               |

---

## 6. Explicitly unsupported (this wave)

- Workflow execution / runs
- Activate / deactivate
- Scheduling
- Mutations (create/update/delete definitions)
- Designer / drag-and-drop
- Event Bus / workers / queues
- Runtime credential management UI
- Webhook ingress

---

## 7. Gateway & HTTP pattern

- Facet: `gateway.workflow.engine.*`
- Permissions: `workflow.engine.{read,health,diagnostics,capabilities}`
- HTTP: `/api/v1/workflows/engine/*` under OpenAPI tag **Workflow Engine**
- Typed client: `createHttpWorkflowEngineClient()` only — no Gateway imports in UI

---

## 8. Certification & freeze

Before merge of any new workflow-engine adapter:

1. `integration.yaml` before code
2. Integration SDK conformance
3. Architecture / dependency / boundary audits
4. Platform Services wiring only via approved milestone
5. OpenAPI + typed client + Workbench only when authorised

**n8n wave (006–011) is frozen.** See [Architecture Freeze Notice](./APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md).

---

## Related

- [Final Architecture](./APZHUB-Workflow-Engine-Final-Architecture.md)
- [n8n Adapter Architecture](./APZHUB-N8n-Adapter-Architecture.md)
- [Future Adapter Development Guide](../developer/APZHUB-Workflow-Engine-Future-Adapter-Development-Guide.md)
- [APZWORKFLOW-011 Completion Report](../sprint/APZWORKFLOW-011-completion-report.md)
