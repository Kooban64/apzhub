# Search Platform Service Contracts Reference

> **Milestone:** APZSEARCH-003 · Package `@apzhub/search-contracts` **0.3.0**

Canonical application-facing interfaces live in `packages/search-contracts/src/services/platform-search-services.ts`.

## Aggregated gateway

`SearchPlatformGateway` exposes 14 facets (see architecture doc). All methods accept `SearchRequestContext` (tenant, organisation, actor, permissions, correlation).

## No execution service

There is no `SearchExecutionService`. `PlatformSearchQueryService.validateQuery` validates shape only. Optional `query` must throw `search_execution_unavailable`.

## Models

Reuse domain models from `@apzhub/search-contracts` — providers, configurations, capabilities, health, diagnostics, collections, sources, scopes, profiles, metadata, audits, statistics, validation results. Do not duplicate in platform-service-contracts.

## Errors

`SearchDomainError` classifications include: provider/config/collection/source/scope/profile not found, duplicate provider, configuration invalid/revision conflict, tenant/organisation mismatch, capability unsupported, persistence unavailable, **search_execution_unavailable**.
