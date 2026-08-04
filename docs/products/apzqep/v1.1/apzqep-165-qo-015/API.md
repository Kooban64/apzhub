# API — Executive Experience Integration

Surface: `orchestration.executiveExperience` (DI: `orchestration.executive_experience.engine`).

| Operation                           | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| Create Executive Experience Package | Bind refs + persona → projection package |
| Read Executive Experience Package   | Fetch by id                              |
| Read Executive Personas             | List / get immutable personas            |
| Read Projection Model               | Projection for a package                 |
| Read Experience History             | Audit trail                              |
| Diagnostics                         | Counts, persona stats, health, readiness |

No dashboard rendering endpoints. No report generation. No decision/governance APIs.
