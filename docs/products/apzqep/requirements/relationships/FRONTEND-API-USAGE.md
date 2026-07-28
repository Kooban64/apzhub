# Frontend API Usage — ENG-020F Part 3

Client helpers live in `apps/web/lib/qep/qep-api.ts` under relationship operations.

| Operation                     | Client                                                      | Backend                                 |
| ----------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| List                          | `listRelationships`                                         | `GET …/relationships`                   |
| By requirement                | `listRelationshipsByRequirement`                            | `GET …/requirements/{id}/relationships` |
| Detail                        | `getRelationship`                                           | `GET …/relationships/{id}`              |
| Taxonomy                      | `listRelationshipTaxonomy`                                  | `GET …/relationships/taxonomy`          |
| Create                        | `createRelationship`                                        | `POST …/relationships`                  |
| Supersede                     | `supersedeRelationship`                                     | accepted supersede command              |
| Activate / Deprecate / Retire | matching clients                                            | lifecycle commands                      |
| Field updates                 | rationale / strength / criticality / classification / scope | mutate commands                         |

## Contracts

- Query keys: `apps/web/lib/qep/query-keys.ts` → `qepQueryKeys.relationships.*`
- Actions: only enable UI controls present in DTO `availableActions`
- After mutation: invalidate `relationships.detail` and `relationships.all`
- Search/list rows are projections; detail always reloads System of Record

## Telemetry

`emitQepWorkbenchTelemetry` events: `relationships.list.load`, `.detail.load`, `.create`, `.activate`, `.deprecate`, `.retire`, `.update`, `.supersede`.
