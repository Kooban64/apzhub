# APZQEP-OES-ENG-091A

# PART 3 — Services, Repositories, Storage Contracts, Events & Migration

| Item         | Value                                                               |
| ------------ | ------------------------------------------------------------------- |
| Document     | APZQEP-OES-ENG-091A                                                 |
| Part         | **3 of 5**                                                          |
| Programme    | APZQEP-OES-ENG-091A                                                 |
| Status       | **IMPLEMENTED / AWAITING OWNER ENGINEERING SPECIFICATION DECISION** |
| Architecture | APZQEP-ARCH-016 Part 4 — authoritative                              |

---

## 1. Application layer responsibilities

Application **SHALL**:

1. Authenticate via platform auth
2. Authorise via PermissionService **and** Evidence ACL (fail-closed)
3. Validate command input (Zod/schema at boundary)
4. Load aggregate(s)
5. Invoke Domain behaviour
6. Persist within a transaction (metadata + outbox + audit)
7. Invoke StoragePort for content put/get/delete as required
8. Publish bus events (transactional outbox)
9. Return DTO including `availableActions`
10. Never expose storage locators as public SoR ids or unauthenticated URLs

Transaction boundary: Domain mutation + outbox + audit **SHOULD** share one unit of work. Content put **SHOULD** be ordered so metadata commit fails if content put fails (or compensating delete — Engineering wave detail).

---

## 2. Application services (use-cases)

### 2.1 Command services

| Service / use-case         | Maps to Domain commands                    |
| -------------------------- | ------------------------------------------ |
| `CaptureEvidenceService`   | captureEvidence                            |
| `ValidateEvidenceService`  | validateEvidence                           |
| `ClassifyEvidenceService`  | classifyEvidence                           |
| `AssociateEvidenceService` | associateEvidence                          |
| `ReviewEvidenceService`    | requestReview, approve, reject, quarantine |
| `SealEvidenceService`      | sealEvidence, sealCollectionAsSet          |
| `ReplaceContentService`    | replaceContent                             |
| `LegalHoldService`         | apply/release                              |
| `ArchiveEvidenceService`   | archiveEvidence                            |
| `DisposeEvidenceService`   | disposeEvidence                            |
| `VerifyIntegrityService`   | verifyIntegrity                            |
| `CollectionService`        | create/add/remove                          |
| `AccessGrantService`       | grant/revoke                               |

### 2.2 Query services

| Query                              | Purpose                                               |
| ---------------------------------- | ----------------------------------------------------- |
| `getEvidence`                      | Metadata + availableActions                           |
| `listEvidence`                     | Filtered list (tenant/project/status/classification)  |
| `downloadEvidence`                 | Authz → StoragePort stream; optional verify           |
| `getRelationships`                 | By evidence or by target                              |
| `getCollection` / `getEvidenceSet` | Pack views                                            |
| `getAudit` / `getProvenance`       | History (permission-gated)                            |
| `checkEvidenceAccess`              | Affirmative allow/deny for consumers (TE port target) |
| `searchEvidence`                   | Via Search provider / list filters                    |

### 2.3 `availableActions` computation

Server **SHALL** compute action keys from:

```text
EvidenceStatus × legalHold × PermissionService × ACL grants × retention eligibility
```

Only actions with affirmative allow appear. Absence / indeterminate / error ⇒ omit (deny). Workbench **SHALL** render only returned actions (ADR-0083).

---

## 3. Policy & specialised services

| Service                               | Layer       | Responsibility                                                                    |
| ------------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| `EvidenceAccessPolicyService`         | Application | Evaluate ACL + permissions; **default-deny**; only `outcome === "allowed"` grants |
| `EvidenceRetentionPolicyService`      | Application | Bind classification → retention; evaluate dispose eligibility                     |
| `EvidenceIntegrityApplicationService` | Application | Orchestrate hash verify via StoragePort                                           |
| `EvidenceAuditService`                | Application | Emit platform audit records for access + lifecycle                                |
| `EvidenceLifecycleOrchestrator`       | Application | Multi-step flows (capture→validate optional auto)                                 |

---

## 4. Repository contracts (interfaces — no technology)

### 4.1 `EvidenceRepository`

```text
save(evidence): void
getById(tenantId, id): Evidence | null
list(tenantId, filter, page): Page<Evidence>
nextRevision(evidence): Evidence  # optimistic concurrency on save
```

Behaviour: tenant-scoped; concurrent save with stale revision **SHALL** fail with conflict.

### 4.2 `EvidenceCollectionRepository` / `EvidenceSetRepository`

Save/get/list; Sets are insert-once (immutable).

### 4.3 `EvidenceRelationshipRepository`

```text
save(rel)
listByEvidence(tenantId, evidenceId)
listByTarget(tenantId, targetCapability, targetId)
delete(tenantId, relId)  # soft or hard per policy; audited
```

### 4.4 `EvidenceAccessGrantRepository`

```text
save(grant)
revoke(grantId)
findGrants(tenantId, evidenceId | scope, principal)
```

Evaluation: if no matching allow grant and no broader allow scope ⇒ deny.

### 4.5 `EvidenceAuditRepository` / provenance

Append-only writes; query by evidenceId with authz.

---

## 5. Storage contracts

### 5.1 `StoragePort` (normative interface)

```text
put(tenantId, bytes, mediaType) -> storageLocator
get(tenantId, storageLocator) -> bytes | stream
delete(tenantId, storageLocator) -> void
exists(tenantId, storageLocator) -> boolean
```

