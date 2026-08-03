# QUALITY-INTELLIGENCE-DOMAIN-MODEL — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Intelligence domains

Each domain is a first-class capability of the Quality Intelligence Platform.

| Domain                    | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| Quality Scoring           | Aggregate quality health into governed scores       |
| Release Readiness         | Advise GO / NO-GO / CONDITIONAL with evidence       |
| Risk Assessment           | Identify quality, delivery and change risk          |
| Regression Recommendation | Propose impact-aware regression subsets             |
| Defect Clustering         | Group failures; assist root-cause hypotheses        |
| Execution Optimisation    | Recommend session/plan efficiency improvements      |
| Coverage Analysis         | Requirement / risk / automation coverage insights   |
| Requirement Risk          | Score requirement change and uncovered risk         |
| Automation Health         | Provider/execution reliability signals              |
| Repository Health         | SCM integration, PR/commit quality signals          |
| Evidence Completeness     | Gaps in evidence packs for claims and certification |
| Operational Health        | Platform ops signals affecting quality delivery     |
| Executive Quality Score   | Board-facing summary score with drill-down          |
| Certification Readiness   | Readiness of artefacts for Product Board review     |

## Domain contract (every domain)

| Element              | Definition                                                |
| -------------------- | --------------------------------------------------------- |
| Purpose              | Why the domain exists                                     |
| Inputs               | Signals / entities required                               |
| Outputs              | Scores, recommendations, predictions                      |
| Algorithms           | Conceptual only (rules, statistical, AI-assisted, hybrid) |
| Confidence model     | How confidence is computed and capped                     |
| Explainability model | Mandatory explanation fields                              |
| Human boundary       | What remains human-approved                               |
| Engineering roadmap  | Which APZQEP-163 slices deliver it                        |

## Domain sketch examples

### Quality Scoring

- **Inputs:** evidence completeness, defect severity mix, automation pass rates, SCM change risk, requirement coverage.
- **Outputs:** `QualityScore` (0–100) + component breakdown.
- **Algorithms:** weighted composite; optional AI narrative; rules override for critical defects.
- **Human boundary:** score is advisory unless policy elevates thresholds.

### Release Readiness

- **Inputs:** Quality Score, open blockers, evidence packs, automation results, SCM delta, certification residuals.
- **Outputs:** `ReleaseReadinessAdvice` ∈ {ready, conditional, not_ready} + conditions.
- **Human boundary:** Product Board / release authority remains final.

### Regression Recommendation

- **Inputs:** SCM commit/PR delta, impacted requirements, historical failure clusters, suite metadata.
- **Outputs:** recommended suite/plan subset + confidence.
- **Algorithms:** impact graph + historical stats; AI optional for rationale text.
- **Human boundary:** engineers accept/reject before execution.

## Cross-domain composition

Domains compose; they do not fork data. Shared Signal Fabric and Quality Data Model provide SoR references (never duplicated business data from engines).
