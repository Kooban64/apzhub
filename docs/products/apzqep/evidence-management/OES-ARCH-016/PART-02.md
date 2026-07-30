# APZQEP-OES-ARCH-016 — PART 2

# Context, Domain Model & Aggregate Design

---

## 1. Context diagram

```text
                         +------------------------------+
                         |      APZHUB Platform         |
                         | AuthN AuthZ Audit Events     |
                         | Search Gateway Preferences   |
                         +--------------+---------------+
                                        |
        +-------------------------------+-------------------------------+
        |                               |                               |
        v                               v                               v
+------------------+     +-------------------------+     +------------------+
| Frozen / delivered|     | Evidence Management     |     | Future QEP       |
| Requirements      |     | * Evidence SoR          |     | Test Runs        |
| Traceability      | ref | Metadata + lifecycle    | ref | Defects          |
| Verification      |---->| Access + retention      |<----| Reporting        |
| Specs / Plans     |     | Integrity + provenance  |     | Analytics / AI   |
| Test Execution    |---->|                         |     | Compliance       |
| (EvidenceRef)     |     +------------+------------+     +------------------+
+------------------+                   |
                                       v
                            +----------------------+
                            | Storage Abstraction  |
                            | (content bytes only) |
                            | Technology undecided |
                            +----------------------+
```

Consumers **SHALL** call Platform `EvidenceService` (or published contracts) — never storage engines or connectors directly ([008](../../../../008-modules-connectors.md) / [009](../../../../009-platform-service-layer.md)).

---

## 2. Core domain concepts

| Concept                    | Meaning                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Evidence**               | Aggregate root — one governed evidence item (identity, metadata, lifecycle, integrity, access policy binding)       |
| **EvidenceContent**        | Logical content descriptor (media type, size, content hash, storage locator handle) — bytes live behind StoragePort |
| **EvidenceReference**      | Consumer-side pointer (capability + local id + evidenceId + optional integrity hash echo) — **not** SoR for content |
| **EvidenceCollection**     | Named grouping of evidence items for a purpose (e.g. execution pack, certification pack)                            |
| **EvidenceSet**            | Immutable snapshot of a collection at seal/lock time (certification-grade)                                          |
| **EvidenceSource**         | Provenance of capture (manual upload, automation, external ingestion, system export)                                |
| **EvidenceRelationship**   | Typed link Evidence ↔ domain object (execution, requirement, defect, plan, run, …) or Evidence ↔ Evidence           |
| **EvidenceClassification** | Sensitivity / category labels (e.g. screenshot, log, report, PII-bearing)                                           |
| **EvidenceIntegrity**      | Hash algorithm, hash value, verification state, seal state                                                          |
| **EvidenceLifecycle**      | State machine (see PART-03)                                                                                         |
| **EvidenceRetention**      | Retention class, retain-until, legal hold flag                                                                      |
| **EvidenceDisposition**    | Approved disposal / destruction record                                                                              |
| **EvidenceVersion**        | Version lineage for replaceable (pre-seal) content revisions                                                        |
| **EvidenceAudit**          | Immutable audit of access and lifecycle decisions (platform Audit + capability audit)                               |
| **EvidencePolicy**         | Retention / classification / access policy definitions                                                              |
| **EvidenceAccess**         | Authorisation decision binding (actor, action, outcome) — default-deny                                              |
| **EvidenceOwnership**      | Tenant, owning project/workspace, creating actor, responsible owner                                                 |
| **EvidenceProvenance**     | Chain-of-custody events (created, transferred, sealed, exported)                                                    |

---

## 3. Aggregate design

### 3.1 Evidence (root)

**Invariant highlights:**

- Globally unique platform evidence id within tenant.
- Always has tenantId, owner context, classification, integrity hash (once content attached).
- Content bytes **SHALL NOT** be stored in platform metadata SoR tables as opaque blobs without StoragePort.
- After **Sealed** / **Locked**, content and critical integrity fields are immutable.
- Access decisions **SHALL** be affirmative; absence of grant **SHALL** deny (extends L-02 principle).

### 3.2 EvidenceCollection

Mutable grouping until converted to EvidenceSet. Membership changes audited.

### 3.3 EvidenceSet

Immutable membership + seal metadata. Used for certification packs (M09 lock-on-certify).

### 3.4 EvidenceRelationship

Separate association records (or collection within Evidence) keyed by `(evidenceId, targetCapability, targetId, relationType)`. Consumers **MAY** also store local EvidenceReference for UX; SoR association for discovery **SHOULD** be queryable via EvidenceService.

---

## 4. Ubiquitous language rules

| Term              | Use                                                      |
| ----------------- | -------------------------------------------------------- |
| Evidence          | Platform SoR item                                        |
| EvidenceReference | Non-SoR pointer in other capabilities                    |
| Attachment        | Avoid as SoR synonym — prefer Evidence                   |
| Document          | Reserved for Documents product — Evidence is QE-governed |
| File              | Implementation detail of content — not aggregate name    |

---

## 5. Identity

- Platform evidence ids: opaque global ids (ULID/UUID — Eng Spec).
- Backend storage object keys: connector-internal; never exposed as user-facing SoR ids.
- Integrity hash: content-addressing aid; **SHALL NOT** alone authorize access.
