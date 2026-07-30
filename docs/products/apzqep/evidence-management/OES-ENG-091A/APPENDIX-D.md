# APZQEP-OES-ENG-091A — APPENDIX D — Contract Catalogue

## Commands

`captureEvidence` · `validateEvidence` · `classifyEvidence` · `associateEvidence` · `requestReview` · `approveEvidence` · `rejectEvidence` · `quarantineEvidence` · `sealEvidence` · `replaceContent` · `applyLegalHold` · `releaseLegalHold` · `archiveEvidence` · `disposeEvidence` · `verifyIntegrity` · `createCollection` · `addToCollection` · `removeFromCollection` · `sealCollectionAsSet` · `grantAccess` · `revokeAccess`

## Queries

`getEvidence` · `listEvidence` · `downloadEvidence` · `getRelationships` · `getCollection` · `getEvidenceSet` · `getAudit` · `getProvenance` · `checkEvidenceAccess` · `searchEvidence` · `getAvailableActions`

## Ports / repositories

`EvidenceRepository` · `EvidenceCollectionRepository` · `EvidenceSetRepository` · `EvidenceRelationshipRepository` · `EvidenceAccessGrantRepository` · `EvidenceAuditRepository` · `StoragePort`

## Permissions

See PART-04 §2.1 (`qep.evidence.*`).

## Bus events

See PART-03 §6.3 (`evidence.*`).

## API base

`/api/v1/qep/evidence` — resource table in PART-04 §1.2.

## Error categories

`validation` · `unauthenticated` · `forbidden` · `not_found` · `conflict` · `precondition_failed` · `integrity_failed` · `gone`

## Access-check outcome

```text
allowed | denied
```

Only `allowed` grants. All other results deny.
