# APZQEP-OES-ARCH-016 — PART 4

# Security, Storage, Integration & External Interfaces

| Item      | Value               |
| --------- | ------------------- |
| Document  | APZQEP-OES-ARCH-016 |
| Part      | **4 of 5**          |
| Programme | APZQEP-ARCH-016     |

---

## 1. Layer diagram (architectural)

```text
Workbench (presentation — Evidence explorer / preview)
        │
        ▼
API Gateway / Platform HTTP boundary
        │
        ▼
EvidenceService Application
  (authz · ACL · availableActions · validation · audit · events · retention)
        │
        ▼
Domain (Evidence · Collection · Set · Relationship · Policy)
        │
        ▼
Infrastructure
  ├── Metadata persistence (platform PostgreSQL — metadata SoR)
  ├── StoragePort (content bytes — technology undecided)
  ├── Outbox / domain events
  ├── Search publication (derived index — not SoR)
  └── Consumer contracts (TE EvidenceAccessPort delegation target)
```

---

## 2. Security architecture

Extends the verified fail-closed model from L-02 remediation / CERT-002.

### 2.1 Principles

| Principle              | Rule                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| Default-deny           | Only affirmative `outcome === allowed` grants access                                             |
| Missing check          | Absence of policy / ACL grant / checker **SHALL** deny                                           |
| Indeterminate / error  | **SHALL** deny                                                                                   |
| Tenant isolation       | Cross-tenant evidence access **SHALL** be impossible by construction                             |
| Fine-grained ACL       | Actions: view metadata, download, associate, classify, review, seal, export, dispose, administer |
| Policy-based authz     | PermissionService + evidence-scoped ACL / ownership / classification policies                    |
| Server authority       | Workbench never decides access; `availableActions` is sole UI action authority                   |
| Secure retrieval       | Downloads via authorised EvidenceService paths only — no direct storage URLs as SoR access       |
| Retention / legal hold | Disposition blocked under hold; hold changes audited                                             |

### 2.2 Audit

Every material access and lifecycle transition **SHALL** be audited (who, what, when, correlation id, outcome). Content hashes **SHALL NOT** appear in logs in ways that leak sensitive content; metadata audit is sufficient for integrity events.

### 2.3 Alignment with Test Execution

When Evidence Management is live, TE `EvidenceAccessPort` **SHOULD** delegate to Evidence ACL. Until then, TE continues its own fail-closed baseline (1.0.1). ARCH-016 does **not** modify TE packages.

---

## 3. Storage architecture (abstraction only)

### 3.1 Separation

| Concern             | Owner                                 | Notes                                                                      |
| ------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| Evidence metadata   | Evidence Management SoR (platform DB) | Identity, lifecycle, ACL bindings, retention, integrity metadata, locators |
| Content bytes       | StoragePort / connector               | Opaque locator; technology **not** selected under ARCH-016                 |
| Search index        | Derived (020)                         | Rebuildable; never authoritative                                           |
| Consumer references | Consumer capability DB                | EvidenceReference only                                                     |

### 3.2 StoragePort responsibilities (architectural)

- Put / get / delete (disposition) content by locator
- Optional signed short-lived retrieval tokens issued **after** EvidenceService authz
- No business rules in storage adapter

### 3.3 Explicit non-decision

No commitment to S3, MinIO, filesystem, or database BLOBs under this programme. Eng Spec / later ADR selects technology against NFR and host coexistence constraints.

---

## 4. Integration architecture

### 4.1 Integration pattern

```text
Consumer capability
  → Platform EvidenceService (associate / resolve / checkAccess / download)
    → Domain + ACL
      → StoragePort (bytes) | Metadata store
```

Consumers **SHALL NOT** call StoragePort or connectors directly ([008](../../../../008-modules-connectors.md) / [009](../../../../009-platform-service-layer.md)).

### 4.2 Consumer integration matrix

| Consumer                                     | Integration mode                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| Test Execution                               | EvidenceReference + access check; optional future `evidenceId` resolution     |
| Requirements / Plans / Specs / Trace / Verif | Optional relationship links; no content ownership                             |
| Test Runs (future)                           | Reference packs / collections for run results                                 |
| Defects (future)                             | Defect ↔ Evidence relationships                                               |
| Reporting / Analytics / AI (future)          | Read via authorised APIs; AI never authoritative for integrity or disposition |
| Compliance (future)                          | EvidenceSet / sealed packs + audit export                                     |

### 4.3 Events (conceptual)

Evidence Management **publishes** past-tense domain events (created, validated, classified, associated, approved, sealed, archived, dispositioned, access-denied where policy requires). Subscribers (search, activity, notify) consume — modules do not notify directly ([021](../../../../021-notification-activity-attention-management-framework.md) / [029](../../../../029-platform-event-sdk-event-bus-event-manifest-specification.md)).

---

## 5. External interfaces (logical — not REST design)

| Interface            | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| Upload / capture     | Accept content + metadata; compute hash; enter lifecycle      |
| Retrieve metadata    | Authorised metadata read                                      |
| Download / stream    | Authorised content delivery with integrity verification hooks |
| Associate / relate   | Bind Evidence ↔ domain object or Evidence ↔ Evidence          |
| Collection / Set ops | Group, seal, lock packs                                       |
| Export               | Controlled export packages (audit + ACL)                      |
| Access check         | Affirmative allow/deny for consumers (TE port target)         |
| Audit query          | Reconstruct chain of custody / access (permission-gated)      |
| Reporting / AI read  | Bounded read models; never mutate SoR via AI                  |

OpenAPI paths, DTOs, and error envelopes are **Eng Spec** concerns.

---

## 6. Persistence (conceptual — no migrations)

Persist conceptually:

- Evidence + EvidenceVersion + integrity fields
- EvidenceContent locator metadata
- Collections / Sets / membership
- Relationships
- Policies / ACL grants
- Retention / legal hold / disposition records
- Provenance / append-only history linkage

Integrity controls: tenant scoping, optimistic concurrency on aggregate revision, unique evidence ids, indexes for owner/project/classification/lifecycle/hash.
