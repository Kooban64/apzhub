# API — Enterprise Operational Platform

Surface: `orchestration.operational` (DI: `orchestration.operational.engine`).

| Operation                            | Purpose                                  |
| ------------------------------------ | ---------------------------------------- |
| Create Operational Readiness Package | Descriptive snapshot (immutable package) |
| Read Operational Readiness Package   | Fetch by id / latest                     |
| Read Health                          | Health contract                          |
| Read Readiness                       | Readiness contract                       |
| Read Liveness                        | Liveness contract                        |
| Read Diagnostics                     | Diagnostics snapshot                     |
| Read Version Metadata                | Version / slice identity                 |
| Read Operational Metadata            | Deployment/config/capability refs        |

No deployment APIs. No infrastructure APIs. No configuration mutation APIs.

Events (via Event Backbone): `operational.readiness.created`, `health.contract.updated`,
`readiness.contract.published`, `operational.package.completed`.
