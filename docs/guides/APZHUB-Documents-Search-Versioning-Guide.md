# Documents Search Versioning Guide

**Milestone:** APZSEARCH-012

## Decision

1. **Primary Search entity:** Document (with current-version metadata).
2. **Optional:** independent `document_version` entities for version discovery.

## Version entity rules

- Parent Document required for classification/permissions/tenant inheritance.
- Include: version id, parent documentId, versionNumber, label, createdAt, createdBy, checksumPresent, navigation to parent document.
- Never: storageRef, checksum hex, binary, signed URLs, provider ETags.

## Immutability

Versions are treated as immutable content snapshots at the Document Platform. Search publication may update metadata only if the journal already holds the version entity; preferred flow remains Document primary update when a new version commits (`onDocumentVersionCommitted` upserts the Document).
