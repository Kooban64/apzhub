# Search Collection, Source, Scope and Profile Guide

> **Milestone:** APZSEARCH-003

## Collections

Metadata for governed search scope groupings. Operations: create/get/list/update/enable/disable/archive/restore.  
**Not** a provider index. Do not send definitions to an engine.

## Sources

Metadata for future searchable domains (Projects, Support, Documents, …). Assign provider/collection as metadata only. Do not read product business data or implement product adapters.

## Scopes

Canonical scope metadata with tenant/organisation restrictions and classification/permission metadata. Do not execute queries.

## Profiles

Default scopes/filters/sorts/facets/highlight preferences as metadata. No executable scripts. No product business logic.
