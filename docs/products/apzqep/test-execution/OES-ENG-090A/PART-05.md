# APZQEP-OES-ENG-090A

# PART 5 — Testing Strategy, Observability, Acceptance Criteria & Traceability

| Item         | Value                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| Document     | APZQEP-OES-ENG-090A                                                    |
| Part         | **5 of 5**                                                             |
| Programme    | APZQEP-OES-ENG-090A                                                    |
| Status       | **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED** |
| Architecture | APZQEP-ARCH-015 Part 5 — authoritative                                 |

---

## 1. Testing strategy (for future Engineering)

Testing **SHALL** follow Document 015 pyramid. No tests are executed under this OES programme (specification only).

### 1.1 Domain Engineering tests

| Layer            | Focus                                                         |
| ---------------- | ------------------------------------------------------------- |
| Unit             | Commands, invariants, outcome derivation, policies, seal/hash |
| Property / table | Lifecycle matrix transitions legal/illegal                    |
| Mutation         | No I/O; pure aggregate                                        |

### 1.2 Application / Infrastructure tests

| Layer       | Focus                                                                |
| ----------- | -------------------------------------------------------------------- |
| Unit        | `availableActions` matrix; error mapping                             |
| Integration | Repository + outbox + audit transaction; frozen client mocks         |
| API         | Contract tests for routes, authz, concurrency, ingestion idempotency |
| Security    | Tenant isolation; permission negative tests; ingestion rejection     |

### 1.3 Workbench tests

| Layer      | Focus                                                                      |
| ---------- | -------------------------------------------------------------------------- |
| Component  | Surfaces bind to DTO/`availableActions`                                    |
| Playwright | Create→prepare→assign→execute→review happy path; conflict; permission loss |
| A11y       | WCAG AA automated + critical path manual                                   |

### 1.4 Definition of Done (future Engineering — reminder)

All applicable pyramid layers green; docs; architecture compliance; no frozen-baseline modification — per Document 015. Certification/Freeze remain separate Owner stages.

---

## 2. Observability requirements

| Pillar                         | Requirements                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Metrics**                    | Created/started/completed rates; blocked count; review queue depth; ingestion failure rate; outbox lag |
| **Logs**                       | Structured JSON; correlation id; tenant; actor/agent; no secrets; no raw evidence payloads             |
| **Traces**                     | Gateway → Application → Domain → Persistence spans                                                     |
| **Health**                     | Capability readiness; DB; bus; dependency checks on Plans/Specs resolvers                              |
| **Alerts** (ops-defined later) | Ingestion failure spikes; outbox lag; review backlog thresholds                                        |

Every service/connector used **SHALL** self-report. Silent components are defects (Document 014).

---

## 3. Non-functional engineering targets (initial)

| Concern       | Target guidance                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Correctness   | Sealed manifests; finalisation immutability; audit reconstructability                                  |
| Resilience    | Idempotent ingestion; retry-safe commands; outbox retry                                                |
| Performance   | Step-record p95 budget set during Engineering with measurement; review queue list pagination mandatory |
| Scalability   | Tenant partition; history append growth planned                                                        |
| Availability  | Post-seal operate from manifest if live Plan/Spec read degraded                                        |
| Accessibility | WCAG AA Workbench                                                                                      |
| Privacy       | Classify actual results; restrict default search indexing of bodies                                    |

Numeric SLOs **MAY** be refined in Engineering without Architecture change if they do not weaken correctness/security.

---

## 4. AI boundary (engineering restatement)

Permitted (future, non-authoritative): explain, summarise approved source, suggest wording, flag missing evidence, suggest observations, detect inconsistencies, assist a11y, summarise history, highlight duplication, recommend review attention.

Prohibited: fabricate results; mark pass/fail without authorised action; bypass evidence; silent mutation; impersonate actors; invent evidence; final review decisions; override Domain; manufacture traceability; conceal uncertainty; unapproved exfiltration.

Controls: human-in-the-loop; provenance; uncertainty UI; audit hooks; tenant isolation; provider abstraction; redaction; retention/opt-out.

**No AI implementation under this OES.** ADR-0086.

---

## 5. Acceptance criteria (this OES programme)

