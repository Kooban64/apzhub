# Product Rule — Reporting is a Projection

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Status     | **IN FORCE**                            |
| Authority  | Product Board (APZQEP-140-F AUTHORISED) |
| Applies to | APZQEP-140-F onward                     |

```text
Reporting is a read model.
Analytics are derived.
Dashboards SHALL consume projections and calculated metrics.
Reporting SHALL NEVER become the authoritative source for business data.
```

| Concern          | Role                                                       |
| ---------------- | ---------------------------------------------------------- |
| Caps A–E domains | Authoritative business SoRs                                |
| QKI              | Event-driven projections for search/reporting              |
| Cap F Reporting  | Derived dashboards, metrics, trends, saved report metadata |

Reporting presents facts owned by Requirements, Suites, Plans, Execution, Evidence, Defects and Traceability. It does not rewrite them.
