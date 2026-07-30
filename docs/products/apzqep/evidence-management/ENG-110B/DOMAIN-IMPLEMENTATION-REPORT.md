# Domain Implementation Report — APZQEP-ENG-110B

## Package path

`packages/qep-evidence/src/domain/evidence/`

## Implemented

| Area            | Artefacts                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Aggregate root  | `Evidence` + command functions                                                                                              |
| Aggregates      | `EvidenceCollection`, `EvidenceSet`, `EvidenceRelationship`                                                                 |
| Value objects   | Status, Content, Integrity, Classification, Source, Ownership, Retention, Metadata, PolicyReference, EvidenceReference, Ids |
| Entities        | EvidenceVersion, EvidenceDisposition, EvidenceProvenanceEvent                                                               |
| Domain services | Integrity (hash compare only), Lifecycle, Retention, SetSeal                                                                |
| Policies        | Lifecycle, ContentMutation, Seal, Dispose, Hold, Content, Reason, Ownership                                                 |
| Events          | Past-tense `evidence.*` builders; `uncommittedEvents`                                                                       |
| Errors          | `src/shared/errors.ts`                                                                                                      |

## Explicitly not implemented

StoragePort · repositories · persistence · SHA-256 crypto · REST · ACL evaluation · event bus · Workbench · DI.
