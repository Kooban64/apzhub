# QUALITY-SCORING — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Purpose

Provide a governed, explainable **Quality Score** that summarises product/project quality health for engineers and executives without becoming a vanity metric.

## Score model (conceptual)

```text
QualityScore ∈ [0, 100]
  = f(
      evidenceCompleteness,
      automationHealth,
      defectPressure,
      requirementCoverage,
      scmChangeRisk,
      operationalHealth,
      policyCaps
    )
```

## Component scores (illustrative)

| Component             | Typical inputs                              |
| --------------------- | ------------------------------------------- |
| Evidence Completeness | Required artefacts present / linked         |
| Automation Health     | Pass rate, flaky rate, provider health      |
| Defect Pressure       | Open severity/priority weighted load        |
| Requirement Coverage  | Linked verification / uncovered high-risk   |
| SCM Change Risk       | Hotspots, large PRs, churn                  |
| Operational Health    | Integration failures, webhook failure rates |

## Caps and overrides

- Critical open blocker defects → score capped / readiness forced `not_ready`.
- Missing mandatory evidence for a claimed release → score/readiness degraded.
- Rules engine outranks AI narrative for caps.

## Outputs

| Output              | Consumer                        |
| ------------------- | ------------------------------- |
| Composite score     | Workspace, reporting, executive |
| Component breakdown | Engineering drill-down          |
| Trend series        | Historical analytics            |
| Explanation         | Mandatory                       |

## Non-goals

Scoring does not replace certification. It informs Product Board and release decisions.
