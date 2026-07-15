# APZHUB Package Catalogue

> **Purpose:** Index of all monorepo packages and applications  
> **Audience:** Engineers, AI agents  
> **Authoritative references:** [004 — Technology Stack](../004-technology-stack-repository-standards-development-environment.md) · [Platform Package Review](../reviews/APZHUB-Platform-Package-Review.md)  
> **Related documents:** [REPOSITORY-GUIDE](./REPOSITORY-GUIDE.md) · [PLATFORM-CAPABILITY-CATALOGUE](./PLATFORM-CAPABILITY-CATALOGUE.md)  
> **Reading order:** With Repository Guide  
> **Last updated:** 2026-07-14  
> **Current status:** Active — APZSEARCH-013 complete — `@apzhub/search-testing` **0.1.0**; Projects/Support/Documents/Testing adapters; Search Platform **PRODUCTION_READY_WITH_LIMITATIONS**

---

## Applications

| Package | Path | Purpose |
|---------|------|---------|
| `@apzhub/web` | `apps/web/` | Primary Next.js application — platform shell |
| `@apzhub/law-platform` | `apps/law-platform/` | Law Platform product application |

---

## Platform Core packages

| Package | Path | Purpose |
|---------|------|---------|
| `@apzhub/platform-runtime` | `packages/platform-runtime/` | Manifest discovery, registry, bootstrap orchestration |
| `@apzhub/platform-bootstrap` | `packages/platform-bootstrap/` | Canonical capability initialisation |
| `@apzhub/platform-identity` | `packages/platform-identity/` | Tenants, membership, session resolution |
| `@apzhub/platform-authorization` | `packages/platform-authorization/` | RBAC — roles, permissions, assignments |
| `@apzhub/platform-operations` | `packages/platform-operations/` | Operations console, control plane, health aggregation |
| `@apzhub/platform-personalisation` | `packages/platform-personalisation/` | Preferences, favorites, recent, layout |
| `@apzhub/platform-governance` | `packages/platform-governance/` | Feature flags, provisioning, capability model |
| `@apzhub/platform-security` | `packages/platform-security/` | CSP, security headers, traffic governance |
| `@apzhub/platform-lifecycle` | `packages/platform-lifecycle/` | Platform lifecycle state machine |

---

## Framework packages

| Package | Path | Purpose |
|---------|------|---------|
| `@apzhub/workbench-framework` | `packages/workbench-framework/` | Workbench Manager, engines, API |
| `@apzhub/command-framework` | `packages/command-framework/` | Action Engine, command registry |
| `@apzhub/knowledge-discovery-framework` | `packages/knowledge-discovery-framework/` | Search providers, ranking, overlay |
| `@apzhub/event-notification-framework` | `packages/event-notification-framework/` | Event bus, notification routing |
| `@apzhub/activity-timeline-framework` | `packages/activity-timeline-framework/` | Activity registry, timeline experiences |

---

## Integration & SDK packages

| Package | Path | Version | Purpose |
|---------|------|---------|---------|
| `@apzhub/integration-sdk` | `packages/integration-sdk/` | 0.2.0 | OSS adapter framework — auth, connection, lifecycle |
| `@apzhub/sdk` | `packages/sdk/` | — | Platform SDK utilities |

**Integration SDK exports:** `/auth`, `/connection`, `/client`, `/adapter`, `/diagnostics`, `/lifecycle`, `/errors`

---

## UI & shell packages

| Package | Path | Purpose |
|---------|------|---------|
| `@apzhub/ui` | `packages/ui/` | Design system — shadcn/ui + Tailwind |
| `@apzhub/workspace` | `packages/workspace/` | Desktop shell composition |
| `@apzhub/theme` | `packages/theme/` | Theme tokens and registry |

---

## Infrastructure packages

| Package | Path | Purpose |
|---------|------|---------|
| `@apzhub/auth` | `packages/auth/` | BetterAuth configuration |
| `@apzhub/config` | `packages/config/` | Environment config, Drizzle ORM, migrations |
| `@apzhub/shared` | `packages/shared/` | Shared utilities |
| `@apzhub/types` | `packages/types/` | Core type definitions |

---

## Platform reporting packages

