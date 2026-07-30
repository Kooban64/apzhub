# APZQEP-OES-ENG-091A

# PART 2 — Domain Engineering Model (Aggregates, Lifecycle, Integrity, Policies)

| Item         | Value                                                               |
| ------------ | ------------------------------------------------------------------- |
| Document     | APZQEP-OES-ENG-091A                                                 |
| Part         | **2 of 5**                                                          |
| Programme    | APZQEP-OES-ENG-091A                                                 |
| Status       | **IMPLEMENTED / AWAITING OWNER ENGINEERING SPECIFICATION DECISION** |
| Architecture | APZQEP-ARCH-016 Parts 2–3 — authoritative                           |

---

## 1. Aggregate roots

### 1.1 `Evidence` (primary root)

Transactional consistency boundary for one evidence item.

#### Required properties

| Property                    | Type kind                   | Engineering requirement                             |
| --------------------------- | --------------------------- | --------------------------------------------------- |
| `id`                        | Platform ID                 | Globally unique within tenant; opaque to UI         |
| `tenantId`                  | Platform ID                 | Absolute isolation                                  |
| `projectId` / `workspaceId` | Platform ID                 | Ownership scope                                     |
| `status`                    | `EvidenceStatus` VO         | Canonical states only (Appendix B)                  |
| `classification`            | `EvidenceClassification` VO | Required after classify                             |
| `source`                    | `EvidenceSource` VO         | Capture provenance                                  |
| `content`                   | `EvidenceContent` VO        | Media type, size, hash, storage locator             |
| `integrity`                 | `EvidenceIntegrity` VO      | Algorithm, hash, verification, seal flags           |
| `ownership`                 | `EvidenceOwnership` VO      | Creating actor, responsible owner                   |
| `retention`                 | `EvidenceRetention` VO      | Class, retain-until, legalHold                      |
| `version`                   | Integer                     | Content lineage version (≥ 1 when content attached) |
| `revision`                  | Integer                     | Optimistic concurrency                              |
| `sealedAt` / `sealedBy`     | Optional                    | Set on seal                                         |
| `disposition`               | Optional entity             | Present when disposed                               |
| `history`                   | Append-only                 | Material commands                                   |
| Audit stamps                | Timestamps + actor ids      | Standard platform fields                            |

#### Entities / value objects owned by Evidence

| Name                      | Kind   | Notes                                                                                                  |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `EvidenceContent`         | VO     | `mediaType`, `byteSize`, `contentHash`, `hashAlgorithm`, `storageLocator` (opaque)                     |
| `EvidenceIntegrity`       | VO     | `hashAlgorithm`, `contentHash`, `lastVerifiedAt`, `verificationState`, `sealed`                        |
| `EvidenceClassification`  | VO     | Category + sensitivity (e.g. `screenshot`, `log`, `report`, `pii_bearing`)                             |
| `EvidenceSource`          | VO     | `manual_upload` \| `automation` \| `external_ingestion` \| `system_export` + optional source system id |
| `EvidenceOwnership`       | VO     | tenant, project/workspace, createdBy, ownerId                                                          |
| `EvidenceRetention`       | VO     | retentionClass, retainUntil, legalHold:boolean, holdReason?                                            |
| `EvidenceVersion`         | Entity | Prior content snapshots (pre-seal replacements); immutable rows                                        |
| `EvidenceDisposition`     | Entity | dispositionedAt/By, method, authority, reason — terminal                                               |
| `EvidenceProvenanceEvent` | Entity | Append-only custody events                                                                             |

### 1.2 `EvidenceCollection`

Mutable grouping aggregate.

| Property                      | Requirement                                  |
| ----------------------------- | -------------------------------------------- |
| `id`, `tenantId`, `projectId` | Required                                     |
| `name`, `purpose`             | Required                                     |
| `memberEvidenceIds`           | Ordered/set membership; changes audited      |
| `status`                      | `open` \| `ready_to_seal` \| `sealed_as_set` |
| `revision`                    | Optimistic concurrency                       |

Converting to Set **SHALL** create an `EvidenceSet` and freeze membership (ADR-0090 / ADR-0091).

### 1.3 `EvidenceSet`

Immutable sealed snapshot.

