# Evidence Integrity Platform

| Field      | Value                                  |
| ---------- | -------------------------------------- |
| Product    | APZ QEP                                |
| Slice      | APZQEP-120-S04                         |
| Status     | **IMPLEMENTED** (LIMITED_AVAILABILITY) |
| Capability | Content integrity verification         |

---

## Purpose

Prove whether evidence **content bytes** are unchanged from the point at which an integrity record was established.

APZQEP owns integrity policy. The Storage Platform owns persistence. Providers own storage mechanics. ACL owns visibility.

## Algorithm

| Item       | Value                                                        |
| ---------- | ------------------------------------------------------------ |
| Default    | `sha256`                                                     |
| Encoding   | lowercase hex                                                |
| Streaming  | yes (via `StoragePort.openStream().chunks()` when available) |
| Comparison | timing-safe                                                  |

Future algorithms register behind the same contract without changing Application Services.

## Operations

```text
getIntegrityStatus(evidenceId)     → public status (no digests)
establishIntegrity(evidenceId)     → baseline digest from storage stream
verifyIntegrity(evidenceId)        → compare current content to baseline
```

## States

`NOT_ESTABLISHED` · `ESTABLISHED` · `VERIFIED` · `MISMATCH` · `CONTENT_MISSING` · `ERROR` · `UNSUPPORTED`

## Provider independence

Works with Memory and Local providers through `StoragePort` only. Future cloud providers require no integrity redesign.

## Limitations (explicit)

- Not digital signing or non-repudiation
- Not immutable storage
- Not chain of custody
- Not malware scanning
- Not automatic repair or re-baselining
- Catalogue / metadata SoR delivered in S05 (PostgreSQL first durable adapter)
- Platform event bus publish deferred

## Configuration

No new provider selection. Uses the S03 Storage Platform configuration.

## Related

- [S04-ENGINEERING-NOTES.md](./v1.1/apzqep-120/S04-ENGINEERING-NOTES.md)
- [ADR-0094](../adr/ADR-0094-evidence-storage-provider-first.md)
- [STORAGE-PLATFORM.md](./v1.1/apzqep-120/STORAGE-PLATFORM.md)
