# Documents Search Mapping Guide

**Package:** `@apzhub/search-documents` · **Milestone:** APZSEARCH-012

## Source models

From `@apzhub/document-contracts` only (no persistence/storage imports).

## Document → SearchEntityDraft

| Search field | Source |
| ------------ | ------ |
| entityId | `Document.id` |
| entityType | `document` |
| title / summary | `title` / `description` |
| classification | mapped from `Document.classification.code` |
| permissions | context + `principalType:principalId:action` tokens |
| metadata (allowlisted) | mimeType, documentType, status, categoryId, folderId, tagIds (joined), owner/creator, byteLength, currentVersion*, checksumPresent, generation*, template*, legalHold, retentionPolicyKey |
| navigationTarget | `/workspace/documents/{id}` |

**Omitted:** storageRef, checksum hex, signature, retention notes, custom unsafe keys.

## Version entities

Require parent Document for security inheritance. Metadata: documentId, versionNumber, label, checksumPresent, createdBy. No storage keys.

## Folder / collection / category / tag

Names + tenant-safe ids. Folder `path` included only when it does not look like a filesystem/URI storage leak.
