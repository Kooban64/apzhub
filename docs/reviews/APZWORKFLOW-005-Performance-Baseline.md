# APZWORKFLOW-005 — Performance Baseline

**Method:** Measurement only (mocked/controlled data). No optimisation performed.

## Approach

| Surface          | Method                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| HTTP handlers    | Vitest + handler unit timing observations (list/detail/versions/validation/audit) under mock gateway |
| Typed client     | Mock HTTP / mock client request path in Vitest                                                       |
| Workbench render | React Testing Library mount of Overview / library / Definition Viewer / Graph / Version Compare      |

## Baseline notes (2026-07-15)

| Observation                              | Finding                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Overview + library mount (mocked client) | Sub-second in Vitest jsdom (machine-dependent)                                        |
| Definition Viewer / Graph                | Synchronous pure render — no network                                                  |
| Version compare                          | Pure diff function — O(nodes+params)                                                  |
| Bundle                                   | Workbench code-split with Next App Router route segment; no separate execution bundle |

## Limitations

- Not a load test; not production RUM
- No live PostgreSQL latency included in unit CI
- Playwright live timing **LIMITED** by Testing slug conflict

No blocking performance defect identified.
