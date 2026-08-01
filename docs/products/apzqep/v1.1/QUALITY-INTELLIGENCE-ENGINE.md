# Quality Intelligence Engine — APZQEP v1.1

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| Service          | QualityIntelligenceService                      |
| Package (target) | `@apzhub/qep-quality-intelligence`              |
| Classification   | Platform Service — **derived metrics only**     |
| SoR rule         | Never authoritative business SoR (Document 011) |

---

## 1. Purpose

Continuously compute and expose quality metrics that power dashboards, release readiness, and AI explanations.

QI **reads** domain events and query snapshots; it **does not** own requirements, tests, defects, or evidence.

---

## 2. Metric catalogue

| Metric ID  | Name                  | Description                                             | Primary inputs                                     | Refresh                       |
| ---------- | --------------------- | ------------------------------------------------------- | -------------------------------------------------- | ----------------------------- |
| QI-QS      | Quality Score         | Composite 0–100 for project/release scope               | Coverage, defect health, stability, evidence       | Near-real-time + daily rollup |
| QI-RC      | Release Confidence    | Confidence to ship scoped release                       | Open P0/P1, failed runs, evidence gaps, cert state | On change                     |
| QI-REQCOV  | Requirement Coverage  | % requirements with approved linked specs/verifications | Trace + Specs + Verification                       | Hourly / on event             |
| QI-TESTCOV | Test Coverage         | % specs exercised in selected runs                      | Suites/Runs/Executions                             | On run complete               |
| QI-REGSTAB | Regression Stability  | Pass-rate trend / flake indicator                       | Execution history                                  | Daily                         |
| QI-AUTMAT  | Automation Maturity   | Share of automated vs manual executions                 | Execution source/ingest flags                      | Daily                         |
| QI-EVCOMP  | Evidence Completeness | Required evidence present for failed/critical tests     | Evidence links + policy                            | On change                     |
| QI-RISK    | Risk Index            | Weighted open risk                                      | Defects severity, coverage gaps, LA flags          | On change                     |
| QI-DEFHLTH | Defect Health         | Open age, reopen rate, escape indicators                | Defects                                            | Hourly                        |
| QI-DELCONF | Delivery Confidence   | Schedule-aware confidence                               | Runs progress + QI-RC                              | On change                     |

Exact formulas are specified in engineering programmes; architecture mandates **versioned formula IDs** so AI and UI can cite `formulaVersion`.

---

## 3. Architecture

```text
Domain Services ──events──► Event Bus ──► QI Ingest Workers
Snapshot queries (read models) ─────────► QI Calculator
                                              │
                                              ▼
                                     QI Metric Store
                                     (time series + current)
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                     ▼                     ▼
                   QI API               Dashboards (140)      AI Release Advisor
```

### Components

| Component    | Role                                                           |
| ------------ | -------------------------------------------------------------- |
| Ingest       | Idempotent consumers; correlation IDs                          |
| Calculator   | Pure functions; formula registry                               |
| Metric Store | PostgreSQL (platform) for current + rollups; optional TS later |
| API          | Read APIs; admin recalculation                                 |
| Explainer    | Structured factors for AI/UI (not free text SoR)               |

---

## 4. APIs

| Method | Path                                       | Purpose                 |
| ------ | ------------------------------------------ | ----------------------- |
| GET    | `/api/v1/qep/qi/scores`                    | Current scores by scope |
| GET    | `/api/v1/qep/qi/scores/{metricId}/history` | Time series             |
| GET    | `/api/v1/qep/qi/explain/{metricId}`        | Factor breakdown        |
| POST   | `/api/v1/qep/qi/recalculate`               | Admin scoped recompute  |

Permissions: `qep.qi.read` · `qep.qi.admin`.

Response envelope includes `formulaVersion`, `asOf`, `scope`, `factors[]`.

---

## 5. Scope model

Scores are computed for scopes:

- `projectId`
- `planId` / `runId`
- `releaseLabel` (logical product release, not git tag)
- `workspace` aggregate (careful permission fold)

---

## 6. Delivery phasing

| Phase       | Programme | Deliverable                                                                    |
| ----------- | --------- | ------------------------------------------------------------------------------ |
| Skeleton    | **120**   | Metric store schema, API stubs, QS/RC/EVCOMP/RISK MVP from available v1.0 data |
| Core inputs | **130**   | Incorporate Suites/Runs/Defects into formulas                                  |
| Experience  | **140**   | Dashboard binding                                                              |
| Depth       | **160**   | Full catalogue, history UX, portfolio rollups                                  |

---

## 7. Non-goals

- Replacing certification Owner decisions
- Storing duplicate requirement/test bodies
- Cross-tenant aggregation without explicit portfolio programme
