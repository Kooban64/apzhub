# QUALITY-DATA-MODEL — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Ownership

Quality Intelligence owns **intelligence artefacts** (signals, scores, recommendations, explanations).

Upstream platforms remain Systems of Record for their domains (requirements, evidence, defects, SCM, automation executions). QI stores **references**, derived scores and advice — not duplicated engine business data as SoR.

## Core entities (conceptual)

| Entity           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `Signal`         | Normalised observation from an upstream source |
| `Observation`    | Grouped/contextualised set of signals          |
| `QualityScore`   | Scored outcome with component breakdown        |
| `RiskAssessment` | Risk record with factors and severity          |
| `Prediction`     | Forward-looking estimate with horizon          |
| `Recommendation` | Actionable advice with accept/reject lifecycle |
| `Explanation`    | Explainability record bound to an outcome      |
| `Confidence`     | Normalised confidence + caps/overrides         |
| `ProviderRun`    | One provider evaluation attempt (audit)        |
| `HumanDecision`  | Accept / reject / override / escalate          |

## Link types (references only)

| Link              | Targets                                        |
| ----------------- | ---------------------------------------------- |
| Evidence links    | Evidence packs / artefacts                     |
| Requirement links | Requirements / risks                           |
| Execution links   | Plans, sessions, automation executions         |
| Defect links      | Defects / clusters                             |
| Repository links  | Repositories, commits, PRs, branches           |
| Reporting links   | Report instances / dashboards (projection ids) |
| Audit references  | Immutable audit / correlation ids              |

## Standard fields (all intelligence artefacts)

```text
id · tenantId · projectId? · correlationId
occurredAt · createdBy (system|user|provider)
providerId? · providerKind? · providerVersion?
domain · outcomeKind
confidence · explanationId?
status (draft|published|accepted|rejected|superseded)
```

## Event families (proposed)

Past-tense `platform.quality_intelligence.*` events, e.g.:

- `recommendation.produced`
- `recommendation.accepted`
- `recommendation.rejected`
- `score.updated`
- `risk.assessed`
- `prediction.produced`
- `provider.evaluation.failed`
- `human.override.recorded`

## Durability note

Wave 3 engineering must decide persistence SoR for intelligence artefacts (platform PostgreSQL). Architecture requires durability for recommendations and explanations used in certification — unlike process-local Wave 1/2 demo stores.
