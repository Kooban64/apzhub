# API — Workspace & Operations Experience

Surface: `orchestration.workspaceExperience` (DI: `orchestration.workspace_experience.engine`).

| Operation                           | Purpose                                 |
| ----------------------------------- | --------------------------------------- |
| Create Workspace Experience Package | Compose immutable package (refs only)   |
| Read Workspace Experience Package   | Fetch by id / latest                    |
| Read Workspace Layouts              | Layout composition                      |
| Read Navigation Model               | Navigation preferences                  |
| Read Workspace Context              | Operational / role / session context    |
| Read Workspace History              | Audit trail                             |
| Diagnostics                         | Workspace/nav/layout/context statistics |

No business APIs. Events via Event Backbone: `workspace.experience.created`,
`workspace.package.completed`, `workspace.layout.updated`,
`workspace.navigation.composed`.
