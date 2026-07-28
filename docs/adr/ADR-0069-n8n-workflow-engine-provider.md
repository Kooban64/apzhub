# ADR-0069: n8n as Primary Workflow Engine Provider & Multi-Provider Abstraction

## Status

**Accepted** — APZHUB-PLATFORM-WORKFLOW-001 (2026-07-19)

## Context

OSS integration strategy and the frozen APZWORKFLOW engine wave select **n8n** as the Workflow Engine Reference Adapter (`@apzhub/integration-n8n` **0.1.0**, read-only metadata). Commercial Release 1.0 planning (APZ-WORKFLOW-001) names n8n as primary provider and lists Temporal, Camunda, Flowable, Azure Logic Apps, Power Automate as future providers.

Platform must remain provider-replaceable (003/008) without leaking engine brands into modules or service interfaces. Integration SDK **1.0.0** is Architecture Frozen ([ADR-0065](./ADR-0065-integration-sdk-v1-architecture-freeze.md)).

## Decision

1. **Primary provider:** n8n CE (self-hosted) for Workflow Platform engine execution capabilities **when** Owner-authorised programmes expand beyond the current read-only freeze.
2. **Integration form:** `@apzhub/integration-n8n` via Integration SDK **1.0.0** — health, discovery, diagnostics, error translation; future execute/schedule/credentials capabilities only via Owner-approved adapter expansion.
3. **Platform consumers** call Workflow Platform Services only — never n8n clients outside the adapter.
4. **User experience:** Standard users never use n8n login UI; Workbench is APZHUB-branded; engine branding masked.
5. **Provider abstraction:** Service contracts speak workflow/run/schedule/approval language; engine IDs remain connector-internal (011).
6. **Future providers:** Temporal · Camunda · Flowable · Azure Logic Apps · Power Automate · others may be added as adapters behind the same Workflow Platform services without product redesign — each requires Owner Approval (historically noted as APZWORKFLOW-012 roadmap class; no ID invented here).
7. **Non-providers for Workflow Platform:** Event Bus brokers, cron-only job runners without workflow semantics, product-local state machines (Law/TCMS), Analytics BI engines.
8. **Implementation** of execute/schedule/credential runtime against n8n (or any provider) requires a **separate named Owner Approval** — this ADR does not authorise code and does not lift the APZWORKFLOW freeze by itself.

## Consequences

- Formally records n8n as primary Workflow Engine provider in architecture.
- Enables multi-provider evolution without changing APZ Workflow module contracts.
- Current disk remains read-only Reference Adapter until Owner unlocks expansion.
- Integration SDK freeze remains: adapter changes follow SDK contracts + Owner Approval.

## Related

- [ADR-0068](./ADR-0068-workflow-platform-first-class-capability.md)
- [PROVIDER-STRATEGY](../platform/workflow/PROVIDER-STRATEGY.md)
- [ADR-0005 Integration SDK strategy](./ADR-0005-integration-sdk-strategy.md)
- [ADR-0065 Integration SDK freeze](./ADR-0065-integration-sdk-v1-architecture-freeze.md)
- [n8n Reference Adapter Standard](../architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md)
