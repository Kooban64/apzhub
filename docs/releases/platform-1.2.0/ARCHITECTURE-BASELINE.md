# Architecture Baseline — Platform 1.2.0

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-22  
> **Status:** **Frozen**

## Layered architecture (mandatory)

```text
Presentation (Workbench / HTTP handlers)
      ↓
Platform Services (business logic only)
      ↓
Service Connector / Integration Adapter
      ↓
Backend Engine
```

Verified domains under certification train (CERT-003 architecture verification **PASS**):

| Domain                     | Baseline status                                                           |
| -------------------------- | ------------------------------------------------------------------------- |
| Platform Runtime           | Frozen capability registry / bootstrap                                    |
| Workbench Framework        | Frozen shell regions + engines                                            |
| Identity / Authorization   | BetterAuth + APZHUB permissions ownership                                 |
| Administration             | Admin vertical frozen (APZADMIN-006)                                      |
| Registry / manifests       | Manifest-first discovery retained                                         |
| Platform Services          | `@apzhub/platform-services` **0.30.0**                                    |
| Integration SDK            | `@apzhub/integration-sdk` **1.0.0** frozen                                |
| Platform Service Contracts | `@apzhub/platform-service-contracts` **0.18.0**                           |
| OpenAPI                    | Platform API **1.12.0**                                                   |
| Products                   | Projects · Time · Support · Documents · TCMS · Law · Analytics · Workflow |

## Forbidden at freeze

- Module → Connector bypass
- Service → Engine bypass
- Silent architecture changes without ADR + Owner Approval
- Beginning Platform 1.3 without Release Acceptance of this programme

## Related

- Constitution **000** · Foundation **001–029**
- [Enterprise Architecture Catalogue](../../architecture/ENTERPRISE-ARCHITECTURE-CATALOGUE.md)
- Prior packaging [platform/1.2.0](../platform/1.2.0/README.md)
