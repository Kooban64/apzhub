# OSS-110-10 Completion Report — Support Platform Services, Providers & Mapping

**Status:** Complete  
**Date:** 2026-07-11  
**Scope:** OSS-110-10 only — no HTTP routes, UI, Event Bus, webhook ingress, or notifications

---

## Executive summary

Delivered the Support domain into the APZHUB Platform Service layer, mirroring the Projects/Plane pattern. Certified Zammad (`@apzhub/integration-zammad` v0.6.0) is registered as the sole Support capability provider. Mapping-aware service implementations expose APZHUB global IDs only (`sreq_*`, `sorg_*`, `sgrp_*`, `suser_*`, `sart_*`). Gateway accessors run through `RequestPipeline` with production authorisation (`support.requests.*`, etc.).

**Packages:** `@apzhub/platform-service-contracts` **0.7.0** · `@apzhub/platform-services` **0.7.0**

**Stop condition met.** Recommended next: **OSS-110-11 — Support HTTP API Surface** (owner approval required).

---

## Support Platform architecture

```text
gateway.support*
  → RequestPipeline (policies + ProductionAuthorizationProvider + metrics/logging)
    → Support*ServiceImpl
    → MappingOrchestrator + EntityMappingStore
    → ProviderResolver (support_* capabilities)
    → Zammad *Provider
    → adapter.core (ZammadCoreServices)
    → Zammad CE
```

**Invariant:** No Support HTTP, UI, Event Bus, or ingress in this milestone. Modules must not call Zammad providers or provisional `*_zammad_*` IDs.

---

## Provider registration

| Capability | Provider ID | Integration | Priority |
| --- | --- | --- | --- |
| `support_request` | `zammad-support` | `zammad` | 100 |
| `support_organization` | `zammad-organization` | `zammad` | 100 |
| `support_group` | `zammad-group` | `zammad` | 100 |
| `support_user` | `zammad-user` | `zammad` | 100 |
| `support_article` | `zammad-article` | `zammad` | 100 |
| `support_search` | `zammad-search` | `zammad` | 100 |
| `support_history` | `zammad-history` | `zammad` | 100 |
| `support_analytics` | `zammad-analytics` | `zammad` | 100 |
| `support_sync` | `zammad-sync` | `zammad` | 100 |
| `support_webhook` | `zammad-webhook` | `zammad` | 100 |

Factory: `registerZammadProviders()` · `createPlatformServicesWithZammad(zammadCore)`.

Resolution precedence unchanged: explicit provider → preferred integration → mapped provider → active → priority.

---

## Mapping

| Canonical type | Prefix | Provisional strip |
| --- | --- | --- |
| `support_request` | `sreq` | `sreq_zammad_` |
| `support_organization` | `sorg` | `sorg_zammad_` |
| `support_group` | `sgrp` | `sgrp_zammad_` |
| `support_user` | `suser` | `suser_zammad_` |
| `support_article` | `sart` | `sart_zammad_` |

Relationship IDs on tickets (group, requester, assignee, organisation) and articles (ticket) are rewritten to platform IDs. Provider-native IDs never escape the mapping boundary.

---

## Gateway integration

| Accessor | Contract | Notes |
| --- | --- | --- |
| `support` | `SupportService` | Pipeline-wrapped when Support providers registered |
| `supportOrganizations` | `SupportOrganizationService` | Same |
| `supportGroups` | `SupportGroupService` | Same |
| `supportUsers` | `SupportUserService` | Same |
| `supportArticles` | `SupportArticleService` | Same |
| `supportSearch` | `SupportSearchService` | Same |
| `supportHistory` | `SupportHistoryService` | Same |
| `supportAnalytics` | `SupportAnalyticsService` | Same |

Unwired accessors throw `PROVIDER_CAPABILITY_UNSUPPORTED`. Sync/webhook providers are registered for capability discovery only — not gateway-exposed as services.

---

## Authorization

Catalogue keys (examples):

