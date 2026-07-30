# StoragePort Specification Report — APZQEP-ENG-110C

| Field      | Value                                                         |
| ---------- | ------------------------------------------------------------- |
| Location   | `packages/qep-evidence/src/application/ports/storage-port.ts` |
| Skeleton   | `infrastructure/storage/storage-port-adapter.ts`              |
| Technology | **undecided** (ADR-0088)                                      |

## Behaviours

| Method               | Purpose                                             |
| -------------------- | --------------------------------------------------- |
| `put`                | Store content bytes → opaque `storageLocator`       |
| `get`                | Retrieve full bytes                                 |
| `openStream`         | Stream handle abstraction (no provider stream type) |
| `update`             | Replace content bytes when policy allows            |
| `archive`            | Content-side archive marker                         |
| `dispose` / `delete` | Dispose content bytes after authorised disposition  |
| `exists`             | Locator existence check                             |
| `getMetadata`        | Content-side metadata only (not aggregate SoR)      |

## Separation

| Concern                                                                       | Owner                                                      |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Aggregate truth (status, retention, legal hold, integrity metadata, versions) | Repositories / metadata SoR                                |
| Raw content bytes                                                             | StoragePort only                                           |
| ACL                                                                           | Application (future wave) — StoragePort MUST NOT authorise |

## Explicit non-assumptions

No S3, Azure Blob, GCS, local filesystem, DB BLOBs, MinIO, or other provider references in contracts or skeleton.
