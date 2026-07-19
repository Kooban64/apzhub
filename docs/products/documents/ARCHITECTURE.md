# APZ Documents — Architecture

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [documents/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Purpose

Enterprise document metadata, versions, and discovery inside APZHUB.

## Primary users

Knowledge workers, legal staff, project teams.

## Boundary statement

Products extend the platform. **APZ Documents does not redesign** frozen Platform Foundation, Integration SDK **1.0.0**, or other Architecture Frozen subsystems without ADR + Owner.

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

- Register/manage document metadata → version descriptors → search discovery
- Open Documents workspace (management plane)

## Platform services consumed

`DocumentPlatformGateway` / `gateway.document*` · `@apzhub/document-contracts` **0.3.0** · document-core **0.3.0** · persistence · HTTP `/api/v1/documents` · Workbench `/workspace/documents` · `@apzhub/search-documents` **0.1.0**.

## Required integrations

Native platform Documents SoR (APZDOCS-001…006). **No Paperless-ngx adapter** on disk.

## Events published

- None — Event Bus excluded from certified Documents non-goals

## Events consumed

None declared.

## Security model

Platform AuthN/AuthZ · document permissions · storage credentials platform-owned · no engine UI.

## Provisioning model

Documents capability enablement via platform governance/provisioning.

## Extension points

Search publication adapter · Workbench module · gateway facets.

## Platform work still required

- Binary upload/download/OCR/preview remain out of certified scope unless Owner + ADR reopen freeze
- Product packaging beyond platform Documents management plane

## Architecture references

- [Platform Document Architecture](../../architecture/APZHUB-Platform-Document-Architecture.md)
- [Document Platform Services Architecture](../../architecture/APZHUB-Document-Platform-Services-Architecture.md)
- [Document Vertical Certification](../../architecture/APZHUB-Platform-Document-Vertical-Certification.md)
- [Document Domain Model](../../architecture/APZHUB-Platform-Document-Domain-Model.md)

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
