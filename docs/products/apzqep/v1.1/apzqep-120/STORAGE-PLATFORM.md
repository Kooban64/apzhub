# Evidence Storage Platform

| Field     | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| Programme | APZQEP-120                                                              |
| Slice     | APZQEP-120-S03                                                          |
| ADR       | [ADR-0094](../../../../adr/ADR-0094-evidence-storage-provider-first.md) |
| Status    | **IMPLEMENTED** (Local reference provider)                              |

---

## Purpose

Isolate APZQEP from physical storage technology. The platform owns:

1. **EvidenceStorageProvider** — provider-agnostic contract
2. **EvidenceStorageManager** — selection, lifecycle, error translation, audit hooks; implements Application `StoragePort`
3. **Providers** — Local (reference), Memory (default/tests); future S3/Azure/GCS/MinIO/NAS/vault

## Contract (capabilities)

| Capability | Description                                |
| ---------- | ------------------------------------------ |
| store      | Persist bytes → opaque locator             |
| retrieve   | Full-byte get                              |
| stream     | Handle + optional `chunks()` AsyncIterable |
| exists     | Presence check                             |
| delete     | Hard remove content object                 |
| update     | Replace bytes when not archived            |
| archive    | Content-side archive flag                  |
| health     | Provider health                            |
| metadata   | Content-side metadata (not aggregate SoR)  |

## Developer guide

```ts
import {
  createEvidenceStorage,
  createEvidenceRuntimeForLocal,
  createEvidenceRuntimeForMemory,
} from "@apzhub/qep-evidence";

// Prefer runtime factories from Application wiring:
const memoryRuntime = createEvidenceRuntimeForMemory();
const localRuntime = createEvidenceRuntimeForLocal({
  rootDirectory: process.env.APZQEP_EVIDENCE_STORAGE_ROOT!,
});

// Or Storage Platform directly (Infrastructure):
const { manager } = await createEvidenceStorage({
  provider: "local",
  local: { rootDirectory: "/var/apzqep/evidence" },
});
// manager is StoragePort — pass into Application Services
```

**Do not** import Local Provider from Application or modules.

## Adding a future provider

1. Implement `EvidenceStorageProvider` (no Application changes).
2. Register in `create-evidence-storage` when config kind is enabled.
3. Extend `EvidenceStorageProviderKind` + config schema.
4. Never expose vendor types above the Manager.

## Related

- [S03-ENGINEERING-NOTES.md](./S03-ENGINEERING-NOTES.md)
- Application port: `packages/qep-evidence/src/application/ports/storage-port.ts`
