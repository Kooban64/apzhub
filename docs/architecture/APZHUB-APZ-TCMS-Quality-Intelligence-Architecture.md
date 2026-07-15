# APZ TCMS — Quality Intelligence Architecture

**Milestone:** APZTCMS-008  
**Packages:** contracts **0.5.0**, persistence **0.6.0**, services **0.4.0**

---

## Purpose

APZ TCMS stores **quality intelligence** as System of Record: defects (metadata + relationships), coverage metrics, quality snapshots, regression analysis, and explainable release/certification **readiness inputs**. No presentation layer.

---

## Factory

```ts
createQualityIntelligenceServices(deps);
createTestingDomainServices(deps); // → { …manual, automation, quality }
```

| Service                         | Role                                               |
| ------------------------------- | -------------------------------------------------- |
| `DefectLinkService`             | Internal/external defect refs + relationships      |
| `CoverageService`               | Deterministic recompute + persist coverage records |
| `QualityIntelligenceService`    | Rates, ratios, completeness, risk/defect metrics   |
| `QualityTrendService`           | Snapshot comparison (no prediction)                |
| `RegressionAnalysisService`     | New/resolved/reopened failures + deltas            |
| `ReleaseReadinessService`       | Multi-dimension readiness (`isDecision: false`)    |
| `CertificationReadinessService` | Structured cert inputs only                        |
| `RiskAggregationService`        | Risk rollups                                       |
| `QualitySummaryService`         | Scope rollup summary                               |

---

## Pipeline (conceptual)

```text
Manual executions + Automation imports + Traceability + Risks + Defects
        │
        ▼
Coverage engine (deterministic)
        │
        ├─ Quality intelligence snapshot
        ├─ Regression analysis
        ├─ Release readiness dimensions
        └─ Certification readiness inputs
```

Domain events via `DomainEventCollector` only — **no Event Bus**.

---

## Explicit exclusions

HTTP, Workbench UI, dashboards/charts, Jira/GitHub/ADO/GitLab sync, AI, CI/CD, notifications.

---

## Related

[Coverage Model](./APZHUB-APZ-TCMS-Coverage-Model.md) · [Defect Model](./APZHUB-APZ-TCMS-Defect-Model.md) · [Release Readiness Guide](./APZHUB-APZ-TCMS-Release-Readiness-Guide.md) · [Regression Analysis Guide](./APZHUB-APZ-TCMS-Regression-Analysis-Guide.md)
