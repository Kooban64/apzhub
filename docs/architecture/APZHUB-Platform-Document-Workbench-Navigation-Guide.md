# APZHUB Platform Document Workbench — Navigation Guide

**Milestone:** APZDOCS-005

## Activity Bar

**Documents** (`platform-documents`) → `/workspace/documents` — permission `document.read`.

## Sidebar

| Label | Route | Permission |
|-------|-------|------------|
| Overview | `/workspace/documents/overview` | `document.read` |
| Documents | `/workspace/documents/documents` | `document.read` |
| Versions | `/workspace/documents/versions` | `document.version.read` |
| Collections | `/workspace/documents/collections` | `document.collection.read` |
| Folders | `/workspace/documents/folders` | `document.folder.read` |
| Tags | `/workspace/documents/tags` | `document.tag.read` |
| Relationships | `/workspace/documents/relationships` | `document.relationship.read` |
| Retention | `/workspace/documents/retention` | `document.retention` |
| Audit | `/workspace/documents/audit` | `document.audit` |
| Diagnostics | `/workspace/documents/diagnostics` | `document.read` |
| Metadata | `/workspace/documents/metadata` | `document.metadata.read` |

Navigation is manifest-driven and filtered by the shell permission adapter. Server remains authoritative for API calls.
