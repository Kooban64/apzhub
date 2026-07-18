# APZOBSERVE-005 — Performance Baseline

## Practical checks (metadata plane)

| Operation   | Expectation                              | Result                       |
| ----------- | ---------------------------------------- | ---------------------------- |
| Facet list  | Paginated / limited queries              | PASS — client uses limit     |
| Detail get  | Single-id fetch                          | PASS                         |
| Mutations   | Invalidate facet query keys only         | PASS — no aggressive polling |
| Overview    | Parallel list queries, no streaming      | PASS                         |
| Diagnostics | Finite readiness/capability calls        | PASS                         |
| Indexes     | Migration 0054 supports common access    | PASS (schema-level)          |
| N+1         | No nested per-row HTTP in Workbench list | PASS                         |

## Limitations

No live telemetry performance claims. No streaming. Workbench does not poll for live monitoring.
