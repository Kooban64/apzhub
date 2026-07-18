# Platform Configuration Domain Model

**Milestone:** APZCONFIG-001

## Entities

| Entity                  | Role                                                 |
| ----------------------- | ---------------------------------------------------- |
| Configuration           | Aggregate — key binding, hierarchy, scope, lifecycle |
| ConfigurationNamespace  | Logical namespace                                    |
| ConfigurationGroup      | Grouping within a namespace                          |
| ConfigurationKey        | Key definition + value kind                          |
| ConfigurationValue      | Non-secret payload metadata                          |
| ConfigurationVersion    | Immutable version record                             |
| ConfigurationOverride   | Hierarchy override with precedence rank              |
| ConfigurationScope      | Scope binding (global…user)                          |
| ConfigurationValidation | Validator metadata (not executed)                    |
| ConfigurationAuditEntry | Audit trail                                          |
| ConfigurationHistory    | Change history summaries                             |
| ConfigurationReference  | Cross-product reference metadata                     |
| ConfigurationMetadata   | Labels/tags/notes                                    |

## Value kinds

`string` · `number` · `boolean` · `json` · `array` · `object` · `null`

Secrets / credentials / encrypted blobs are forbidden.
