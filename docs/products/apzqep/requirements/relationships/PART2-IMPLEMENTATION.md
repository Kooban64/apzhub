# APZQEP-ENG-020F Part 2 — Implementation Summary

| Field        | Value                                                            |
| ------------ | ---------------------------------------------------------------- |
| Programme    | APZQEP-ENG-020F Part 2                                           |
| Title        | Persistence, Application Services, APIs and Platform Integration |
| Architecture | APZQEP-ARCH-005 + ENG-020F Part 1 domain                         |
| Package      | `@apzhub/qep-requirements` **0.9.0**                             |
| Status       | **IMPLEMENTED** — awaiting Owner Acceptance                      |

## Delivered

| Layer         | Delivery                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Persistence   | Tables `qep_requirements_relationship`, `_history`, `_taxonomy`; migrations **0077** / **0078** (RLS)                                       |
| Repositories  | `RequirementsRelationshipRepository`, `RelationshipTaxonomyRepository` — PostgreSQL + in-memory                                             |
| Commands      | create, activate, deprecate, retire, supersede, update rationale/profile/strength/classification/criticality/scope                          |
| Queries       | get, list, by requirement (inbound/outbound), taxonomy, lifecycle, baseline, content version, conflicts, supersession chains, taxonomy list |
| APIs          | REST under `/api/v1/qep/requirements/relationships/*`                                                                                       |
| Permissions   | `qep.requirements.relationships.{view,create,modify,transition,retire,taxonomy.administer}`                                                 |
| Audit         | Platform audit append on create/update/lifecycle (`qep.requirements_relationship.*`)                                                        |
| Search        | `requirement_relationship` projection via `onRelationshipUpserted`                                                                          |
| Observability | `onObservation` timing/outcome hooks on commands and queries                                                                                |

## Non-delivery (Part 3 / later)

Workbench UI, Relationship Editor, Graph visualisation, Relationship Explorer, Traceability, Coverage, Verification, AI, MCP.
