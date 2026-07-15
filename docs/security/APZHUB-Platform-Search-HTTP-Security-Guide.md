# Platform Search HTTP Security Guide

## Trust boundaries

- Authentication: `withPlatformApiAuth` builds trusted `ServiceRequestContext`
- Authorisation: RequestPipeline + operation map (`search.query.*`, management keys)
- Clients **cannot** supply authoritative `tenantId`, `organisationId`, `roles`, or `permissions`

## Request validation

Zod schemas reject:

- Filters on isolation fields (`tenantId`, `organisationId`, `classification`, …)
- Raw Meilisearch-style filter expressions in values
- Semantic / vector / embedding fields
- Unbounded `pageSize` (> 100) or extreme pages

## Response hygiene

- Management handlers redact keys matching secret/password/token/apiKey patterns
- Inline credential-looking strings become `[REDACTED]`
- Index UIDs and provider credentials never belong on the public HTTP surface

## Omitted surface

Public index/document HTTP is unavailable by design (gateway-only). Audits prove routes and OpenAPI absence.