- `support.requests.list|read|create|update|assign|transition|manage|administer`
- `support.articles.list|read|create|manage|administer`
- `support.organizations.*` · `support.groups.*` · `support.users.*`
- `support.search.execute|list|read` · `support.analytics.read|list`

No role-assignment UI or provisioning in this milestone.

---

## Files created

**Contracts**

- `packages/platform-service-contracts/src/services/support-*.ts` (8 interfaces)

**Platform services**

- `packages/platform-services/src/providers/zammad/*` (10 providers + register helper)
- `packages/platform-services/src/services/support-service-impls.ts`
- `packages/platform-services/src/services/support-mapping-helpers.ts`
- `packages/platform-services/src/support-platform-services.test.ts`

**Docs**

- `docs/sprint/OSS-110-10-completion-report.md`
- `docs/architecture/APZHUB-Support-Platform-Service-Architecture.md`

## Files modified

- Contracts index / version / `PLATFORM_SERVICE_IDS` / tests
- Mapping types + provisional ID helpers
- Provider types, capability providers, resolver
- `create-platform-services.ts`, gateway, permission catalogue, operation authz map, package exports
- Foundation: CURRENT-STATE, CURRENT-MILESTONE, ACTIVE-BACKLOG, AI-CONTEXT, SESSION-START
- Architecture / gateway / authorisation docs · CHANGELOG · docs/README

---

## Tests

| Suite | Result |
| --- | --- |
| `support-platform-services.test.ts` | 20 passed |
| Contracts + platform-services regression | **168 passed** |
| Areas covered | resolution, mapping, gateway, authz, pipeline metrics, provider failure, priority, global IDs, relationships, error translation |

---

## Coverage (indicative, platform-services Support paths)

| Area | Lines (approx.) |
| --- | --- |
| Gateway / authz map / global-id | high (83–98%) |
| `register-zammad-providers` | 100% |
| `support-service-impls` | ~23% lines / ~88% branches (happy-path ops covered; many sibling methods remain) |
| Individual Zammad providers | partial (support provider exercised most) |

Accepted gap: remaining Support provider method bodies and edge-case mapping paths — expand in OSS-110-11 with HTTP-level integration tests.

---

## Quality gates

| Gate | Result |
| --- | --- |
| lint (`platform-service-contracts`, `platform-services`) | PASS |
| typecheck | PASS |
| tests (contracts + platform-services) | **168 passed** |
| Projects/Plane regression | PASS (unchanged behaviour) |
| `pnpm build` (apps/web) | Pre-existing Next.js `/_global-error` caveat (unrelated) |

---

## Technical debt

1. Sync/webhook providers registered but not gateway-service-wrapped (intentional until ingress milestone).
2. Broader line coverage on `support-service-impls` and non-ticket Zammad providers.
3. No Support HTTP OpenAPI surface yet (OSS-110-11).
4. Search hit provisional IDs normalised where entity refs exist; opaque search-hit IDs remain provider-derived until a dedicated search-hit mapping type is approved.

---

## Comparison with the Projects domain

| Concern | Projects (Plane) | Support (Zammad) |
| --- | --- | --- |
| Factory | `createPlatformServicesWithPlane` | `createPlatformServicesWithZammad` |
| Primary entity | Project / Task | Support Request |
| Global ID prefixes | `proj`, `task`, `ws`, … | `sreq`, `sorg`, `sgrp`, `suser`, `sart` |
| Gateway | `projects`, `tasks`, … | `support`, `supportOrganizations`, … |
| Permissions | `project.*`, `task.*` | `support.requests.*`, … |
| HTTP | OSS-110-07 / 110-09 done | **Not in 110-10** |

---

## Recommendation for OSS-110-11

**OSS-110-11 — Support HTTP API Surface**

- Versioned REST under `/api/v1/support/...` via existing Platform Gateway HTTP patterns
- OpenAPI for Support contracts
- Authz reuse of `support.*` catalogue
- No UI, Event Bus, webhook ingress, or binary attachments

**Do not start OSS-110-11 without explicit owner approval.**
