# APZHUB Platform Document Workbench — Views Guide

**Milestone:** APZDOCS-005

All views are **read-only**. Data loads through React Query + `document-api` facades.

| View                         | Primary data                             | Notes                                    |
| ---------------------------- | ---------------------------------------- | ---------------------------------------- |
| Overview                     | `listDocuments` + selected `getDocument` | Landing summary                          |
| Documents / Metadata         | `listDocuments`                          | Filterable table                         |
| Versions                     | `listVersions` + `getStorageMetadata`    | Checksum / storage key **presence** only |
| Folders / Collections / Tags | Derived from list metadata               | Rollups; click filters list              |
| Relationships                | Selected document context                | No create UI                             |
| Retention                    | List + detail retention IDs              | No apply UI                              |
| Audit                        | `listAudit`                              | Per selected document                    |
| Diagnostics                  | `getDiagnostics`                         | Safe fields only                         |

Never displays object keys, filesystem paths, bucket names, credentials, signed URLs, or binary content.
