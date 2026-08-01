# ADR-0094 — Evidence Storage Provider First

| Item      | Value                                                              |
| --------- | ------------------------------------------------------------------ |
| ADR       | **ADR-0094**                                                       |
| Title     | Evidence Storage Provider First (Platform-Neutral Content Storage) |
| Status    | **Accepted**                                                       |
| Date      | 2026-08-01                                                         |
| Product   | APZ QEP                                                            |
| Programme | Product Board guidance before APZQEP-120-S03                       |
| Deciders  | Owner / APZOR Engineering                                          |

---

## Context

ADR-0088 separates Evidence **metadata SoR** from **content bytes** behind a storage abstraction and deliberately does not select a cloud vendor.

Product Board guidance after S02: do not jump to direct S3 (or other cloud) integration as the next content step. Establish a provider model first.

## Decision

1. Content durability work **SHALL** deliver an **Evidence Storage Platform**: provider-agnostic contract + Storage Manager, consumed only via the Evidence Application / `StoragePort` boundary.
2. The primary outcome is the **abstraction**, not a particular backend. Application code outside the Storage Platform **SHALL NOT** know filesystem paths, buckets, drivers, or cloud vendors.
3. The first concrete implementation **SHALL** be a **Local Provider** (reference implementation for LA/tests) — not a mandatory cloud vendor.
4. Later providers (S3-compatible, MinIO, Azure Blob, GCS, NAS, encrypted vault, etc.) are **adapters** behind the same interface. APZQEP Application Services and modules never call vendor SDKs or Local Provider APIs directly — only the Storage Manager.
5. **Metadata SoR** (PostgreSQL) remains a separate concern per ADR-0088 and Document 011 — provider-first does not mean “skip metadata durability.” Sequencing of metadata vs content slices is set by the authorised APZQEP-120 slice instruction.
6. Technology selection for production cloud backends remains an Owner decision (D-001 / ADR-0088) and does not change the provider contract.

### Clarification (Owner — APZQEP-120-S03)

S03 is titled **Evidence Storage Platform**. Local storage is the first provider, not the product outcome.

## Consequences

- Platform-neutral content storage; vendor replaceability.
- Aligns with self-hosted / OSS-first APZHUB principles.
- Prevents cloud SDK leakage into domain or modules.

## Related

- [ADR-0088](./ADR-0088-evidence-storage-abstraction.md)
- APZQEP-120 slice catalogue S03/S04
- Foundation [004](../004-technology-stack-repository-standards-development-environment.md)
