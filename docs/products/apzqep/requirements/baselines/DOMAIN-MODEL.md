# Baseline Domain Model

| Type                                                         | Responsibility                                                              |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `RequirementBaseline`                                        | Aggregate root with identity, number, metadata, state, and membership       |
| `RequirementBaselineId`                                      | Branded `rbl_*` identifier                                                  |
| `RequirementBaselineNumber`                                  | Positive baseline sequence number, independent of content version numbering |
| `RequirementBaselineName` / `RequirementBaselineDescription` | Bounded, normalized metadata                                                |
| `RequirementBaselineStatus`                                  | `draft`, `locked`, or `archived`                                            |
| `RequirementBaselineItem`                                    | Immutable reference to a Requirement and an exact content version           |

An item contains `requirementId`, `contentVersionId`, `contentVersionNumber`,
`includedAt`, and `includedBy`. It has no Requirement object pointer and no
"latest" selector.

## Integrity fields (Part 3)

The aggregate additionally carries `integrityFingerprint`, `integrityAlgorithm`
(`sha256`), `integritySchemaVersion`, `integrityVerificationStatus`
(`verified` / `not_yet_verified` / `verification_failed` / `unsupported_schema`),
and `integrityVerifiedAt`. These are populated at lock time and refreshed by
`verifyBaselineIntegrity`; see [INTEGRITY.md](./INTEGRITY.md).
