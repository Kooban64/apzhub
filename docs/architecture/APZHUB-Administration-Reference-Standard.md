# APZHUB Administration Reference Standard

**Status:** Official APZHUB Platform Administration Reference Standard  
**Declared:** APZADMIN-006 (2026-07-16)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS (metadata governance plane)

---

## Purpose

This document declares the certified Platform Administration System of Record as the **canonical governance layer** for APZHUB platform capability metadata.

Administration coordinates registered platform capabilities through metadata. It **never** owns or duplicates the operational domains of Identity, Projects, Support, Testing, Reporting, Documents, Search, Workflow, Workflow Engine, Notifications, or Configuration.

## Certified lifecycle (mandatory)

Future governance-related platform programmes must follow the same lifecycle unless an approved ADR authorises a deviation:

```text
Foundation
→ Platform Services (Gateway + RequestPipeline + Authorization)
→ HTTP API + OpenAPI + Production Typed Client
→ Workbench (manifest-driven)
→ Vertical Certification
→ Wave Certification & Architecture Freeze
```

## Certified architecture shape

```text
Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz
→ Platform Services → Domain Core → Persistence → PostgreSQL
```

Rules:

- Presentation never bypasses Platform Services
- Typed clients call HTTP only
- HTTP handlers call gateway facets only
- Business rules live in Domain Core
- Persistence is adapter-only
- Production Authorization is deny-by-default
- Administration links to products; never embeds product Workbenches or fetches product SoRs

## Administration-specific reference properties

| Property                | Standard                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Domain                  | Metadata SoR for modules, registrations, capabilities, navigation, policies, dashboards, widgets, audit, diagnostics |
| Distinct from           | Platform Operations (`/workspace/operations`)                                                                        |
| Product ownership       | None — coordinates via registration metadata only                                                                    |
| Runtime admin           | Out of scope for this standard                                                                                       |
| Identity / provisioning | Separate future programmes (e.g. APZIDENTITY)                                                                        |

## Permissions catalogue (frozen)

`admin.*` · `admin.read` · `admin.manage` · `admin.audit` · `admin.policy` · `admin.diagnostics` · `admin.navigation` · `admin.registration`

## Deviations

Any deviation from this Reference Standard requires an approved ADR and owner authorisation.

## See also

- [Architecture Freeze Notice](./APZHUB-Administration-Architecture-Freeze-Notice.md)
- [Future Administration Platform Guide](../developer/APZHUB-Future-Administration-Platform-Guide.md)