| Property                      | Requirement                                          |
| ----------------------------- | ---------------------------------------------------- |
| `id`, `tenantId`, `projectId` | Required                                             |
| `sourceCollectionId`          | Required                                             |
| `memberEvidenceIds`           | Immutable after create                               |
| `sealHash`                    | Hash over ordered membership + member content hashes |
| `sealedAt` / `sealedBy`       | Required                                             |
| `purpose`                     | e.g. certification pack                              |

Membership mutation after seal **SHALL** throw Domain conflict.

### 1.4 `EvidenceRelationship`

Association aggregate (or entity managed by EvidenceService with own consistency).

| Property                  | Requirement                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| `id`, `tenantId`          | Required                                                                |
| `evidenceId`              | Required                                                                |
| `targetCapability`        | e.g. `test_execution`, `requirement`, `defect`, `test_plan`, `test_run` |
| `targetId`                | Platform id in target capability                                        |
| `relationType`            | e.g. `supports`, `produced_by`, `attached_to`, `derived_from`           |
| `createdBy` / `createdAt` | Required                                                                |

### 1.5 `EvidencePolicy` / ACL grant

Policy definitions and grants are platform-owned configuration aggregates:

- Retention policies (classification → retention class)
- Access grants: `(principal, evidenceId|scope, action, effect)` where effect must be explicit `allow` to permit
- Missing grant **SHALL** deny (ADR-0089)

---

## 2. Domain commands (normative catalogue)

| Command                                                         | Effect                                  | Guards (Domain summary)                                   |
| --------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------- |
| `captureEvidence`                                               | → `captured` + content attach           | Tenant/project; content present; hash computed            |
| `validateEvidence`                                              | → `validated`                           | Content + hash present                                    |
| `classifyEvidence`                                              | → `classified`                          | Classification assigned                                   |
| `associateEvidence`                                             | Create relationship; may → `associated` | Target ids valid shape; ownership context                 |
| `requestReview`                                                 | → `in_review`                           | Classified (or associated)                                |
| `approveEvidence`                                               | → `approved`                            | Reviewer authority (Application enforces)                 |
| `rejectEvidence`                                                | → `rejected`                            | Reason required                                           |
| `quarantineEvidence`                                            | → `quarantined`                         | Reason required                                           |
| `sealEvidence`                                                  | → `sealed`; content immutable           | Approved (or policy); hash present                        |
| `replaceContent`                                                | New `EvidenceVersion`; update content   | **Not** sealed/locked; re-hash                            |
| `applyLegalHold`                                                | `legalHold=true`                        | Hold authority; reason                                    |
| `releaseLegalHold`                                              | `legalHold=false`                       | Hold authority                                            |
| `archiveEvidence`                                               | → `archived`                            | Retention policy allows                                   |
| `disposeEvidence`                                               | → `disposed` + Disposition              | Retention expired **and** no legal hold **and** authority |
| `verifyIntegrity`                                               | Update verification state               | Recompute/compare hash via port result                    |
| `createCollection` / `addToCollection` / `removeFromCollection` | Membership                              | Collection open                                           |
| `sealCollectionAsSet`                                           | Create `EvidenceSet`                    | Members exist; all sealable per policy                    |
| `grantAccess` / `revokeAccess`                                  | ACL mutation                            | Admin authority (Application)                             |

Commands **SHALL** be explicit. Silent status field writes **SHALL NOT** exist.

---

## 3. Lifecycle (engineering)

Canonical states: `captured` · `validated` · `classified` · `associated` · `in_review` · `approved` · `rejected` · `quarantined` · `sealed` · `retained` · `archived` · `disposed`.

`legalHold` is a **flag** that may apply in active states; it is not a replacement for status but **SHALL** block disposition (and **SHOULD** block content mutation when policy requires).

### 3.1 Engineering rules

1. Transitions **SHALL** occur only via Domain commands.
2. History **SHALL** append for every material command.
3. After `sealed`, content bytes, contentHash, hashAlgorithm, and storageLocator **SHALL NOT** change.
4. After `disposed`, all content delivery **SHALL** deny; metadata may remain for audit.
5. `availableActions` **SHALL** be computed in Application from state × ACL × policy × legalHold (ADR-0083 pattern).

