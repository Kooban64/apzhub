# API — Evidence & Reporting Integration

Surface: `orchestration.evidenceIntegration` (DI: `orchestration.evidence_integration.engine`).

| Operation                           | Purpose                                   |
| ----------------------------------- | ----------------------------------------- |
| Create Evidence Integration Package | Bind opaque refs into immutable package   |
| Read Evidence Integration Package   | Fetch by id                               |
| Generate Report View                | Declarative inclusion view (not evidence) |
| Read Report Profiles                | List / get immutable profiles             |
| Query Traceability                  | Immutable traceability record             |
| Read Reporting History              | Audit / assembly history                  |
| Diagnostics                         | Counts, integrity, health, readiness      |

No evidence mutation endpoints. No decision / governance / analytics / dashboard APIs.
