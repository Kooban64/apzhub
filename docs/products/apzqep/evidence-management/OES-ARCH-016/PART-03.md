# APZQEP-OES-ARCH-016 — PART 3

# Lifecycle Model & System of Record

---

## 1. Evidence lifecycle

```text
Draft / Captured
      │
      ▼
Validated ──────────────────────────────┐
      │                                 │
      ▼                                 │
Classified                              │ (reject / quarantine)
      │                                 │
      ▼                                 ▼
Associated ◄── relationships ──► Quarantined / Rejected
      │
      ▼
In Review
      │
      ├──► Approved
      │         │
      │         ▼
      │      Retained (active retention)
      │         │
      │         ├──► Archived
      │         │         │
      │         │         ▼
      │         │      Dispositioned / Disposed
      │         │
      │         └──► Legal Hold (blocks disposition)
      │
      └──► Sealed / Locked (immutable content; cert packs via EvidenceSet)
```

Exact state names **MAY** be refined in Eng Spec; transitions below are normative intent.

### 1.1 Permitted transition intent

| From                    | To                     | Guard (architecture)                                                  |
| ----------------------- | ---------------------- | --------------------------------------------------------------------- |
| Captured                | Validated              | Content present; hash computed; schema/virus policy hooks (Eng Spec)  |
| Validated               | Classified             | Classification assigned                                               |
| Classified              | Associated             | At least ownership context; relationships optional but usual          |
| Associated / Classified | In Review              | Review requested                                                      |
| In Review               | Approved               | Reviewer authorisation                                                |
| In Review               | Rejected / Quarantined | Reviewer authorisation + reason                                       |
| Approved                | Sealed/Locked          | Seal policy or pack lock                                              |
| Approved / Sealed       | Archived               | Retention policy                                                      |
| Archived                | Disposed               | Retention expired **and** no legal hold **and** disposition authority |
| Any active              | Legal Hold             | Hold authority; disposition blocked                                   |

All transitions **SHALL** emit audit + domain events (past-tense names in Eng Spec).

### 1.2 availableActions

Server-computed `availableActions` **SHALL** be the sole UI action authority for Evidence Workbench (same pattern as ADR-0083), permission- and state-filtered.

---

## 2. System of Record rules

### 2.1 Evidence Management owns

- Evidence identity and metadata
- Content locator + integrity metadata
- Lifecycle, retention, disposition, legal hold
- Classification and ownership
- Access policy evaluation for evidence actions
- Collections / Sets
- Relationships discoverable from Evidence side
- Provenance / chain-of-custody records

### 2.2 Consumers own

- Their domain aggregates
- Local **EvidenceReference** copies for UX/performance (non-authoritative)
- Business rules about _when_ to associate evidence

### 2.3 Consumers SHALL NOT

- Store authoritative blobs as SoR
- Invent parallel evidence lifecycles
- Grant evidence access client-side
- Bypass EvidenceService for download/export

### 2.4 Test Execution alignment (ADR-0080)

TE continues to associate **EvidenceReference** (uri/handle + integrity hash). When Evidence Management is live:

- Association **SHOULD** resolve to platform `evidenceId`
- TE URI **MAY** become an opaque handle issued by EvidenceService
- EvidenceAccessPort checks **SHOULD** delegate to Evidence ACL (affirmative allow only)

---

## 3. Integrity model

| Mechanism        | Architectural rule                                                    |
| ---------------- | --------------------------------------------------------------------- |
| Content hashing  | **SHALL** compute hash on accept; algorithm Eng Spec                  |
| Immutability     | Sealed/Locked evidence content **SHALL NOT** change                   |
| Verification     | Retrievers **SHOULD** re-verify hash on download when policy requires |
| Version history  | Pre-seal replacements create EvidenceVersion lineage                  |
| Chain of custody | Provenance events append-only                                         |
| Tamper detection | Hash mismatch → deny content delivery + raise alert event             |
| Sealing          | Explicit seal operation; EvidenceSet seal for packs                   |

---

## 4. Retention & disposition

- Retention **Policy** binds classification / project / regulatory class.
- **Legal hold** overrides disposition.
- Disposition is an audited, authorised act — not silent delete.
- Soft-delete of metadata without disposition record **SHALL NOT** be used for sealed evidence.
