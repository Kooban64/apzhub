# APZ Documents 1.0.0 — Administrator Guide

> **Product:** APZ Documents  
> **Version:** **1.0.0**  
> **Audience:** Platform administrators · operators  
> **Date:** 2026-07-19

---

## Prerequisites

- APZHUB platform deployed (PostgreSQL, Redis, Better Auth)
- Document storage provider configured (filesystem or S3-compatible) via platform config — **references only**, never commit secrets
- Permissions: assign `document.*` as required for roles

## Enablement checks

1. Users with Documents permissions see `/workspace/documents` in navigation
2. `GET/POST` family under `/api/v1/documents` respects AuthZ
3. Health/diagnostics surfaces available to authorised admins
4. Search publication for documents is healthy if Unified Search is enabled

## Security

- Never expose storage provider admin UIs as the primary Documents UX
- No Paperless (or other DMS) login for standard users
- Superadmin is an explicit permission tier — not a silent AuthZ bypass
- Correlate API operations with platform correlation IDs

## Backup

- Backup platform PostgreSQL (document metadata)
- Backup configured object/filesystem storage per provider runbooks
- Treat metadata and blobs as a coordinated restore set when binary storage is used operationally within certified provider limits

## Out of scope ops (Release 1.0)

Upload/download product pipelines · OCR workers · Paperless sync · Azure Blob/GCS certified providers

## Related

- [Operational Readiness](../APZ-DOCUMENTS-1.0-OPERATIONAL-READINESS.md)
- [Compatibility](../APZ-DOCUMENTS-1.0-COMPATIBILITY.md)
