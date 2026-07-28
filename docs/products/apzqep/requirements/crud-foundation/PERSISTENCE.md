# Persistence — Requirements CRUD Foundation

> **Programme:** APZQEP-ENG-020B

## Tables

| Table | Purpose |
| ----- | ------- |
| `qep_requirement` | Requirements SoR (tenant-scoped) |
| `qep_requirement_audit` | Append-only mutation audit |

## Fields (requirement)

Identity: `id`, `tenant_id`, `project_id`, `key`  
Content: `title`, `description`, `type`, `status`, `priority`, `category`  
JSON: `owner_json`, `acceptance_criteria_json`, `attributes_json`, `references_json`, `baseline_json`  
Semantic version: `version_major`, `version_minor`, `version_patch`  
Audit: `created_at`, `updated_at`, `created_by`, `updated_by`  
Soft delete: `archived_at`, `archived_by`  
Optimistic concurrency: `revision`

## Migrations

- `packages/config/drizzle/0068_apz_qep_requirements.sql`
- `packages/config/drizzle/0069_apz_qep_requirements_rls.sql` (tenant RLS)

## Adapters

- Postgres: `packages/qep-requirements/src/infrastructure/postgres/`
- In-memory (tests): `packages/qep-requirements/src/infrastructure/in-memory/`
- Factories forbid silent in-memory fallback in production

## Stubs

`RequirementVersionRepository` and `RequirementRelationshipRepository` remain non-functional stubs (no historical version storage / relationship graph).
