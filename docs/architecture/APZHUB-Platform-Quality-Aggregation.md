# APZHUB Platform Quality Aggregation

**Milestone:** APZTCMS-014

## Rule

**No new calculations.** Aggregation consumes `ProductQualityContribution` inputs (existing quality summaries, readiness assessments, cert IDs, open issues, coverage labels, risks).

## Outputs

`PlatformQualityAggregate`:

- overall quality status = worst contribution status
- readiness verdict = combined contribution readiness
- label lists for coverage / risk / defects / certification
- `isDecision: false`

## Multi-product certification

`MultiProductCertificationService` aggregates existing `CertificationRecord[]` by status classification.  
`isNewCertificationEngine: false` — does not evaluate gates.
