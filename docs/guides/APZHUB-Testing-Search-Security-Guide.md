# Testing Search Security Guide

**Milestone:** APZSEARCH-013

## Isolation

Preserve tenant isolation, organisation isolation, permissions, classifications, and certification / release / evidence **visibility** metadata. Never broaden who can discover restricted artefacts.

## Classification (no downgrade)

- Default context classification: **confidential** (fail-closed).
- Map Testing severity / status hints conservatively into Search `public|internal|confidential|restricted`.
- `neverDowngradeClassification` enforces rank: public < internal < confidential < restricted.
- Absent classification on draft → reject.

## Allowlist

`TESTING_SEARCH_SAFE_METADATA_KEYS` + value scanners reject:

- `storageRef` / storage keys / signed URLs
- checksum hex / payload fingerprints / bytesBase64
- secrets, tokens, credentials, passwords
- provider/pipeline internals

## Validation fail-closed

Reject when tenant missing, classification missing, permission metadata missing, unsupported entity, binary/report content present, or unsafe metadata detected.

## Evidence / reports / automation

- Evidence: presence flags and titles only.
- Reports: `ReportGenerationMetadata` / template catalogue only — never rendered bodies.
- Imports/automation: never payload blobs or CI credentials.
