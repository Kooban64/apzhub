# APZ Workflow — Architecture

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [workflow/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Purpose

Define, govern, and observe automation workflows under APZHUB without n8n-facing UX.

## Primary users

Automation builders, ops, product admins.

## Boundary statement

Products extend the platform. **APZ Workflow does not redesign** frozen Platform Foundation, Integration SDK **1.0.0**, or other Architecture Frozen subsystems without ADR + Owner.

## Request path (mandatory)

```text
Client / Module UI
  → APZHUB API Gateway
  → Auth → Authz → Validation
  → Platform Service
  → Service Connector (Adapter)   # when OSS-backed
  → Backend Engine                # when OSS-backed
```

Native products use Platform Services → platform persistence (still no Module → DB bypass).

## Major workflows

- Manage workflow metadata in Platform Workflows workbench
- Browse engine workflows/templates (read-only)
- Validate definitions (advisory)

## Platform services consumed

`gateway.workflow.*` (SoR) · `gateway.workflow.engine.*` · workflow-contracts **0.3.0** · workflow-core **0.1.1** · persistence **0.1.1** · HTTP `/api/v1/workflows` + `/api/v1/workflows/engine/*` · Workbench `/workspace/workflows` and `/workspace/workflow-engine`.

## Required integrations

`@apzhub/integration-n8n` **0.1.0** Reference Adapter (read-only). Native Workflow SoR packages present.

## Events published

- None — Event Bus excluded from certified Workflow waves

## Events consumed

None declared.

## Security model

Platform AuthN/AuthZ · workflow.* / workflow.engine.* permissions · n8n credentials connector-internal · brand masking.

## Provisioning model

Workflow product/engine enablement via governance flags and platform-provisioning.

## Extension points

Workbench modules · typed clients · Integration SDK adapter.

## Platform work still required

- Execution/scheduling/mutations require Owner + ADR (freeze forbids silent expansion)
- Product UX expansion within freeze only under Owner-approved programmes

## Architecture references

- [Workflow Platform Services Architecture](../../architecture/APZHUB-Workflow-Platform-Services-Architecture.md)
- [Workflow Gateway Architecture](../../architecture/APZHUB-Workflow-Gateway-Architecture.md)
- [Workflow Engine Architecture Freeze Notice](../../architecture/APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md)
- [APZWORKFLOW-010 Vertical Certification](../../reviews/APZWORKFLOW-010-Vertical-Certification.md)

## Related standards

- [PRODUCT-ARCHITECTURE-STANDARD](../PRODUCT-ARCHITECTURE-STANDARD.md)
- [003 System Architecture](../../003-overall-system-architecture-design-principles.md)

## Implementation rule

A product may enter implementation only when:

1. This Product Definition Pack is complete
2. Architecture is Owner-approved
3. Dependencies are available on the platform
4. Product is marked **Implementation Ready** in [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)

Until then: **no production code** for this product programme.
