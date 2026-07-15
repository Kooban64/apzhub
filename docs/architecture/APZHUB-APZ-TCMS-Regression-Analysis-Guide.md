# APZ TCMS — Regression Analysis Guide

**Milestone:** APZTCMS-008  
**Service:** `RegressionAnalysisService`

---

## Scope

Compare a **baseline** result set to a **current** result set (by case key):

| Signal             | Meaning                                  |
| ------------------ | ---------------------------------------- |
| `newFailures`      | Fail now; not failing in baseline        |
| `resolvedFailures` | Fail in baseline; pass now               |
| `reopenedFailures` | Pass (or resolved) in baseline; fail now |
| `coverageDelta`    | Numeric coverage change                  |
| `executionDelta`   | Execution count / completion change      |

**No prediction.** Trends are metadata only (`QualityTrendService` compares snapshots).

Persisted optionally in `testing_regression_analysis` for reproducibility.

---

## Note

Existing `RegressionService` (suite registry from APZTCMS-004) remains separate — suite management ≠ failure analysis.
