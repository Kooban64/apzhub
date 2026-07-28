# ADR-0068: Workflow Platform as First-Class Platform Capability

## Status

**Accepted** — APZHUB-PLATFORM-WORKFLOW-001 (2026-07-19)

## Context

APZ-WORKFLOW-001 (**ACCEPTED**, READY WITH CONDITIONS) established commercial Release 1.0 planning for **APZ Workflow**. The repository already contains a frozen APZWORKFLOW engineering wave (SoR management plane + read-only n8n engine discovery — PRODUCTION_READY_WITH_LIMITATIONS). That wave is **not** yet recognised in Knowledge Foundation / EA catalogues as the canonical **shared Workflow Platform capability** that orchestrates across all APZHUB products.

Without a first-class platform definition:

- Commercial product work risks embedding product-specific logic in modules
- Execute / schedule / HITL expansions risk ad-hoc bypass of Platform Services
- Confusion grows with Platform Event Bus, Jobs, Notifications, and product “workflow” naming (Law/TCMS)

Evidence:

- Freeze: [APZHUB-Workflow-Engine-Architecture-Freeze-Notice](../architecture/APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md)
- Packages: `workflow-contracts` **0.3.0** · `workflow-core` / `workflow-persistence` **0.1.1** · `integration-n8n` **0.1.0**
- Commercial pack: [docs/products/apz-workflow/](../products/apz-workflow/README.md)

## Decision

1. Establish **Workflow Platform** as a **first-class shared platform capability** — the canonical orchestration layer for APZHUB products.
2. Workflow Platform **must not** contain product-specific business logic (Projects/Support/Time/etc. rules stay in those Platform Services).
3. **Request path** remains: Module → Gateway → Auth → Authz → Workflow Platform Services → Integration Adapter → Engine.
4. **Platform owns:** orchestration contracts, lifecycle, execution model (target), scheduling model (target), history, templates, triggers, HITL/approvals/manual tasks (target), variables, credential **references**, retries/error/compensation policies, health/diagnostics/observability hooks, provider abstraction.
5. **Products consume** Workflow Platform via APIs/events — they do not call engines or adapters directly.
6. **Existing APZWORKFLOW frozen wave** is the **current engineering baseline** (SoR + read-only engine). This ADR **recognises** the target platform capability and does **not** silently unfreeze packages or authorise execute/schedule code.
7. Expansion beyond the freeze (execution, scheduling, mutations, workers, new engines, new HTTP/Workbench surfaces) requires **separate Owner-approved programmes** and, where freeze policy demands, additional ADRs.
8. **Not** the Workflow Platform: Platform Event Bus (transport), Outbox (reliability), Notification Framework (delivery), Search (indexing), Command Palette (UI actions), product domain SoRs.

## Consequences

- Workflow is formally a platform capability in architecture catalogues and KF.
- Commercial APZ Workflow and other products share one orchestration plane.
- Frozen APZWORKFLOW packages remain frozen until Owner-approved unlock programmes.
- Companion [ADR-0069](./ADR-0069-n8n-workflow-engine-provider.md) selects n8n as primary provider.
- This ADR does **not** authorise implementation of contracts/services/APIs/Workbench/n8n changes.

## Related

- [Workflow Platform](../platform/workflow/WORKFLOW-PLATFORM.md)
- [Workflow Architecture](../platform/workflow/WORKFLOW-ARCHITECTURE.md)
- [APZ-WORKFLOW-001 pack](../products/apz-workflow/README.md)
- [Workflow Engine Freeze Notice](../architecture/APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md)
