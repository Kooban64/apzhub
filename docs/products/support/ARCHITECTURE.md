# APZ Support — Architecture

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [support/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Purpose

Customer and internal support requests, knowledge articles, organisations and groups inside APZHUB.

## Primary users

Support agents, customers (where enabled), service managers.

## Boundary statement

Products extend the platform. **APZ Support does not redesign** frozen Platform Foundation, Integration SDK **1.0.0**, or other Architecture Frozen subsystems without ADR + Owner.

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

- Agent opens Support workspace → triage request → assign/transition
- Create/update article
- Organisation/group administration

## Platform services consumed

`support-service` · `gateway.support.*` · HTTP `/api/v1/support-*` · UI in `apps/web` · `@apzhub/search-support` **0.1.0**.

## Required integrations

`@apzhub/integration-zammad` **0.6.0** — Wave 2 closed.

## Events published

- Support Platform Service publishes `support.request.*` / `support.article.created` (APZHUB-1.1-003)
- ENF Attention path consumes Support domain events for in-app notifications

## Events consumed

None declared.

## Security model

Platform AuthN/AuthZ · support.* permissions · Zammad credentials connector-internal · brand masking.

## Provisioning model

Support product enablement via platform governance/provisioning; Zammad connector config platform-owned.

## Extension points

Workbench module · Search provider · typed client under apps/web/lib/support.

## Platform work still required

- Zammad webhook HTTP ingress (explicitly out of certified 1.0 scope)
- Binary attachments (metadata-only today)
- Realtime WS/SSE transport (in-app ENF Attention delivered under APZHUB-1.1-003)
- Product packaging / UX polish programmes only with Owner approval

## Architecture references

- [Support Platform Service Architecture](../../architecture/APZHUB-Support-Platform-Service-Architecture.md)
- [SUPPORT-VERTICAL-CERTIFICATION](../../architecture/SUPPORT-VERTICAL-CERTIFICATION.md)
- [SUPPORT-UI-CERTIFICATION](../../architecture/SUPPORT-UI-CERTIFICATION.md)
- [Support Module UI](../../architecture/APZHUB-Support-Module-UI.md)

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
