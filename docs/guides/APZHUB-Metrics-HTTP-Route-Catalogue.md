# APZHUB Metrics HTTP Route Catalogue

**Milestone:** APZMETRICS-003  
**Base:** `/api/v1/metrics`  
**OpenAPI tag:** Platform Metrics Administration (spec **1.9.0**)

## CRUD facets

| Facet             | Collection                     | Item                                                |
| ----------------- | ------------------------------ | --------------------------------------------------- |
| metrics           | `GET/POST /metrics`            | `GET/PATCH /metrics/{metricId}`                     |
| definitions       | `GET/POST /definitions`        | `GET/PATCH /definitions/{definitionId}`             |
| versions          | `GET/POST /versions`           | `GET/PATCH /versions/{versionId}`                   |
| categories        | `GET/POST /categories`         | `GET/PATCH /categories/{categoryId}`                |
| groups            | `GET/POST /groups`             | `GET/PATCH /groups/{groupId}`                       |
| dimensions        | `GET/POST /dimensions`         | `GET/PATCH /dimensions/{dimensionId}`               |
| labels            | `GET/POST /labels`             | `GET/PATCH /labels/{labelId}`                       |
| units             | `GET/POST /units`              | `GET/PATCH /units/{unitId}`                         |
| formulas          | `GET/POST /formulas`           | `GET/PATCH /formulas/{formulaId}`                   |
| aggregations      | `GET/POST /aggregations`       | `GET/PATCH /aggregations/{aggregationId}`           |
| thresholds        | `GET/POST /thresholds`         | `GET/PATCH /thresholds/{thresholdId}`               |
| owners            | `GET/POST /owners`             | `GET/PATCH /owners/{ownerId}`                       |
| consumers         | `GET/POST /consumers`          | `GET/PATCH /consumers/{consumerId}`                 |
| retentionPolicies | `GET/POST /retention-policies` | `GET/PATCH /retention-policies/{retentionPolicyId}` |
| classifications   | `GET/POST /classifications`    | `GET/PATCH /classifications/{classificationId}`     |
| dependencies      | `GET/POST /dependencies`       | `GET/PATCH /dependencies/{dependencyId}`            |
| kpis              | `GET/POST /kpis`               | `GET/PATCH /kpis/{kpiId}`                           |
| kpiGroups         | `GET/POST /kpi-groups`         | `GET/PATCH /kpi-groups/{kpiGroupId}`                |
| kpiTargets        | `GET/POST /kpi-targets`        | `GET/PATCH /kpi-targets/{kpiTargetId}`              |
| relationships     | `GET/POST /relationships`      | `GET/PATCH /relationships/{relationshipId}`         |
| metadata          | `GET/POST /metadata`           | `GET/PATCH /metadata/{metadataId}`                  |

## Diagnostics

| Route                           | Gateway                    |
| ------------------------------- | -------------------------- |
| `GET /diagnostics/health`       | `diagnostics.health`       |
| `GET /diagnostics/readiness`    | `diagnostics.readiness`    |
| `GET /diagnostics/capabilities` | `diagnostics.capabilities` |
| `GET /health`                   | alias                      |
| `GET /readiness`                | alias                      |
| `GET /capabilities`             | management plane DTO       |
| `GET /management-diagnostics`   | management plane DTO       |

All routes use `withPlatformApiAuth`. Disabled service → `503 METRICS_SERVICE_UNAVAILABLE`.
