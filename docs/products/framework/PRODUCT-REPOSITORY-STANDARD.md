# Product Repository Standard

> **Programme:** APZHUB-PRODUCTS-002 · Baseline: Platform 1.4 monorepo (004)

## Standard layout (product concerns)

Products live inside the APZHUB monorepo. Do not create separate product repos unless Owner authorises.

```text
/apps                    # Next.js shell & product-facing apps (e.g. law-platform)
/packages                # Shared libs · UI · contracts · persistence · SDKs
/services                # Platform / product Platform Services (service.yaml)
/modules                 # Product modules (module.yaml) — presentation only
/adapters · /integrations # Service Connectors (integration.yaml)
/libs                    # Shared non-product utilities (sparingly)
/docs/products/{id}/     # Product documentation packs
/docs/products/framework/ # This Product Engineering Framework (binding)
/docs/releases/{id}/     # SemVer release evidence
/docs/operations/        # OR / REM / BLD / CERT patterns (product-scoped as needed)
/tests · /testing        # Shared test tooling / fixtures
/scripts                 # Product audit / certify scripts (apz*.mjs)
/infrastructure · /docker # Deploy topology (self-hosted first)
```

## Documentation

| Path                                | Contents                                               |
| ----------------------------------- | ------------------------------------------------------ |
| `docs/products/framework/`          | Binding Product Engineering Framework (this programme) |
| `docs/products/{product}/`          | Living product pack (VISION, ARCHITECTURE, …)          |
| `docs/releases/{product}/{semver}/` | Release certification evidence                         |
| `docs/foundation/`                  | KF status — update on Acceptance, do not fork          |

## Packages & applications

| Kind                      | Rule                                                                   |
| ------------------------- | ---------------------------------------------------------------------- |
| Module packages           | Presentation only; depend on published SDKs / Platform Service clients |
| Platform Service packages | Business logic only; orchestrate connectors                            |
| Integration packages      | Adapter only; no product business rules                                |
| Apps                      | Shell routes; no engine clients                                        |

## Testing

| Location                      | Use                                 |
| ----------------------------- | ----------------------------------- |
| Colocated `*.test.ts`         | Unit / component                    |
| `*.integration.test.ts`       | DB / adapter integration            |
| `testing/` · Playwright specs | E2E product journeys                |
| `scripts/apz*-*.mjs`          | Architecture / certification audits |

## Evidence & operations

| Artefact                    | Location                                                                          |
| --------------------------- | --------------------------------------------------------------------------------- |
| Programme evidence JSON     | `docs/operations/evidence/` or release evidence folders                           |
| OR / REM / BLD / CERT packs | Product-scoped under `docs/products/` or `docs/operations/`                       |
| Owner Acceptance            | Pack + [OWNER-ACCEPTANCE-REGISTER](../../foundation/OWNER-ACCEPTANCE-REGISTER.md) |

## Prohibitions

- Do not place business logic in modules or UI packages
- Do not add engine HTTP clients outside integrations/adapters
- Do not hardcode product registration in the shell (Module Registry)
- Do not commit secrets
- Do not modify Platform 1.4 freezes from a product folder without Platform programme
