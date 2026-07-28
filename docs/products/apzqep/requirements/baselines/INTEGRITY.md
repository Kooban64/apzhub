# Integrity Fingerprinting (Part 3)

## Empty-lock rule

**A baseline cannot be locked with zero content-version members.** This is
enforced in three independent layers so no code path can bypass it:

1. Domain — `computeBaselineIntegrityFingerprint` throws `QepBaselineInvalidStateError`
   for an empty membership set; `lockRequirementBaseline`/`transitionRequirementBaseline`
   require the caller to supply canonical membership integrity inputs derived from
   real items.
2. Application — `lockBaseline` loads the baseline's items before locking and
   never calls the domain lock function with an empty membership list.
3. Repository — both the in-memory and PostgreSQL `lockBaseline` implementations
   independently reject locking a baseline whose stored `items.length === 0`.

## Fingerprint

`computeBaselineIntegrityFingerprint` builds a canonical, order-independent
payload from each member's `requirementId`, `contentVersionId`,
`contentVersionNumber`, and `snapshotHash` (sorted by requirement id then
content-version id), prefixed with the schema version and baseline id, and
hashes it with SHA-256 (`REQUIREMENT_BASELINE_INTEGRITY_ALGORITHM`). Every
membership item must carry a non-blank `snapshotHash` — sourced from the
referenced Requirement Content Version's own integrity hash — or the computation
fails with `QepBaselineIntegrityError`.

The result — `algorithm`, `schemaVersion`, `fingerprint`, `verificationStatus`,
and (on verification) `verifiedAt` — is stored on the baseline aggregate and
persisted by the repository at lock time.

## Re-verification

`verifyBaselineIntegrity` (application command, permission
`qep.requirements.baselines.verify`) is available for `locked` or `archived`
baselines. It reloads current content-version snapshots, recomputes the
membership integrity inputs, and compares the recomputed fingerprint against the
stored one:

- Match → `verificationStatus` is set to `verified` with a fresh `verifiedAt`,
  and a `BaselineIntegrityVerified` domain event and audit entry are recorded.
- Mismatch → the command throws `QepBaselineIntegrityError`, records
  `verificationStatus: verification_failed` via `recordIntegrityVerification`,
  and audits `qep.requirement_baseline.integrity_verification_failed`. The stored
  fingerprint and membership are never mutated by a failed verification.
- Unsupported schema version → `unsupported_schema`, without attempting to
  recompute or draw a tamper conclusion.

Verifying a `draft` baseline is rejected (`QepBaselineInvalidStateError`) — drafts
have no fingerprint to verify. Re-verification never re-opens a draft and never
alters membership; it only reports and records verification status.
