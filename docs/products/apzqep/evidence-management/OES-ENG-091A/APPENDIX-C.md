# APZQEP-OES-ENG-091A — APPENDIX C — Invariants & Business Rules

| ID   | Invariant / rule                                        |
| ---- | ------------------------------------------------------- |
| I-01 | Evidence always has tenantId + ownership scope          |
| I-02 | Content attached ⇒ contentHash + hashAlgorithm present  |
| I-03 | hashAlgorithm default `sha256`                          |
| I-04 | Sealed ⇒ content fields immutable                       |
| I-05 | Disposed ⇒ content delivery denied                      |
| I-06 | legalHold ⇒ dispose prohibited                          |
| I-07 | Relationships never embed content bytes                 |
| I-08 | EvidenceSet membership immutable after seal             |
| I-09 | Revision required for mutating commands (except create) |
| I-10 | History append-only for material commands               |
| I-11 | Cross-tenant access impossible                          |
| I-12 | Access grant effect must be explicit allow to permit    |
| I-13 | Integrity failed ⇒ download/export deny                 |
| I-14 | Consumers own EvidenceReference only                    |
| I-15 | availableActions is sole UI action authority            |

## Business rules (selected)

| ID    | Rule                                                          |
| ----- | ------------------------------------------------------------- |
| BR-01 | Reject/quarantine require reason                              |
| BR-02 | Dispose requires reason + confirmation                        |
| BR-03 | Legal hold requires reason                                    |
| BR-04 | Seal set computes sealHash over ordered member content hashes |
| BR-05 | Media type must be on allow-list                              |
| BR-06 | Size must be within classification policy limits              |
