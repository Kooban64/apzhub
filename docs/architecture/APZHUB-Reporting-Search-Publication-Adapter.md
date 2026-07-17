# APZHUB Reporting Search Publication Adapter Architecture

**Milestone:** APZSEARCH-014  
**Package:** `@apzhub/search-reporting` **0.1.0**  
**Date:** 2026-07-15

---

## Purpose

Enable the Reporting Platform to publish **metadata-only** canonical searchable entities into `@apzhub/search-integration`.

Reporting Platform remains System of Record. Search is a derived discovery capability.

Reporting never:

- calls Meilisearch or Search Platform internals;
- publishes rendered report bodies (PDF/DOCX/HTML/MD/CSV/JSON content);
- exposes `parametersJson` values, checksum hex, or template section blueprints;
- downgrades classifications or broadens visibility.

---

## Flow

```text
Reporting Platform canonical models (@apzhub/reporting-contracts)
        ↓
Reporting Search Publication Adapter (@apzhub/search-reporting)
        ↓
Search Integration Framework (@apzhub/search-integration)
        ↓
(future) Search Platform → Provider Resolver → Meilisearch
```

This milestone stops at the Search Integration Framework.

---

## Entity types

Local catalogue expands the framework contract (`report|template|dashboard`):

| Type | Canonical model | Notes |
| ---- | --------------- | ----- |
| `report_template` | `ReportTemplate` (+ tenant via extras/context) | Omits sections/header/footer/branding |
| `report_category` | thin `ReportingCategorySearchInput` | |
| `report_placeholder_catalogue` | thin input | Placeholder **labels** only |
| `report_definition` | thin or `ReportTemplate` shaped | Prefer thin `ReportingDefinitionSearchInput` |
| `report_type` | thin `ReportingTypeSearchInput` | |
| `report_profile` | thin input | |
| `report_generation` | alias of generation metadata | Same model as metadata entity |
| `report_generation_metadata` | `ReportGenerationMetadata` | **Primary** generation entity |
| `report_output_metadata` | derived from generation metadata | format / byteLength / checksumPresent |
| `report_consumer` | thin input | |
| `report_usage_summary` | thin input | |

Framework aliases accepted by type guards: `template` → `report_template`, `report` → `report_generation_metadata`, `dashboard` → `report_usage_summary`.

Canonical routes: `/workspace/reporting/...`

---

## Security boundary

- Explicit safe-metadata **allowlist** (`REPORTING_SEARCH_SAFE_METADATA_KEYS`).
- Reject rendered content / binary / parametersJson / checksum hex / body keys.
- Classification from context/extras; fail-closed **confidential** default; **neverDowngrade**.
- Tenant required; entity.tenantId must match when present.
- Production factories require explicit sink / integration publisher (no silent memory fallback).

---

## Components

`ReportingSearchPublisher` · mapper · validator · context · lifecycle · diagnostics/metrics/logger/error translator · explicit lifecycle hooks · `createReportingSearchPublisher` / `*ForTest`.
