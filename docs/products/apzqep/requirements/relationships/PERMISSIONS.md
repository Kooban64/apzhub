# Relationship Permissions — Workbench

| Permission | Workbench effect |
| --- | --- |
| `qep.requirements.relationships.view` | List, detail, taxonomy, requirement panel |
| `qep.requirements.relationships.create` | Create / supersede forms |
| `qep.requirements.relationships.modify` | Edit rationale/profile fields when `availableActions` allows |
| `qep.requirements.relationships.transition` | Activate / deprecate when allowed |
| `qep.requirements.relationships.retire` | Retire when allowed |
| `qep.requirements.relationships.taxonomy.administer` | Taxonomy administration (API); Workbench currently read-lists taxonomy |

UI buttons are gated by **server `availableActions`**, not by decoding role names in the client.
