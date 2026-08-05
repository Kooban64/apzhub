# APZHUB Platform Document Workbench — Navigation Guide

**Milestone:** APZDOCS-005 · **Native:** APZ-DOCUMENTS-NATIVE-001-N03

## Activity Bar

**Documents** (`platform-documents`) → `/workspace/documents` — permission `document.read`.  
View title: **APZ Documents**.

## Sidebar

| Label         | Route                                | Permission                   |
| ------------- | ------------------------------------ | ---------------------------- |
| Overview      | `/workspace/documents/overview`      | `document.read`              |
| Library       | `/workspace/documents/documents`     | `document.read`              |
| Versions      | `/workspace/documents/versions`      | `document.version.read`      |
| Collections   | `/workspace/documents/collections`   | `document.collection.read`   |
| Folders       | `/workspace/documents/folders`       | `document.folder.read`       |
| Tags          | `/workspace/documents/tags`          | `document.tag.read`          |
| Relationships | `/workspace/documents/relationships` | `document.relationship.read` |
| Retention     | `/workspace/documents/retention`     | `document.retention`         |
| Audit         | `/workspace/documents/audit`         | `document.audit`             |
| Diagnostics   | `/workspace/documents/diagnostics`   | `document.admin`             |
| Metadata      | `/workspace/documents/metadata`      | `document.metadata.read`     |
| Help          | `/workspace/documents/help`          | `document.read`              |
| Settings      | `/workspace/documents/settings`      | `document.read`              |

**Library** is the Enterprise Document Library (governed browse) — secondary to work-first attach journeys.

Navigation is manifest-driven and filtered by the shell permission adapter. Server remains authoritative for API calls.
