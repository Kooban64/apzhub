# APZHUB Reporting Search Security and Classification Guide

**Package:** `@apzhub/search-reporting` · **Milestone:** APZSEARCH-014

## Fail-closed defaults

- Classification defaults to **`confidential`** when absent.
- `neverDowngrade` is **true** by default — extras cannot lower context classification.
- Permissions required on publication context.
- Tenant required; entity tenant must match when present.

## Forbidden in search index

- Rendered bodies: PDF / DOCX / HTML / MD / CSV / JSON content
- `parametersJson` **values**
- Checksum **hex** (presence flag `checksumPresent` is OK)
- Template section blueprints / header / footer / branding content
- Provider keys (Meilisearch / OpenSearch / etc.)
- Storage / credential / signed URL patterns

## Allowlist

`REPORTING_SEARCH_SAFE_METADATA_KEYS` in `security/safe-fields.ts`. Custom keys outside the allowlist are omitted (`filterSafeCustomMetadata`).

## Production wiring

`createReportingSearchAdapter` / `createReportingSearchPublisher` require an explicit `sink` or `integrationPublisher`. Test factories may use in-memory sink via `createSearchIntegration()`.
