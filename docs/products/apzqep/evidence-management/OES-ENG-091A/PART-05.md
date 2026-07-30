# APZQEP-OES-ENG-091A

# PART 5 — Testing, Observability, Performance, Readiness & Acceptance

| Item         | Value                                                               |
| ------------ | ------------------------------------------------------------------- |
| Document     | APZQEP-OES-ENG-091A                                                 |
| Part         | **5 of 5**                                                          |
| Programme    | APZQEP-OES-ENG-091A                                                 |
| Status       | **IMPLEMENTED / AWAITING OWNER ENGINEERING SPECIFICATION DECISION** |
| Architecture | APZQEP-ARCH-016 Part 5 — authoritative                              |

---

## 1. Testing strategy

### 1.1 Unit / Domain

- Every Domain command transition (Appendix B) — happy + illegal
- Invariants I-01… (Appendix C)
- Seal immutability; dispose/legal-hold guards
- SHA-256 hash helper purity
- EvidenceSet membership freeze

**Coverage expectation:** Domain logic ≥ 90% line/branch on lifecycle & integrity modules.

### 1.2 Application

- availableActions matrix per status × permission × ACL × hold
- Fail-closed access: missing/indeterminate/error/null → deny
- Capture orchestration with StoragePort fake
- Optimistic concurrency conflicts
- Outbox event emission per command

### 1.3 Integration

- Repository against test DB (when Engineering exists)
- StoragePort contract tests with fake/in-memory adapter
- Access-check API for TE consumer simulation
- Tenant isolation (cross-tenant deny)

### 1.4 API

- Contract tests for each resource (schema, status codes, envelope)
- Authn/authz negative tests
- Upload validation (type/size)
- Download deny paths (disposed, integrity failed, forbidden)

### 1.5 Security

- Default-deny matrix (mandatory regression suite — L-02 continuity)
- Privilege escalation attempts
- IDOR across tenants/projects
- Grant revoke immediacy

### 1.6 Lifecycle / integrity / policy

- Full path Capture→…→Dispose
- Legal hold blocks dispose
- Seal then replaceContent fails
- verifyIntegrity mismatch path

### 1.7 Performance

- Load tests for upload/download/list against targets (§3) in Engineering/CERT — specify harness in ENG waves

### 1.8 Playwright

- Authenticated journeys: explorer list, open detail, preview (when allowed), action visibility matches availableActions
- Negative: user without download does not receive content
- a11y smoke on explorer/detail

### 1.9 Certification readiness

Suites above map to Component → Capability certification evidence. Security suite **SHALL** be required for any production baseline.

### 1.10 Definition of Done (future Engineering)

All pyramid layers green · a11y verified · docs · architecture compliance · CI green ([015](../../../../015-quality-release.md)).

---

## 2. Observability requirements

| Pillar  | Requirement                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| Logs    | Structured; correlationId; no content bytes; deny reasons as codes                                                   |
| Metrics | capture_count, download_count, deny_count, integrity_fail_count, lifecycle_transition_count, storage_put/get latency |
| Traces  | Span per use-case + StoragePort I/O                                                                                  |
| Health  | EvidenceService health; StoragePort dependency health; outbox lag                                                    |
| Audit   | Platform audit for material actions (Part 3 §8)                                                                      |

Silent components **SHALL NOT** exist ([014](../../../../014-observability.md)).

---

## 3. Performance requirements (initial engineering targets)

| Metric                        | Target (initial)                                     | Notes                                                         |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| Metadata get p95              | ≤ 200 ms                                             | Excl. cold start                                              |
| List (50 items) p95           | ≤ 500 ms                                             | Indexed filters                                               |
| Upload 5 MiB p95              | ≤ 3 s                                                | Network-dependent; measure server-side accept                 |
| Download 5 MiB first-byte p95 | ≤ 500 ms                                             | After authz                                                   |
| Access check p95              | ≤ 50 ms                                              | Hot path for TE                                               |
| Lifecycle action p95          | ≤ 300 ms                                             | Metadata-only                                                 |
| Search query p95              | ≤ 700 ms                                             | Derived index                                                 |
| Durability                    | Metadata + content durable per platform backup class | Eng wave defines RPO/RTO with ops                             |
| Availability                  | EvidenceService aligned with platform API SLO        | Degrade downloads if storage down; metadata read may continue |
| Concurrency                   | Optimistic concurrency; no lost updates              | Revision conflicts → 409                                      |
| Scalability                   | Partition by tenant; object storage horizontal       | Technology later                                              |

Targets are engineering acceptance baselines; CERT may tighten.

---

## 4. AI boundary (engineering restatement)

