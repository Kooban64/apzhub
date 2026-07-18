# APZHUB Administration Domain Model

**Milestone:** APZADMIN-001

## Entities (metadata SoR)

| Entity                     | Purpose                                            |
| -------------------------- | -------------------------------------------------- |
| AdministrationModule       | Registered admin module aggregate                  |
| AdministrationCategory     | Navigation/category grouping                       |
| AdministrationSection      | Section within a category                          |
| AdministrationAction       | Declared admin action metadata                     |
| AdministrationPermission   | Permission catalogue entry                         |
| AdministrationAuditEntry   | Immutable audit trail                              |
| AdministrationHistory      | Module history summaries                           |
| AdministrationDiagnostic   | Stored diagnostic metadata                         |
| AdministrationRegistration | Module registration records                        |
| AdministrationMetadata     | Labels/tags/notes                                  |
| AdministrationPolicy       | Access/audit/retention/operational policy metadata |
| AdministrationReference    | Cross-resource references                          |
| AdministrationCapability   | Capability status flags                            |
| AdministrationNavigation   | Nav tree metadata                                  |
| AdministrationShortcut     | Shortcut metadata                                  |
| AdministrationDashboard    | Dashboard layout metadata (not rendered)           |
| AdministrationWidget       | Widget layout metadata (not rendered)              |

## Capability flags

`enabled`, `available`, `healthy`, `certified`, `productionReady` (+ optional `limitations`, `owner`, `version`, `documentation`).

## Lifecycle

`draft` → `registered` → `active` → `deprecated` → `archived` (fail-closed transitions in `@apzhub/admin-core`).
