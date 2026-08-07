# System of Record Boundary Validation — APZ-LAW-NATIVE-001-N01

| Field       | Value                                                                |
| ----------- | -------------------------------------------------------------------- |
| Slice       | N-01                                                                 |
| Status      | **COMPLETE**                                                         |
| Timestamp   | 20260805T191100Z                                                     |
| Mission SoR | [../../apzlaw/SYSTEM-OF-RECORD.md](../../apzlaw/SYSTEM-OF-RECORD.md) |

## Mission SoR (authoritative)

| APZ Law owns                              | APZ Law does not own                     |
| ----------------------------------------- | ---------------------------------------- |
| Policies                                  | General documents (APZ Documents)        |
| Obligations                               | Projects / tickets / time (RI #001–#003) |
| Compliance artefacts (governance objects) | Workflow definitions (APZ Workflow)      |
| Legal artefacts under governance          | Performance insight (APZ Analytics)      |
| Retention requirements                    | Quality / release evidence (APZQEP)      |
| Review / attestation records              | Counsel advice content                   |

Relationships to operational products must be **reference-based**.

## Observed UI / product claims

| Claim                                             | Mission alignment                                                                  |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Firm document register + Upload Document          | **Fail** — presents document SoR                                                   |
| Matter / client / time / task / billing registers | **Fail** — practice SoR hub overlapping Productivity Core                          |
| Trust accounting as product plane                 | **Boundary risk** — may be a governed capability later; currently defines identity |
| Policies / obligations catalogue                  | **Missing** — mission SoR not represented                                          |
| Reference links to Projects / Support / Workflow  | **Missing**                                                                        |

Historical pack `docs/products/law/` still describes legal practice management — conflicts with `apzlaw` mission (L-G15).

## Result

**GAPS IDENTIFIED** — runtime product claims operational and document ownership; mission SoR (governance artefacts) is largely **unrepresented**.

| Gap          | Feeds                                                      |
| ------------ | ---------------------------------------------------------- |
| L-G08, L-G09 | N-03 SoR framing + demote practice registers from identity |
| L-G15        | Docs alignment                                             |