Permitted: suggest classification, summarise authorised content, flag missing associations.  
Prohibited: authoritative capture/approve/seal/dispose/grant; silent mutation; ACL bypass; unapproved exfiltration.

---

## 5. Acceptance criteria (this OES programme)

| AC    | Criterion                                                    | Result |
| ----- | ------------------------------------------------------------ | ------ |
| AC-01 | Every ARCH-016 decision has Eng Spec coverage                | PASS   |
| AC-02 | Domain aggregates/commands/lifecycle complete                | PASS   |
| AC-03 | Repository + StoragePort contracts specified; no tech chosen | PASS   |
| AC-04 | API resources/errors/validation specified                    | PASS   |
| AC-05 | Security extends L-02 fail-closed                            | PASS   |
| AC-06 | Integration via EvidenceReference only                       | PASS   |
| AC-07 | Events + observability + performance specified               | PASS   |
| AC-08 | Testing strategy complete                                    | PASS   |
| AC-09 | Migration strategy preserves TE 1.0.1                        | PASS   |
| AC-10 | Risks/assumptions documented                                 | PASS   |
| AC-11 | No production code / migrations / TE edits                   | PASS   |
| AC-12 | Stops at Owner Eng Spec Decision                             | PASS   |

---

## 6. Engineering traceability

### 6.1 Architecture → OES

| ARCH-016 theme      | OES location                     |
| ------------------- | -------------------------------- |
| Evidence SoR        | PART-01 §8 · PART-02 · ADR-0087  |
| Domain concepts     | PART-02                          |
| Lifecycle           | PART-02 §3 · APPENDIX-B          |
| Integrity           | PART-02 §4                       |
| Security / L-02     | PART-04 §2 · ADR-0089            |
| Storage abstraction | PART-03 §5 · ADR-0088            |
| Collections / Sets  | PART-02 §1.2–1.3 · ADR-0090/0091 |
| Integrations        | PART-03 §9                       |
| Workbench           | PART-04 §3                       |
| NFRs                | PART-05 §2–3                     |

### 6.2 Future Engineering → this OES

ENG-110A…E **SHALL** implement against this OES without inventing SoR, ACL, or lifecycle semantics.

---

## 7. Assumptions, dependencies, limitations, risks

### Assumptions

| ID   | Assumption                                                                |
| ---- | ------------------------------------------------------------------------- |
| A-01 | PermissionService remains sole platform authz authority                   |
| A-02 | Storage technology selected in Engineering/ADR without changing contracts |
| A-03 | TE 1.0.1 remains stable during M1–M2                                      |
| A-04 | SHA-256 acceptable as default hash                                        |
| A-05 | Legal hold in product scope                                               |
| A-06 | Owner separately authorises Engineering waves after OES Acceptance        |

### Dependencies

ARCH-016 Accepted · Platform gateway/auth/audit/events/search · TE 1.0.1 coexistence · StoragePort adapter (future)

### Limitations

- No physical DDL in this OES
- No OpenAPI YAML artefact yet (locked resources only)
- TE delegation is a separate programme

### Risks

| ID   | Risk                       | Mitigation                                          |
| ---- | -------------------------- | --------------------------------------------------- |
| R-01 | Storage choice delay       | Contracts stable; fake adapter for Domain/App tests |
| R-02 | ACL complexity             | Start with ownership + project + explicit grants    |
| R-03 | Dual-path TE confusion     | Documented migration phases; feature flags          |
| R-04 | Large binary cost          | Size limits + streaming; classification policies    |
| R-05 | Over-governance slowing UX | availableActions + 90/10 operating rule             |

---

## 8. Engineering readiness assessment

| Dimension                       | Ready?                          |
| ------------------------------- | ------------------------------- |
| Architectural gaps              | **NONE material**               |
| Domain implementability         | **YES**                         |
| Security implementability       | **YES** (L-02 patterns proven)  |
| API implementability            | **YES**                         |
| Testability                     | **YES**                         |
| Migration safety vs TE          | **YES** (parallel introduction) |
| Blockers to Eng Spec Acceptance | **Owner Decision only**         |

**Verdict:** Engineering Specification **READY FOR OWNER ACCEPTANCE**.

---

## 9. Programme closure

Pack complete. No production code. Await Owner Engineering Specification Decision.

Recommended next after Acceptance (**NOT AUTHORISED**): **APZQEP-ENG-110A**.

---

## STOP

```text
PART-05 COMPLETE
OES-ENG-091A PACK READY FOR OWNER DECISION
NO PRODUCTION CODE
NO ENGINEERING WAVES AUTHORISED
```