### 3.2 Transition matrix

See Appendix B (normative).

---

## 4. Integrity requirements (Domain)

| Requirement     | Engineering rule                                                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hash on accept  | `captureEvidence` / `replaceContent` **SHALL** set `contentHash` using **SHA-256** (`hashAlgorithm = "sha256"`) over raw content bytes                         |
| Verification    | `verifyIntegrity` compares StoragePort-read bytes hash to stored hash; mismatch → `verificationState=failed` + Domain event; delivery **SHALL** deny on failed |
| Sealing         | `sealEvidence` / `sealCollectionAsSet` set immutable flags; seal emits provenance                                                                              |
| Version history | Pre-seal replace creates `EvidenceVersion` retaining prior locator + hash                                                                                      |
| Provenance      | Append-only custody events for capture, transfer, seal, export, dispose                                                                                        |
| Tamper          | Hash mismatch is hard fail for download/export                                                                                                                 |

Algorithm commitment: **SHA-256** is the Eng Spec default (architecture deferred selection to Eng Spec). Alternative algorithms require ADR.

---

## 5. Domain invariants (normative)

See Appendix C. Highlights:

1. Every Evidence has `tenantId` and ownership scope.
2. Content attached ⇒ hash present.
3. Sealed ⇒ content immutable.
4. Disposed ⇒ no content delivery.
5. Legal hold ⇒ disposition forbidden.
6. Access decisions affirmative-only (enforced in Application; Domain may refuse sealed mutations regardless).
7. Relationships never embed blobs.
8. EvidenceSet membership immutable after seal.

---

## 6. Domain policies

| Policy            | Rule                                                               |
| ----------------- | ------------------------------------------------------------------ |
| Retention binding | Classification + project policy → retentionClass / retainUntil     |
| Seal eligibility  | Approved (or explicit admin seal policy) before seal               |
| Quarantine        | Rejected/quarantined narrows download actions via availableActions |
| Dispose           | Requires expired retention, no hold, disposition permission        |

---

## 7. Justified Domain services

| Service                    | Responsibility                                        |
| -------------------------- | ----------------------------------------------------- |
| `EvidenceIntegrityService` | Hash computation helpers (pure), seal hash for sets   |
| `EvidenceLifecycleService` | Transition guard helpers shared across commands       |
| `EvidenceRetentionService` | Pure evaluation of retain-until / dispose eligibility |

No I/O inside Domain services.

---

## 8. Domain error model

| Error                 | When                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| `validation`          | Missing/invalid fields                                               |
| `precondition_failed` | Illegal transition / missing hash                                    |
| `conflict`            | Revision mismatch / sealed mutation                                  |
| `forbidden`           | Domain-level sealed/disposed refusal (Application also enforces ACL) |
| `integrity_failed`    | Hash mismatch                                                        |

---

## 9. Domain events (raised — not published)

| Event                                                           | When            |
| --------------------------------------------------------------- | --------------- |
| `EvidenceCaptured`                                              | capture         |
| `EvidenceValidated`                                             | validate        |
| `EvidenceClassified`                                            | classify        |
| `EvidenceAssociated`                                            | associate       |
| `EvidenceReviewRequested`                                       | requestReview   |
| `EvidenceApproved` / `EvidenceRejected` / `EvidenceQuarantined` | review outcomes |
| `EvidenceSealed`                                                | seal            |
| `EvidenceContentReplaced`                                       | replace         |
| `EvidenceLegalHoldApplied` / `Released`                         | hold            |
| `EvidenceArchived`                                              | archive         |
| `EvidenceDisposed`                                              | dispose         |
| `EvidenceIntegrityVerified` / `EvidenceIntegrityFailed`         | verify          |
| `EvidenceCollectionChanged`                                     | membership      |
| `EvidenceSetSealed`                                             | set seal        |
| `EvidenceAccessGranted` / `Revoked`                             | ACL             |

Application maps these to bus events (Part 3).

---

## 10. AI boundary (Domain)

AI **SHALL NOT** authoritatively capture, approve, seal, dispose, or grant access. Suggestions are Application/Workbench concerns only.

---

## STOP

```text
PART-02 COMPLETE — Domain contracts locked
NO PRODUCTION CODE
```
