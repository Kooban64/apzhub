# APZHUB Platform Quality Permission Catalogue

**Milestone:** APZTCMS-014  

## Namespaces

| Prefix | Examples |
| ------ | -------- |
| `quality.*` | existing + `quality.registry.view/manage`, `quality.dashboard.view` |
| `release.*` | existing + `release.create/approve/decide` |
| `platform-quality.*` | view, aggregate, admin |
| `platform-release.*` | view, create, update, evaluate, admin |
| `dependency.*` | view, manage, validate, admin |
| `governance.*` | view, approve, decide, admin |

Merged into `APZ_TCMS_PERMISSIONS` and the platform permission catalogue.

Mapped in `OPERATION_AUTHORIZATION_MAPPINGS` for pipeline services  
`platformProductRegistry`, `platformDependency`, `platformQualityAggregate`, `platformMultiCert`, `platformProductHealth`, `platformQualityDashboard`, `platformQualityTraceability`, `platformRelease`, `platformGovernance`.

No role UI in this milestone.
