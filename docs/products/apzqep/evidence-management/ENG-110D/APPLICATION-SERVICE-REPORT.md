# Application Service Report — APZQEP-ENG-110D

| Field         | Value                               |
| ------------- | ----------------------------------- |
| Factory       | `createEvidenceApplicationServices` |
| Commands      | `EvidenceCommandService`            |
| Queries       | `EvidenceQueryService`              |
| Status marker | `implemented-eng-110d`              |

## Command use-cases

Capture · Validate · Classify · Update Metadata · Associate · Review (request/approve/reject/quarantine) · Seal · Version (replace content) · Legal Hold apply/release · Archive · Dispose · Verify Integrity · Collection create/add/remove · Create Evidence Set · Manage Relationships · Grant/Revoke Access (persist only)

## Query use-cases

getEvidence · listEvidence · searchEvidence · downloadEvidence · getRelationships · getCollection · getEvidenceSet · getAudit · getProvenance · checkEvidenceAccess (`evaluation: deferred`) · getAvailableActions (lifecycle-only) · getVersions

## Rules

- Orchestration only — Domain owns business rules.
- ACL / PermissionService evaluation deferred to ENG-110E.
- Domain events collected, never published.
