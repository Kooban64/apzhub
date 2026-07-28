# Requirements Relationship Persistence

| Field      | Value                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Programme  | APZQEP-ENG-020F Part 2                                                                         |
| Migrations | `0077_apz_qep_requirements_relationship.sql`, `0078_apz_qep_requirements_relationship_rls.sql` |
| Schema     | `packages/config/src/db/qep-requirements-schema.ts`                                            |

## Tables

### `qep_requirements_relationship`

Authoritative relationship rows. Includes endpoint modes/pins, semantic profile columns (strength, criticality, classification, scope, rationale), lifecycle timestamps, `duplicate_key`, and `revision` for optimistic concurrency.

Constraints preserve Part 1 semantics: no self-reference, pin consistency, scope reference rules, lifecycle enum, partial unique index on `(tenant_id, duplicate_key)` for `active`/`deprecated`.

### `qep_requirements_relationship_history`

Append-only history (`sequence` unique per relationship). Never rewritten or deleted by ordinary product flows.

### `qep_requirements_relationship_taxonomy`

Tenant-seeded normative taxonomy definitions (behaviour matrix). Seeded idempotently from Part 1 `NORMATIVE_RELATIONSHIP_TAXONOMY`.

## Tenant isolation

RLS policies use `app.tenant_id` (migration 0078).

## Repositories

| Port                                 | Implementations      |
| ------------------------------------ | -------------------- |
| `RequirementsRelationshipRepository` | Postgres + in-memory |
| `RelationshipTaxonomyRepository`     | Postgres + in-memory |

Repositories persist aggregates produced by domain mutations; they do not replace domain validation.