| ID    | Criterion                                                                                             | Status |
| ----- | ----------------------------------------------------------------------------------------------------- | ------ |
| AC-01 | Complete pack: COMPLETE + PART-01…05 + APPENDIX-A…E + Owner materials                                 | ✅     |
| AC-02 | Sole architectural authority is APZQEP-ARCH-015; no Architecture redefinition                         | ✅     |
| AC-03 | Package boundaries and module structure specified                                                     | ✅     |
| AC-04 | Domain interfaces complete (aggregate, entities, VOs, commands, invariants, policies, errors, events) | ✅     |
| AC-05 | Application services and `availableActions` contract specified                                        | ✅     |
| AC-06 | Infrastructure ports, persistence logical model, outbox/search/audit specified                        | ✅     |
| AC-07 | API resources, permissions, error categories specified                                                | ✅     |
| AC-08 | Security / tenancy / ingestion trust boundary specified                                               | ✅     |
| AC-09 | Workbench surfaces and action-bar rules specified                                                     | ✅     |
| AC-10 | Testing strategy and observability specified                                                          | ✅     |
| AC-11 | Engineering traceability to ARCH-015 / ADRs complete                                                  | ✅     |
| AC-12 | Frozen baselines referenced only; unmodified                                                          | ✅     |
| AC-13 | No production code, migrations, packages, implementation, ECR, certification, freeze                  | ✅     |
| AC-14 | Owner decision template ready                                                                         | ✅     |

---

## 6. Engineering traceability

### 6.1 Architecture → OES

| ARCH-015 section                                  | OES coverage                 |
| ------------------------------------------------- | ---------------------------- |
| Part 1 definition / exclusions                    | PART-01                      |
| Part 2 domain / lifecycle / outcomes / events     | PART-02, APP-B, APP-C, APP-D |
| Part 3 permissions / availableActions / Workbench | PART-04                      |
| Part 4 infra / API / security / ingestion         | PART-03, PART-04             |
| Part 5 future boundaries / AI / NFR / AC          | PART-01 §8, PART-05          |
| ADR-0075 Aggregate                                | PART-02                      |
| ADR-0076 Sealed manifest                          | PART-02, PART-03             |
| ADR-0077 Test Runs separation                     | PART-01 exclusions           |
| ADR-0078 Unified manual/automated                 | PART-02 mode + ingestion     |
| ADR-0079 Outcome model                            | PART-02                      |
| ADR-0080 Evidence references                      | PART-02, PART-03             |
| ADR-0081 Observations ≠ defects                   | PART-02                      |
| ADR-0082 Review override audited                  | PART-02                      |
| ADR-0083 availableActions sole UI authority       | PART-03, PART-04             |
| ADR-0084 Ingestion trust boundary                 | PART-03, PART-04             |
| ADR-0085 Supersession / immutability              | PART-02                      |
| ADR-0086 AI non-authority                         | PART-05                      |

### 6.2 Future Engineering → this OES

Future Engineering programmes **MUST** trace deliverables to PART/APPENDIX identifiers herein. Deviation requires ADR or Owner-approved change.

---

## 7. Assumptions / dependencies / limitations (engineering)

### Assumptions

| ID   | Assumption                                                        |
| ---- | ----------------------------------------------------------------- |
| A-01 | PermissionService remains sole authz authority                    |
| A-02 | Platform outbox/event/search/audit patterns reused                |
| A-03 | Frozen Plans continue not to store execution results              |
| A-04 | Evidence Management later owns blobs; refs remain stable          |
| A-05 | Owner separately authorises Engineering after this OES Acceptance |

### Dependencies

Frozen five capabilities · Platform authz/events/search/audit · Future Evidence/Defect/Test Runs (reference only)

**Unresolved (carried from ARCH-015):** whether Plan progress projection needs an additive Plan contract — does not block this OES; Engineering **SHALL** use Test Execution–owned progress query first.

### Limitations of this OES

| ID   | Limitation                                                                             |
| ---- | -------------------------------------------------------------------------------------- |
| L-01 | No OpenAPI file artefacts                                                              |
| L-02 | No SQL migrations                                                                      |
| L-03 | No `event.yaml` / `module.yaml` files created                                          |
| L-04 | Numeric performance SLOs deferred to Engineering measurement                           |
| L-05 | No AI feature design beyond boundary                                                   |
| L-06 | Workbench exact route strings deferred to Workbench Engineering within these contracts |

---

## 8. Programme closure

Owner Engineering Specification Decision recorded. Programme status is:

```text
ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED
```

No Engineering, ECR, certification, version change, or freeze is authorised by Acceptance alone. Recommended next: **APZQEP-ENG-100A** — **RECOMMENDATION ONLY / NOT AUTHORISED**.

---

## STOP

```text
PART-05 COMPLETE
ACCEPTANCE CRITERIA + TRACEABILITY COMPLETE
ENGINEERING SPECIFICATION BASELINED / CLOSED
```
