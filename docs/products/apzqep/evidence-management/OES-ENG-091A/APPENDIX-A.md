# APZQEP-OES-ENG-091A — APPENDIX A — Glossary

| Term                        | Definition                                    |
| --------------------------- | --------------------------------------------- |
| Evidence                    | Aggregate root; SoR item for quality evidence |
| EvidenceReference           | Consumer-side pointer (non-SoR)               |
| EvidenceContent             | Media type, size, hash, storage locator       |
| EvidenceCollection          | Mutable working group of evidence ids         |
| EvidenceSet                 | Immutable sealed membership snapshot          |
| EvidenceRelationship        | Typed link to a domain object or evidence     |
| EvidenceStatus              | Canonical lifecycle state enum                |
| StoragePort                 | Infrastructure port for content bytes         |
| EvidenceAccessPolicyService | Fail-closed ACL + permission evaluator        |
| availableActions            | Server-computed executable action list        |
| legalHold                   | Disposition-blocking custody flag             |
| sealed                      | Content + critical integrity fields immutable |
| contentHash                 | SHA-256 hex digest of raw bytes               |
| storageLocator              | Opaque content address for StoragePort        |
| outcome allowed             | Sole affirmative access grant value           |
