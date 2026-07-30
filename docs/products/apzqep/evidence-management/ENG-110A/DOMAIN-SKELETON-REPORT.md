# Domain Skeleton Report — APZQEP-ENG-110A

Identity scaffolds only — **no business rules**.

| Area            | Artefacts                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Aggregates      | Evidence · EvidenceCollection · EvidenceSet · EvidenceRelationship                                 |
| Entities        | EvidenceVersion · EvidenceDisposition · EvidenceProvenanceEvent                                    |
| Value objects   | Status · Content · Integrity · Classification · Source · Ownership · Retention · EvidenceReference |
| Domain services | Integrity · Lifecycle · Retention                                                                  |
| Events          | Past-tense name catalogue (no payloads/publishers)                                                 |
| Specifications  | Sealable · Disposable · MutableContent                                                             |
| Factories       | EvidenceFactory · EvidenceSetFactory                                                               |
| Repositories    | Interface identities only (methods on Application ports later)                                     |

Status marker: `QEP_EVIDENCE_DOMAIN_STATUS = "scaffolded-eng-110a"`.