| Package | Path | Version | Purpose |
|---------|------|---------|---------|
| `@apzhub/reporting-contracts` | `packages/reporting-contracts/` | 0.1.0 | Platform reporting models + service contract (APZREPORT-001) |
| `@apzhub/reporting-core` | `packages/reporting-core/` | 0.1.0 | Template engine + output providers (APZREPORT-001) |
| `@apzhub/document-contracts` | `packages/document-contracts/` | 0.3.0 | Platform document + DocumentPlatformGateway contracts (APZDOCS-003) |
| `@apzhub/document-core` | `packages/document-core/` | 0.3.0 | Domain + coordinator + assignFolder/collection/retention (APZDOCS-003) |
| `@apzhub/document-persistence` | `packages/document-persistence/` | 0.2.0 | PostgreSQL + in-memory document repos (APZDOCS-002) |
| `@apzhub/document-storage` | `packages/document-storage/` | 0.1.0 | Filesystem + S3-compatible + memory providers (APZDOCS-002) |
| `@apzhub/search-contracts` | `packages/search-contracts/` | 0.4.0 | Platform Search contracts + management + execution (APZSEARCH-006/008) |
| `@apzhub/search-persistence` | `packages/search-persistence/` | 0.2.0 | Search metadata persistence + full management thin services (APZSEARCH-003) |
| `@apzhub/search-integration` | `packages/search-integration/` | 0.1.0 | Cross-Product Search Integration Framework (APZSEARCH-009) |
| `@apzhub/search-projects` | `packages/search-projects/` | 0.1.0 | Projects Search Publication Adapter (APZSEARCH-010) |
| `@apzhub/search-support` | `packages/search-support/` | 0.1.0 | Support Search Publication Adapter (APZSEARCH-011) |
| `@apzhub/search-documents` | `packages/search-documents/` | 0.1.0 | Documents Search Publication Adapter (APZSEARCH-012) |
| `@apzhub/search-testing` | `packages/search-testing/` | 0.1.0 | APZ TCMS Search Publication Adapter (APZSEARCH-013) |
| `@apzhub/integration-search-sdk` | `packages/integration-search-sdk/` | 0.1.0 | Search Integration SDK — vendor-neutral adapter foundation (APZSEARCH-004) |
| `@apzhub/integration-meilisearch` | `integrations/meilisearch/` | 0.1.0 | Meilisearch Reference Search Adapter (APZSEARCH-005) |
| `@apzhub/platform-services` | `packages/platform-services/` | 0.18.0 | Gateway + document + Search management/execution (APZSEARCH-006/008) |

## Product packages

| Package | Path | Version | Purpose |
|---------|------|---------|---------|
| `@apzhub/legal-business-core` | `packages/legal-business-core/` | — | Law Platform domain logic |
| `@apzhub/testing-contracts` | `packages/testing-contracts/` | 0.11.0 | APZ TCMS domain contracts |
| `@apzhub/testing-foundation` | `packages/testing-foundation/` | 0.1.0 | APZ TCMS registries + validation (APZTCMS-002) |
| `@apzhub/testing-persistence` | `packages/testing-persistence/` | 0.11.0 | APZ TCMS repositories + authz |
| `@apzhub/testing-services` | `packages/testing-services/` | 0.11.0 | APZ TCMS domain services (reporting consumer) |

---

## Manifest directories (not npm packages)

| Directory | Purpose |
|-----------|---------|
| `services/` | Platform service manifests (`service.yaml`) |
| `integrations/` | Integration adapter manifests (`integration.yaml`) |
| `modules/` | Business module manifests (`module.yaml`) |
| `events/` | Platform event manifests (`event.yaml`) |

---

## Dependency rules

- Products depend on Platform packages — not vice versa
- No circular dependencies (verified PRH-011)
- Modules never depend on other modules
- Connectors never imported outside adapter boundary

See [Platform Dependency Review](../reviews/APZHUB-Platform-Dependency-Review.md).

---

## Package version notes

| Package | Notes |
|---------|-------|
| Root `apzhub` | `0.1.0-foundation` |
| `@apzhub/integration-sdk` | `0.9.0` (`PRODUCTION_READY_WITH_LIMITATIONS`) |
| `@apzhub/integration-search-sdk` | `0.1.0` (APZSEARCH-004) |
| `@apzhub/integration-meilisearch` | `0.1.0` (APZSEARCH-005) |
| `@apzhub/testing-contracts` | `0.1.0` (APZTCMS-002) |
| `@apzhub/testing-foundation` | `0.1.0` (APZTCMS-002) |
| `@apzhub/testing-persistence` | `0.1.0` (APZTCMS-003) |
| Other packages | Private monorepo; no independent publish yet |
