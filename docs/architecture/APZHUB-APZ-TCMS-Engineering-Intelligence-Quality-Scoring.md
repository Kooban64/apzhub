# Engineering Intelligence — Quality Scoring

**Milestone:** APZTCMS-021

## Model

Deterministic weighted score 0–100. **No ML / AI.**

### Default weights (sum = 1)

| Input            | Weight | Inverted |
| ---------------- | ------ | -------- |
| coverage         | 0.15   | no       |
| automation       | 0.10   | no       |
| manualExecution  | 0.10   | no       |
| failedTests      | 0.15   | yes      |
| openDefects      | 0.15   | yes      |
| certification    | 0.15   | no       |
| approvals        | 0.10   | no       |
| releaseReadiness | 0.10   | no       |

Inverted inputs use `100 − value` before weighting. Weights are normalised if they do not sum to 1.

## Outputs

`QualityScore` with component contributions, persisted via engineering snapshots / quality summaries.
