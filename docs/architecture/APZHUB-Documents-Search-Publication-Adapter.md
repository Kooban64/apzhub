# APZHUB Documents Search Publication Adapter Architecture

**Milestone:** APZSEARCH-012  
**Package:** `@apzhub/search-documents` **0.1.0**  
**Date:** 2026-07-15

---

## Purpose

Enable the Document Platform to publish **metadata-only** canonical searchable entities into `@apzhub/search-integration`.

Document Platform remains System of Record. Search is a derived discovery capability.

Documents never:

- call Meilisearch or Search Platform internals;
- publish binary content, OCR, or extracted text;
- expose storage keys, buckets, paths, signed URLs, or credentials;
- downgrade classifications or broaden visibility.

---

## Flow

```text
Document Platform canonical models (@apzhub/document-contracts)
        ↓
Documents Search Publication Adapter (@apzhub/search-documents)
        ↓
Search Integration Framework (@apzhub/search-integration)
        ↓
(future) Search Platform → Provider Resolver → Meilisearch
```

This milestone stops at the Search Integration Framework.

---

## Entity types

| Type                  | Canonical model                       | Independent discovery |
| --------------------- | ------------------------------------- | --------------------- |
| `document`            | `Document`                            | **Primary**           |
| `document_version`    | `DocumentVersion` + parent `Document` | Optional              |
| `document_collection` | `DocumentCollection`                  | Yes                   |
| `document_folder`     | `DocumentFolder`                      | Yes                   |
| `document_category`   | `DocumentCategory`                    | Yes                   |
| `document_tag`        | `DocumentTag`                         | Yes                   |

Relationships and audit records are **not** independent Search entities. Generated-report refs and retention summaries ride on the Document.

---

## Version publication decision

**Preferred default + optional version entities:**

1. Publish canonical **Document** with current-version metadata (`currentVersionId`, `versionNumber`, `checksumPresent`).
2. Optionally publish **`document_version`** for version-level discovery — inherits classification/permissions/tenant from parent Document; never `storageRef` or checksum hex.

---

## Security boundary

- Explicit safe-metadata **allowlist** (`DOCUMENTS_SEARCH_SAFE_METADATA_KEYS`).
- Reject storage leakage keys/values.
- Map Document classifications into Search `public|internal|confidential|restricted` without downgrade (unknown/custom → confidential fail-closed).
- Tenant/org from trusted publication context.
- Production factories require explicit sink / integration publisher (no silent memory fallback).

---

## Components

`DocumentsSearchPublisher` · mapper · validator · context · lifecycle · diagnostics/metrics/logger/error translator · explicit lifecycle hooks · `createDocumentsSearchPublisher` / `*ForTest`.
