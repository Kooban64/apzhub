# APZHUB Configuration Reference Standard

**Status:** Official APZHUB Platform Configuration Reference Standard  
**Declared:** APZCONFIG-006 (2026-07-16)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS (metadata management plane)

---

## Purpose

This document declares the certified Platform Configuration System of Record as the **reference pattern** for future APZHUB platform capability programmes that manage metadata SoRs (not runtime engines).

## Certified lifecycle (mandatory)

Future platform capabilities must follow the same programme lifecycle unless an approved ADR authorises a deviation:

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

## Configuration-specific reference properties

| Property           | Standard                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Domain             | Metadata SoR for configuration keys, namespaces, groups, versions, overrides, scopes, validation, references, audit |
| Distinct from      | Runtime `@apzhub/config` configuration-manager                                                                      |
| Lifecycle          | draft → validated → approved → published → deprecated → archived                                                    |
| Published versions | Immutable                                                                                                           |
| Runtime apply      | Out of scope for this standard                                                                                      |
| Secrets / flags    | Separate future platforms — not Configuration SoR                                                                   |

## Non-negotiable absences (for this standard)

A Configuration-like metadata SoR must not silently absorb:

- runtime resolution engines
- feature-flag evaluation
- secret storage/resolution
- Event Bus delivery planes

Those require separate programmes and ADRs.

## Governance

Deviations require ADR + owner approval. Wave freeze notice: [Architecture Freeze Notice](./APZHUB-Configuration-Architecture-Freeze-Notice.md).
