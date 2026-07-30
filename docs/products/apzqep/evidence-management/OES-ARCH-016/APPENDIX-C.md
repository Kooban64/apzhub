# APZQEP-OES-ARCH-016 — APPENDIX C — Capability Boundaries & Contract Catalogue

## Capability boundaries

| Capability                          | Owns                                                  | Must not own                                                           |
| ----------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| Evidence Management                 | Evidence SoR, ACL, retention, seals, collections/sets | Execution outcomes, defect lifecycle, run orchestration, reporting SoR |
| Test Execution                      | Executions, EvidenceReference                         | Evidence blobs / retention SoR                                         |
| Test Runs (future)                  | Run orchestration                                     | Evidence SoR                                                           |
| Defects (future)                    | Defect lifecycle                                      | Evidence SoR                                                           |
| Reporting / Analytics / AI (future) | Derived views / suggestions                           | Authoritative evidence mutation                                        |

## Logical contract catalogue (names only)

| Contract                             | Direction | Purpose                          |
| ------------------------------------ | --------- | -------------------------------- |
| `captureEvidence`                    | In        | Create evidence + content        |
| `validateEvidence`                   | In        | Validation transition            |
| `classifyEvidence`                   | In        | Classification                   |
| `associateEvidence`                  | In        | Relationship create              |
| `reviewEvidence` / `approveEvidence` | In        | Review path                      |
| `sealEvidence` / `sealEvidenceSet`   | In        | Immutability                     |
| `checkEvidenceAccess`                | In        | Affirmative ACL (TE port target) |
| `getEvidenceMetadata`                | Out       | Metadata read                    |
| `downloadEvidence`                   | Out       | Authorised content               |
| `exportEvidencePack`                 | Out       | Controlled export                |
| `queryEvidenceRelationships`         | Out       | Discovery                        |
| `applyLegalHold` / `disposeEvidence` | In        | Custody controls                 |

Exact signatures, paths, and DTOs → Eng Spec.
