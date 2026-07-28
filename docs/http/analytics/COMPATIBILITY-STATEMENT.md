# Analytics HTTP API — Compatibility Statement

> **Programme:** APZHUB-PLATFORM-ANALYTICS-005

| Component                          | Version / status                         | Notes                                                          |
| ---------------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| Platform OpenAPI                   | **1.11.0**                               | Additive `/analytics/*` paths                                  |
| `@apzhub/analytics-contracts`      | **0.1.1**                                | Additive `getReadiness` · `listCategories`                     |
| `@apzhub/platform-services`        | **0.28.0**                               | Analytics HTTP-ready surface + pipeline permission propagation |
| `@apzhub/integration-metabase`     | **0.1.0**                                | Bootstrap-only (handlers never import)                         |
| Integration SDK                    | **1.0.0**                                | Frozen — unchanged                                             |
| Workbench                          | `/workspace/analytics/*` (ANALYTICS-006) | Presentation only — HTTP unchanged                             |
| APZ Analytics commercial packaging | Not delivered                            | Out of ANALYTICS-005/006 scope                                 |

## Compatibility guarantees

- Provider-neutral JSON only — no Metabase/session headers or vendor DTO fields.
- DELETE on saved resources archives (soft) — consistent with Time HTTP archive semantics.
- Controlled **503** when `APZHUB_ANALYTICS_ENABLED` is false.
