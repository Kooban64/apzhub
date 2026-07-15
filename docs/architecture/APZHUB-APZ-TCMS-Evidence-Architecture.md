# APZ TCMS — Evidence Architecture

**Milestone:** APZTCMS-006  
**Packages:** contracts **0.3.0**, services **0.2.0**, persistence **0.4.0**

---

## Principle

PostgreSQL stores **evidence metadata only**. Binary bytes are abstracted behind `EvidenceStorageProvider`.

```text
EvidenceService
      │
      ├─ SoR (testing_evidence) — type, title, checksum, mime, size, lifecycle, refs
      │
      └─ EvidenceStorageProvider
            ├─ InMemoryEvidenceStorageProvider   ← default in factory / tests
            └─ ObjectStorageProvider             ← contract only (unimplemented cloud)
```

---

## Storage contracts

| Type                              | Role                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `EvidenceStorageProvider`         | `put` / `get` / `delete` / `exists`                                                                                           |
| `InMemoryEvidenceStorageProvider` | Map-backed; may hold `Uint8Array` in process                                                                                  |
| `ObjectStorageProvider`           | Extends provider with `providerKind: "object_storage"`; `createUnimplementedObjectStorageProvider()` throws `not_implemented` |

**Not implemented:** S3, MinIO, Azure Blob SDKs.

---

## Metadata fields

type, title, description, storageRef, contentType/mimeType, contentHash/checksum, sizeBytes, captureTime, authorUserId, lifecycleStatus, verificationState, evidenceApprovalState, relationships, session/case/step/execution links.

---

## Related

[Evidence Lifecycle](./APZHUB-APZ-TCMS-Evidence-Lifecycle.md) · [Manual Execution Engine](./APZHUB-APZ-TCMS-Manual-Execution-Engine.md)
