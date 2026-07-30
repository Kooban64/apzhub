# APZQEP-OES-ARCH-016 — PART 5

# Workbench Vision, NFRs, Boundaries, Registers & Acceptance Criteria

| Item      | Value               |
| --------- | ------------------- |
| Document  | APZQEP-OES-ARCH-016 |
| Part      | **5 of 5**          |
| Programme | APZQEP-ARCH-016     |

---

## 1. Workbench architecture vision (no UI implementation)

Future Evidence Workbench surfaces (presentation only):

| Surface                | Purpose                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| Evidence explorer      | Browse / list evidence by project, classification, lifecycle, source |
| Search & filter        | Unified Search provider registration (020); permission-filtered      |
| Preview                | Safe preview for supported media types; deny when policy blocks      |
| Lifecycle timeline     | State history + provenance events                                    |
| Audit history          | Access and decision reconstruction (gated)                           |
| Integrity status       | Hash / seal / verification state                                     |
| Relationship graph     | Links to executions, requirements, defects, plans, runs, packs       |
| Access status          | Effective permissions / ACL summary for current actor                |
| Collection / Set views | Pack membership; sealed set inspection                               |

Rules:

- Workbench **SHALL NOT** own business rules or access decisions.
- All executable controls from server `availableActions`.
- Tokens / Design System only ([006](../../../../006-design-system.md) / [028](../../../../028-ui-component-sdk-design-system-sdk-component-manifest-specification.md)).
- No hardcoded modules in shell ([017](../../../../017-navigation-framework-workspace-navigation-architecture.md)).

---

## 2. Future capability boundaries

| Capability                   | Evidence Management owns                             | Boundary                                             |
| ---------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| Test Execution               | SoR for evidence content & lifecycle                 | TE keeps EvidenceReference (ADR-0080 / ADR-0087)     |
| Test Runs                    | Packs / associations for run evidence                | Runs do not store authoritative blobs                |
| Defects                      | Defect–evidence relationships                        | Defect lifecycle elsewhere                           |
| Requirements / Plans / Specs | Optional relationships                               | No evidence SoR in those capabilities                |
| Reporting / Dashboards       | Read models over EvidenceService                     | Aggregations are not SoR                             |
| Analytics                    | Derived analysis                                     | Never mutate integrity/retention                     |
| AI                           | Assistive summarisation / classification suggestions | Non-authoritative; human/policy confirms             |
| Compliance                   | Sealed EvidenceSets + audit export                   | Legal hold / disposition governed here               |
| Documents product            | —                                                    | Distinct product; QE Evidence is not DMS replacement |

---

## 3. AI boundary (architectural)

**Permitted (future):** suggest classification, summarise content (where authorised), flag missing associations, highlight integrity anomalies, assist search ranking explanations.

**Prohibited:** fabricate evidence, silent mutation, bypass ACL, approve/seal/dispose without authorised action, exfiltrate to unapproved providers, conceal uncertainty.

No AI implementation under ARCH-016.

---

## 4. Non-functional requirements

| Concern        | Expectation                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Scalability    | Partition by tenant; metadata hot path separate from large binary IO                                     |
| Performance    | Metadata queries fast; download streaming; hash verify on policy                                         |
| Security       | Default-deny; TLS; least privilege; no secrets in repo/logs                                              |
| Availability   | Metadata SoR high availability; storage failure degrades download, not identity                          |
| Durability     | Content + metadata durability class defined in Eng Spec; seals require durable storage                   |
| Recoverability | Backup/restore of metadata + content locators; rebuild search                                            |
| Observability  | Metrics, logs, traces, health on EvidenceService + StoragePort ([014](../../../../014-observability.md)) |
| Auditability   | Reconstruct custody and access                                                                           |
| Compliance     | Retention, legal hold, disposition, export for audit                                                     |

---

## 5. Assumptions register

| ID   | Assumption                                                                             |
| ---- | -------------------------------------------------------------------------------------- |
| A-01 | Platform PermissionService remains sole platform authz authority                       |
| A-02 | Storage technology will be selected in Eng Spec / later ADR without changing SoR model |
| A-03 | Test Execution 1.0.1 EvidenceReference remains valid during transition                 |
| A-04 | Legal hold is in product scope for regulated customers                                 |
| A-05 | Search index is derived and rebuildable                                                |
| A-06 | Owner will separately authorise Eng Spec after Architecture Acceptance                 |
| A-07 | Lifecycle Standard v1.0 remains unchanged under this programme                         |

---

## 6. Risks register

| ID   | Risk                                | Mitigation (architecture)                                                  |
| ---- | ----------------------------------- | -------------------------------------------------------------------------- |
| R-01 | Consumers continue to store blobs   | Hard SoR rule + ADR-0087; review gates in Eng Spec                         |
| R-02 | Storage tech choice delays delivery | Abstraction now; decision deferred                                         |
| R-03 | ACL complexity                      | Start with ownership + project + classification policies; extend carefully |
| R-04 | TE dual path during migration       | Document coexistence; EvidenceAccessPort delegation when ready             |
| R-05 | Over-governance of evidence UX      | availableActions + 90/10 rule — keep user value primary                    |
| R-06 | Legal hold misuse                   | Explicit authority + audit + disposition block only                        |

---

## 7. Dependency register

| Dependency                               | Type      | Notes               |
| ---------------------------------------- | --------- | ------------------- |
| Document 000 / APZQEP Constitution       | Governing | Compliance          |
| Lifecycle Standard v1.0                  | Governing | Use as-is           |
| ADR-0080 / TE 1.0.1                      | Delivered | Reinforced          |
| Platform authz / audit / events / search | Platform  | Reuse               |
| Storage connector                        | Future    | Behind StoragePort  |
| CAPABILITY-002                           | Closed    | Selection authority |

---

## 8. Architecture acceptance criteria

| AC    | Criterion                                              | Result |
| ----- | ------------------------------------------------------ | ------ |
| AC-01 | Evidence Management defined as platform Evidence SoR   | PASS   |
| AC-02 | Domain concepts complete for Owner directive list      | PASS   |
| AC-03 | Lifecycle model with transitions / audit               | PASS   |
| AC-04 | Consumers reference; do not duplicate SoR              | PASS   |
| AC-05 | Integrity model (hash, seal, custody) defined          | PASS   |
| AC-06 | Security aligns with L-02 fail-closed / default-deny   | PASS   |
| AC-07 | Storage abstracted; no technology commitment           | PASS   |
| AC-08 | Relationships to TE and future capabilities documented | PASS   |
| AC-09 | Workbench vision architectural only                    | PASS   |
| AC-10 | External interfaces logical only                       | PASS   |
| AC-11 | NFRs specified                                         | PASS   |
| AC-12 | ADRs proposed for key decisions                        | PASS   |
| AC-13 | No engineering / no Eng Spec / no TE modification      | PASS   |
| AC-14 | No Lifecycle Standard revision                         | PASS   |
| AC-15 | Programme stops at Owner Architecture Decision         | PASS   |

---

## 9. Recommended next (NOT AUTHORISED)

**APZQEP-OES-ENG-091A** — Evidence Management Engineering Specification.

Requires separate Owner Instruction after Architecture Acceptance.
