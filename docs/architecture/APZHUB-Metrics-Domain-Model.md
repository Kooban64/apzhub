# APZHUB Metrics Domain Model

**Milestone:** APZMETRICS-001  
**Package:** `@apzhub/metrics-contracts`

## Entities (metadata only)

| Entity                | Role                                            |
| --------------------- | ----------------------------------------------- |
| Metric                | Canonical metric identity (`key` immutable)     |
| MetricDefinition      | Versioned definition (kind, unit, formula refs) |
| MetricVersion         | Version control record                          |
| MetricCategory        | Taxonomy category                               |
| MetricGroup           | Logical grouping                                |
| MetricDimension       | Dimension metadata                              |
| MetricLabel           | Label metadata                                  |
| MetricUnit            | Unit catalogue                                  |
| MetricFormula         | Formula expression metadata (**not evaluated**) |
| MetricAggregation     | Aggregation method metadata                     |
| MetricThreshold       | Threshold metadata (**not evaluated**)          |
| MetricOwner           | Ownership binding                               |
| MetricConsumer        | Consumer registration                           |
| MetricRetentionPolicy | Retention metadata                              |
| MetricClassification  | Classification catalogue                        |
| MetricDependency      | Metric→metric dependency                        |
| KPI                   | KPI definition referencing a Metric             |
| KPIGroup              | KPI grouping                                    |
| KPITarget             | Target metadata (**not executed**)              |
| MetricRelationship    | Canonical relationships                         |
| MetricMetadata        | Generic subject metadata                        |

Every entity includes: branded `id`, `tenantId`, optional `organisationId`, audit fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `revision`), and optional `metadata`.

## Enumerations

Lifecycle: `draft` | `active` | `inactive` | `archived`  
Kinds: `counter` | `gauge` | `histogram` | `summary` | `ratio` | `derived` | `unknown`  
Plus aggregation methods, dimension data types, formula languages, threshold operators/severities, party types, classification levels, dependency/relationship kinds.
