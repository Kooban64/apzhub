# Permissions — APZQEP-ENG-030C

Catalogue from ENG-030A Part 2 / `@apzhub/qep-contracts` — mirrored in `modules/qep-traceability/module.yaml` and presentation labels.

| Permission                                  | Workbench use                            |
| ------------------------------------------- | ---------------------------------------- |
| `qep.traceability.trace_links.view`         | Explorer, Matrix, Detail read            |
| `qep.traceability.trace_links.create`       | Create route / submit                    |
| `qep.traceability.trace_links.modify`       | Field updates when in `availableActions` |
| `qep.traceability.trace_links.validate`     | Validate action                          |
| `qep.traceability.trace_links.approve`      | Approve action                           |
| `qep.traceability.trace_links.retire`       | Retire action                            |
| `qep.traceability.trace_links.supersede`    | Supersede workflow                       |
| `qep.traceability.trace_links.history.view` | History view                             |
| `qep.traceability.taxonomy.view`            | Taxonomy browser                         |
| `qep.traceability.taxonomy.administer`      | Backend only (no admin UI here)          |

Nav visibility is permission-driven; **server** remains authoritative for mutations via `availableActions` + API authz.
