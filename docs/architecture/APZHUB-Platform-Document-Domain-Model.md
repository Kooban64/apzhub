# APZHUB Platform Document — Domain Model

**Milestone:** APZDOCS-001

## Canonical entities

| Entity                        | Purpose                                          |
| ----------------------------- | ------------------------------------------------ |
| Document                      | Aggregate root (metadata authoritative)          |
| DocumentVersion               | Version identity (structure only; no VCS engine) |
| DocumentRevision              | Revision identity (structure only)               |
| DocumentMetadata              | Title, mime, size, custom fields                 |
| DocumentClassification        | Classification code + optional custom            |
| DocumentCategory              | Hierarchical category                            |
| DocumentFolder                | Folder path metadata                             |
| DocumentCollection            | Named document sets                              |
| DocumentReference             | Cross-product external reference                 |
| DocumentRelationship          | Document↔document or document↔product link       |
| DocumentLifecycle             | State + actor + reason                           |
| DocumentRetention             | Retention policy metadata                        |
| DocumentAudit                 | Immutable audit entries                          |
| DocumentPermission            | Principal/action grants                          |
| DocumentOwner                 | Owner identity                                   |
| DocumentSummary               | List/search projection                           |
| DocumentTag                   | Tenant tags                                      |
| DocumentLink                  | External href metadata                           |
| DocumentAttachment            | Attachment metadata + optional storageRef        |
| DocumentTemplateReference     | Template provenance                              |
| DocumentGenerationReference   | Report generation provenance                     |
| DocumentChecksum              | Content fingerprint metadata                     |
| DocumentSignature             | Signature metadata                               |
| DocumentStatus / DocumentType | Enumerations                                     |

## Ownership

- **Platform owns** identity, metadata, classification, lifecycle, relationships, retention, audit.
- **Storage providers** (future) own binary bytes behind opaque `storageRef`.
- **Products** supply references and consume summaries — they do not redefine the domain.

## Branded identifiers

Document entities use branded platform IDs (`DocumentId`, `DocumentTagId`, …) via `@apzhub/document-contracts`.