Rules:

1. Locators are opaque and connector-internal.
2. Port **SHALL NOT** implement ACL (Application authorises first).
3. Technology **NOT SELECTED** under this OES (ADR-0088).
4. Signed URL issuance, if used, **SHALL** occur only after Application authz and **SHALL** be short-lived.

### 5.2 Logical storage separation

| Store                           | Contents                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Metadata SoR (platform DB)      | Evidence aggregates, relationships, ACL, retention, integrity metadata, locators |
| Content store (via StoragePort) | Raw bytes only                                                                   |
| Search index                    | Derived documents — rebuildable                                                  |
| Consumer DBs                    | EvidenceReference only                                                           |

### 5.3 Logical metadata tables (conceptual — no migrations)

`evidence` · `evidence_version` · `evidence_collection` · `evidence_collection_member` · `evidence_set` · `evidence_set_member` · `evidence_relationship` · `evidence_access_grant` · `evidence_provenance` · `evidence_disposition` · outbox / audit linkage

Integrity controls: tenant columns, unique ids, revision concurrency, indexes on project/status/classification/hash/retain_until/legal_hold.

---

## 6. Event contracts

### 6.1 Envelope

Standard platform envelope: event name (past tense), occurredAt, tenantId, correlationId, causationId, aggregateType, aggregateId, payload schema version ([029](../../../../029-platform-event-sdk-event-bus-event-manifest-specification.md)).

### 6.2 Delivery

At-least-once via transactional outbox. Subscribers **SHALL** be idempotent.

### 6.3 Bus event catalogue (names)

| Bus event                                        | Payload highlights                               |
| ------------------------------------------------ | ------------------------------------------------ |
| `evidence.captured`                              | evidenceId, projectId, source, contentHash       |
| `evidence.validated`                             | evidenceId                                       |
| `evidence.classified`                            | evidenceId, classification                       |
| `evidence.associated`                            | evidenceId, targetCapability, targetId           |
| `evidence.approved` / `rejected` / `quarantined` | evidenceId, actor                                |
| `evidence.sealed`                                | evidenceId, sealedAt                             |
| `evidence.set_sealed`                            | setId, memberIds, sealHash                       |
| `evidence.legal_hold_applied` / `released`       | evidenceId                                       |
| `evidence.archived`                              | evidenceId                                       |
| `evidence.disposed`                              | evidenceId                                       |
| `evidence.integrity_failed`                      | evidenceId                                       |
| `evidence.access_denied`                         | evidenceId, actor, action (when policy requires) |

Modules **SHALL NOT** notify/search/audit directly — subscribe to events / use platform services.

---

## 7. Search publication

EvidenceService **SHALL** register a Search Provider (020) publishing: id, title/summary, classification, status, project, tags — permission-filtered at query time. Index is derived, not SoR.

---

## 8. Audit contract

Every material command and every download/export attempt **SHALL** write platform audit: actor, action, evidenceId, outcome (allowed/denied), correlationId, timestamp. Content bytes **SHALL NOT** be logged.

---

## 9. Integration contracts

### 9.1 Universal consumer rule

Consumers **SHALL** store only:

```text
EvidenceReference { evidenceId, contentHash?, uriOrHandle?, capabilityLocalId? }
```

They **SHALL NOT** store authoritative blobs or evidence lifecycle state.

### 9.2 Test Execution (delivered)

| Contract  | Behaviour                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Associate | TE continues local EvidenceReference; **SHOULD** call `associateEvidence` / resolve platform evidenceId when EvidenceService live                    |
| Access    | `EvidenceAccessPort.check` **SHOULD** delegate to `checkEvidenceAccess`; only `allowed` proceeds (L-02)                                              |
| Cutover   | Dual-path coexistence allowed: TE fail-closed local check until delegation wired in a **separate** TE engineering programme — **not** under this OES |

This OES **SHALL NOT** modify TE packages.

### 9.3 Future consumers

| Consumer                     | Integration                                             |
| ---------------------------- | ------------------------------------------------------- |
| Test Runs                    | Reference collections/sets for run packs                |
| Defects                      | Relationships `defect` ↔ evidence                       |
| Requirements / Plans / Specs | Optional relationships                                  |
| Reporting / Analytics        | Authorised read/query APIs                              |
| AI                           | Read suggestions only; never mutate SoR authoritatively |
| Compliance                   | Sealed EvidenceSet + audit export APIs                  |

---

## 10. Migration strategy (introduction without impacting TE 1.0.1)

1. **Phase M0 — Spec only (this programme):** no runtime change.
2. **Phase M1 — Scaffold (future ENG-110A):** empty package; no gateway routes affecting TE.
3. **Phase M2 — Parallel SoR:** Evidence APIs live; TE continues existing EvidenceReference behaviour.
4. **Phase M3 — Delegation:** TE EvidenceAccessPort optionally delegates to Evidence ACL (separate TE change programme).
5. **Phase M4 — Hardening:** require platform evidenceId on new associations; legacy refs remain readable.

Rules:

- No breaking change to TE 1.0.1 public contracts without TE programme.
- Feature flags for Evidence routes.
- Rollback = disable Evidence routes; TE unaffected.

---

## STOP

```text
PART-03 COMPLETE — services, ports, events, migration locked
NO PRODUCTION CODE
STORAGE TECHNOLOGY NOT SELECTED
```
