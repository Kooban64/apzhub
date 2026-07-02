# APZHUB platform data quick reference

Derived lookup for [011](./011-platform-data-architecture-database-design-principles.md). For full rules, lifecycle, and acceptance criteria, read the complete document.

## Core rule

**One System of Record per piece of information.** Duplicate only for performance, cache, search, reporting, temp processing, or future offline — duplicates are **never** authoritative.

## Who owns what

### APZHUB (PostgreSQL platform DB + platform stores)

Identity · auth · sessions · permissions · platform roles · navigation · workspace config · user preferences · notifications · audit logs · activity feed · module/connector registration · feature flags · search index · app settings · org config · platform metadata · connector config · system health · telemetry · platform cache · background jobs · platform events

### Backend engines (engine DBs — authoritative for domain)

Projects · tasks · documents · tickets · timesheets · automations · dashboards · reports · test cases · security findings · monitoring data · source code · assets · KB articles · future specialist business data

## Platform database

- **PostgreSQL only** for platform metadata ([004](./004-technology-stack-repository-standards-development-environment.md))
- Independent from backend product databases
- **Never** store duplicated backend business data
- Operational brain; engines remain specialists; connector swap ≠ platform schema redesign

## Data categories (each needs lifecycle rules)

Platform · configuration · reference · operational · audit · security · telemetry · search metadata · background jobs · temporary · cached

## Entity standard fields

UUID (or global unique id) · created_at · updated_at · created_by · updated_by · status · version · soft_delete (where applicable) · audit_reference · organisation_id (future)

Prefer immutability where practical.

## Naming

**Tables:** singular nouns — `User`, `Permission`, `Notification`, `Workspace`, `Connector`, `Module` — consistent columns, no abbreviations, no vendor names on platform tables.

## Relationships

Explicit · documented — 1:1, 1:N, N:N, hierarchy, self-reference — no hidden dependencies.

## Identifiers

Platform entities: global unique IDs in APIs/UI. Backend IDs: connector-internal only; expose to users only for support/diagnostics when necessary.

## Derived / non-authoritative stores

| Store                                                                                           | Rule                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Redis cache** ([004](./004-technology-stack-repository-standards-development-environment.md)) | Expire, refresh, invalidate, recover, degrade — never SoR                                                                                                                 |
| **Search index**                                                                                | Derived; auto-rebuild; never replaces SoR ([009](./009-platform-service-layer-integration-framework.md), [010](./010-api-gateway-integration-communication-standards.md)) |

## Audit

Immutable · every significant action · configurable retention · never modify history ([007](./007-identity-authentication-authorisation-rbac-architecture.md))

## Activity feed & notifications

Platform-owned entities; may **reference** backend records, not duplicate business payloads; notification history in APZHUB; generation via Platform Services ([009](./009-platform-service-layer-integration-framework.md))

## Connector metadata (platform DB)

Config · credential **references** (not secrets) · health · capabilities · version · provisioning status · supported features — **no business data** in connector-local stores

## Synchronisation

Prefer metadata exchange; fetch business data from engine on demand; avoid replication; provisioning status on platform, accounts on engine ([007](./007-identity-authentication-authorisation-rbac-architecture.md))

## Lifecycle (per entity)

Creation · update · archival · retention · deletion · recovery · compliance — document rules; identity lifecycle per IAM

## Concurrency

Optimistic versioning where appropriate; detect conflicts, do not silently overwrite

## Integrity

FKs · unique · check constraints · referential integrity · validation — DB + domain + API ([010](./010-api-gateway-integration-communication-standards.md))

## Security

Encrypt sensitive data; **never plain-text** secrets/tokens/API keys/sessions/PII; secrets manager + env ([004](./004-technology-stack-repository-standards-development-environment.md))

## Backup & recovery

Automated backups · PITR · restore testing · retention · DR — platform DB only; engine backups separate per engine

## Multi-tenancy (future-ready schema)

Tenant isolation · shared infra · tenant config/permissions/metadata — no major redesign later ([007](./007-identity-authentication-authorisation-rbac-architecture.md))

## Entity documentation (mandatory)

Purpose · owner · relationships · constraints · lifecycle · permissions · search behaviour · audit behaviour

## Acceptance (summary)

Clear SoR everywhere · platform vs business separation · engines authoritative for domains · audit/security/lifecycle on platform entities · cache/search non-authoritative · connector replacement without DB redesign · tenant-ready schema
