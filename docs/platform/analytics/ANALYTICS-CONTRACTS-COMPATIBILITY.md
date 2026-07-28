# Analytics Contracts — Compatibility Notes

> **Programme:** APZHUB-PLATFORM-ANALYTICS-003  
> **Package:** `@apzhub/analytics-contracts` **0.1.0**

| Concern                           | Note                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| Metrics SoR                       | `AnalyticsMetric` / `AnalyticsKPI` are **refs** — do not redefine Metrics contracts            |
| Reporting SoR                     | `AnalyticsReport` is a **link** — Reporting owns artefacts                                     |
| Observability / Metrics platforms | Out of scope (ADR-0066)                                                                        |
| Metabase adapter                  | `@apzhub/integration-metabase` **0.1.0** CERTIFIED_FOUNDATION — maps opaquely to `providerRef` |
| Future providers                  | Same contracts; new adapter + providerId                                                       |
| platform-service-contracts        | Unchanged — Analytics uses dedicated package (metrics/observe pattern)                         |
| Integration SDK                   | **1.0.0** frozen — no SDK changes in this programme                                            |
