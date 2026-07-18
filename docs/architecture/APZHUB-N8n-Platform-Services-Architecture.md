# APZHUB n8n Platform Services Architecture

**Milestone:** APZWORKFLOW-007  
**Status:** Complete  
**Packages:** `@apzhub/workflow-contracts` **0.3.0** · `@apzhub/platform-services` **0.20.0** · `@apzhub/integration-n8n` **0.1.0** (frozen)

---

## Chain

```text
Workflow Platform (SoR)
        ↓
Platform Services (thin)
        ↓
Integration SDK
        ↓
n8n Adapter (certified)
        ↓
n8n
```

No shortcuts. Clients never call the adapter. Workbench / HTTP are out of scope for 007.

---

## Gateway

Existing `PlatformServiceGateway.workflow` gains nested:

```text
gateway.workflow.engine.*
```

Facets: `workflows` · `templates` · `tags` · `users` · `projects` · `capabilities` · `health` · `diagnostics` · `compatibility` · `connection`

Request path for every operation:

```text
Gateway → RequestPipeline → Production Authorization → Platform Services → n8n Adapter
```

---

## Thin services

`createWorkflowEngineServiceImpls` delegates to `adapter.core` / `adapter.operations` / `adapter.testConnection`. No business logic, no REST, no mapping beyond capability snapshot projection.

Mutations (`create` / `update` / `delete` / `execute`) always reject as `PROVIDER_CAPABILITY_UNSUPPORTED` (`NOT_SUPPORTED`).

---

## Bootstrap

| Factory                                                                      | Behaviour                                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `createWorkflowEngineServicesForProduction({ adapter })`                     | Requires explicit `N8nAdapter` — no mock / in-memory fallback |
| `createWorkflowEngineServicesForTest({ adapter \| allowUnavailableEngine })` | Mock adapter or unavailable stubs                             |
| `createWorkflowPlatformServices*(…, { engine })`                             | Injects prebuilt engine bundle; omit → unavailable stubs      |

---

## Authorization

Permissions: `workflow.engine.*` · `workflow.engine.read` · `workflow.engine.health` · `workflow.engine.diagnostics` · `workflow.engine.capabilities`

Mapped via `workflowEngineOps` in Production Authorization. No allow-all for production.

---

## Security

Metadata only. Never expose API keys, tokens, credentials, secrets, webhook values, runtime variables, or execution payloads.
