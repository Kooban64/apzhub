# APZQEP-120-S03 — Engineering Notes

| Field      | Value                                       |
| ---------- | ------------------------------------------- |
| Slice      | APZQEP-120-S03 Evidence Storage Platform    |
| Reference  | L-EM-03                                     |
| Process    | APZHUB-ENG-001 · ADR-0092 · ADR-0094        |
| Date       | 2026-08-01                                  |
| Depends on | APZQEP-120-S01 · APZQEP-120-S02 (CERTIFIED) |

---

## Architecture (implemented)

```text
EvidenceApplicationServices
  → StoragePort
      → EvidenceStorageManager
          → EvidenceStorageProvider (registry)
              → MemoryEvidenceStorageProvider (default / tests)
              → LocalEvidenceStorageProvider (reference implementation)
```

No Application, Domain, API, or Presentation component imports `node:fs` or talks to Local Provider directly.

## Modules

| Component          | Path                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Provider contract  | `packages/qep-evidence/src/infrastructure/storage/platform/evidence-storage-provider.ts` |
| Storage Manager    | `.../platform/evidence-storage-manager.ts`                                               |
| Registry / factory | `.../platform/registry.ts`, `create-evidence-storage.ts`                                 |
| Local Provider     | `.../providers/local/local-evidence-storage-provider.ts`                                 |
| Memory Provider    | `.../providers/memory/memory-evidence-storage-provider.ts`                               |
| Runtime wiring     | `.../persistence/create-evidence-persistence.ts`                                         |
| Platform Services  | `packages/platform-services/.../create-qep-evidence-platform-services.ts`                |

## Guiding principle

Outside the Storage Platform, APZQEP must not know:

- filesystem paths
- storage drivers
- cloud providers / buckets / blob protocols

Locators are opaque (`evst://local/{uuid}`, `evst://memory/{n}`).

## Configuration

| Variable                            | Role                           |
| ----------------------------------- | ------------------------------ |
| `APZQEP_EVIDENCE_STORAGE_PROVIDER`  | `memory` (default) \| `local`  |
| `APZQEP_EVIDENCE_STORAGE_ROOT`      | Required when provider=`local` |
| `APZQEP_EVIDENCE_STORAGE_MAX_BYTES` | Optional object size limit     |

Manager selection is configuration-driven — Local is never hard-coded as the active provider.

## Metadata separation

- **Logical:** evidence aggregate metadata (repositories; still memory until S04)
- **Content:** opaque locators + content-side metadata via StoragePort
- Physical layout (`content.bin`, `meta.json`, root paths) stays inside Local Provider

## Security

- Tenant / object ID sanitisation; path traversal rejection
- Overwrite denied on create (new locator per store)
- Archived objects cannot be replaced
- Errors never include absolute filesystem paths
- Filesystem I/O confined to `providers/local/` (architecture boundary test)

## Performance

- Local `stream` / `chunks()` uses filesystem read streams (no full-file buffer for stream path)
- `get` returns full bytes (API contract); prefer stream for large evidence

## Explicit exclusions (later slices)

S3 / Azure / GCS / MinIO · encryption at rest · AV · retention · versioning productisation · PG metadata SoR (S04)

## Tests

- `evidence-storage-platform.test.ts` (unit + integration + negative)
- Architecture boundary: FS only in Local provider; Manager does not import Local factory
- S01/S02 regression suites unchanged green

## Rollback

Revert engineering commit; Application continues to consume `StoragePort`. Skeleton `StoragePortAdapterSkeleton` remains for ENG-110C contract tests.
