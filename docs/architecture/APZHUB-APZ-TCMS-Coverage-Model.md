# APZ TCMS — Coverage Model

**Milestone:** APZTCMS-008

---

## Kinds

| Kind                                  | Meaning                                 |
| ------------------------------------- | --------------------------------------- |
| `requirement` / `feature` / `story`   | Work-item / requirement coverage        |
| `plan` / `suite` / `case`             | Test structure coverage                 |
| `manual` / `automation` / `execution` | Execution-source coverage               |
| `risk` / `release`                    | Risk / release scoped coverage          |
| `code_ref`                            | Soft code-reference coverage (metadata) |

---

## Record

Persisted on `testing_coverage_record`: `kind`, `subjectId`, `coveredCount`, `totalCount`, `percentage`, `computedAt`, optional plan/suite/requirement/risk ids.

**Formula:** `percentage = total === 0 ? 0 : (covered / total) * 100` — deterministic.

---

## Engine

`CoverageService.recompute(scope)` walks requirements, cases, executions, risks, and traceability links to produce stable counts. Never invents automation code-coverage from source maps — automation coverage uses ingested snapshots when present.

See also [Coverage Ingestion Guide](./APZHUB-APZ-TCMS-Coverage-Ingestion-Guide.md) (APZTCMS-007).
