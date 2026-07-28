# Permissions

| Permission                                  | Use                                               |
| ------------------------------------------- | ------------------------------------------------- |
| `qep.traceability.trace_links.view`         | Read Trace Links / lists                          |
| `qep.traceability.trace_links.create`       | Create                                            |
| `qep.traceability.trace_links.modify`       | Field updates                                     |
| `qep.traceability.trace_links.validate`     | draft → validated                                 |
| `qep.traceability.trace_links.approve`      | validated → approved                              |
| `qep.traceability.trace_links.retire`       | approve → retired                                 |
| `qep.traceability.trace_links.supersede`    | approve → superseded                              |
| `qep.traceability.trace_links.history.view` | History (also covered by view where gateway maps) |
| `qep.traceability.taxonomy.view`            | Taxonomy list                                     |
| `qep.traceability.taxonomy.administer`      | Taxonomy administration                           |

Distinct from Requirements Relationship permissions. Registered in contracts, module.yaml, Platform permission catalogue, and operation-authorization-map.
