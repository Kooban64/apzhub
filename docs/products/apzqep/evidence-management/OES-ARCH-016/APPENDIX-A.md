# APZQEP-OES-ARCH-016 — APPENDIX A — Glossary

| Term                   | Definition                                                             |
| ---------------------- | ---------------------------------------------------------------------- |
| Evidence               | Aggregate root; governed quality-relevant content + metadata SoR       |
| EvidenceContent        | Logical descriptor for bytes (media type, size, hash, storage locator) |
| EvidenceReference      | Non-SoR pointer held by consumer capabilities                          |
| EvidenceCollection     | Mutable named grouping of evidence items                               |
| EvidenceSet            | Immutable sealed snapshot of a collection                              |
| EvidenceSource         | Capture provenance (manual, automation, ingestion, export)             |
| EvidenceRelationship   | Typed association Evidence ↔ domain object or Evidence ↔ Evidence      |
| EvidenceClassification | Sensitivity / category labels                                          |
| EvidenceIntegrity      | Hash, verification, and seal state                                     |
| EvidenceLifecycle      | Authorised state machine for evidence items                            |
| EvidenceRetention      | Retention class and retain-until metadata                              |
| EvidenceDisposition    | Audited disposal / destruction record                                  |
| EvidenceVersion        | Pre-seal content revision lineage                                      |
| EvidencePolicy         | Retention, classification, or access policy definition                 |
| EvidenceAccess         | Affirmative allow/deny decision (default-deny)                         |
| EvidenceOwnership      | Tenant / project / actor ownership context                             |
| EvidenceProvenance     | Chain-of-custody event history                                         |
| StoragePort            | Abstraction for content bytes; technology undecided                    |
| EvidenceService        | Future platform service name (user-facing)                             |
| availableActions       | Server-computed executable action list — sole UI authority             |
| Legal hold             | Disposition-blocking custody control                                   |
| Sealed / Locked        | Content and critical integrity fields immutable                        |
