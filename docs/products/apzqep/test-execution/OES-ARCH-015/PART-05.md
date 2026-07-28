# APZQEP-OES-ARCH-015

# PART 5 — Future Boundaries, AI, NFR, Registers, Acceptance Criteria

| Item      | Value               |
| --------- | ------------------- |
| Document  | APZQEP-OES-ARCH-015 |
| Part      | **5 of 5**          |
| Programme | APZQEP-ARCH-015     |

---

## 1. Future capability boundaries

| Future capability            | Test Execution owns          | Test Execution references             | Boundary rule                                                         |
| ---------------------------- | ---------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| **Test Runs**                | Atomic executions            | Optional future run id                | Runs orchestrate many executions — **not** inside this SoR (ADR-0077) |
| Test Suites                  | —                            | Suite id optional on context/manifest | Suites group specs/plans; not executions                              |
| Evidence Management          | EvidenceReference            | Evidence ids / URIs                   | No evidence blob SoR here (ADR-0080)                                  |
| Defect Management            | Observations / failure facts | Future defect ids                     | No defect lifecycle here (ADR-0081)                                   |
| Coverage & Analytics         | Raw outcome facts / events   | —                                     | Analytics consume; do not compute coverage SoR here                   |
| Reporting & Dashboards       | Queryable facts / events     | —                                     | Presentation aggregations future                                      |
| AI-Assisted Testing          | —                            | Suggestions non-authoritative         | ADR-0086                                                              |
| Automation adapters          | Ingestion submissions        | Agent registry                        | No runner engine                                                      |
| CI/CD integrations           | Ingested results             | Pipeline correlation ids              | Via ingestion trust boundary                                          |
| Environment / test data mgmt | Context descriptors          | External env/data ids                 | Descriptors only                                                      |

### 1.1 Decision — Test Execution vs Test Runs

**Test Run is a separate future capability**, not an alias for TestExecution.

- **TestExecution** = atomic controlled performance of testing work (this architecture).
- **Test Run** = higher-level orchestration grouping (multiple executions, campaign/wave coordination) — Wave 2 item 2, separately authorised later.

No ambiguous overlap. See ADR-0077.

---

## 2. AI architecture boundary

### Permitted (future, non-authoritative)

Explain instructions · summarise approved source · suggest actual-result wording · flag missing evidence · suggest observations · detect inconsistencies · assist accessibility · summarise history · highlight duplication · recommend review attention.

### Prohibited

Fabricate results · mark pass/fail without authorised action · bypass evidence · silent record mutation · impersonate actors · invent evidence · final review decisions · override Domain state · manufacture traceability · conceal uncertainty · exfiltrate to unapproved providers.

### Controls (architectural)

Human-in-the-loop for any suggestion applied · provenance of AI text · uncertainty presentation · prompt/response audit hooks · tenant isolation · provider abstraction · sensitive-data redaction · retention / opt-out policy hooks.

**No AI implementation is authorised under ARCH-015.** ADR-0086.

---

## 3. Non-functional architecture

| Concern         | Expectation                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Correctness     | History trustworthy; sealed manifests; finalisation immutability                                                         |
| Availability    | Degrade gracefully if Plans/Specs read unavailable after seal (use sealed manifest); block prepare if sources unresolved |
| Resilience      | Idempotent ingestion; retry-safe commands; outbox retry                                                                  |
| Performance     | Hotspots: step recording, review queue, ingestion bursts — size in ENG with measured targets                             |
| Scalability     | Partition by tenant; append-only history growth planned                                                                  |
| Maintainability | Clear bounded context; no duplicated lifecycle in Workbench                                                              |
| Compatibility   | Frozen v1.0.0 contracts respected; SemVer for future Test Execution package                                              |
| Auditability    | Reconstruct every material decision                                                                                      |
| Accessibility   | Architectural requirement (Part 3)                                                                                       |
| Privacy         | Actual results / datasets may be sensitive — classify and protect                                                        |

---

## 4. Assumptions register

| ID   | Assumption                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------- |
| A-01 | Platform PermissionService remains the sole authorisation authority                            |
| A-02 | Frozen Traceability can express execution linkage; new types if needed are separate programmes |
| A-03 | Test Plans continue not to store execution results (ARCH-013)                                  |
| A-04 | Evidence Management will later own blobs; references remain stable                             |
| A-05 | Automated agents will use service identities already supportable by platform auth              |
| A-06 | Owner will separately authorise Engineering Specification after Architecture Acceptance        |

---

## 5. Dependency register

| Dependency                               | Type     | Notes                                                                              |
| ---------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| Requirements 1.0.0                       | Frozen   | Reference only                                                                     |
| Traceability 1.0.0                       | Frozen   | Relationship vocabulary                                                            |
| Verification 1.0.0                       | Frozen   | Outcomes do not auto-finalise verification                                         |
| Test Specifications 1.0.0                | Frozen   | Versioned source                                                                   |
| Test Plans 1.0.0                         | Frozen   | Plan items / readiness; progress projection may need future additive Plan contract |
| Platform authz / events / search / audit | Platform | Reuse; do not fork                                                                 |
| Evidence Management                      | Future   | Reference target                                                                   |
| Defect Management                        | Future   | Observation promotion                                                              |
| Test Runs                                | Future   | Orchestration parent                                                               |

**Unresolved dependency:** Whether Plan progress projection requires a Plan additive contract — recorded for Owner awareness; does not block ARCH-015 Acceptance.

---

## 6. Limitations register

| ID   | Limitation                                                                   |
| ---- | ---------------------------------------------------------------------------- |
| L-01 | No Engineering Specification detail (schemas, OpenAPI, code layout)          |
| L-02 | Exact REST verb/path shapes deferred to ENG Spec (resources locked)          |
| L-03 | Exact permission string catalogue deferred to ENG Spec (concepts locked)     |
| L-04 | Coverage analytics not defined                                               |
| L-05 | Native automation orchestration not defined (ingestion only)                 |
| L-06 | Defect confirmation workflow not defined                                     |
| L-07 | AI features not designed beyond boundary                                     |
| L-08 | Possible future Traceability relationship-type additions not authorised here |

---

## 7. Risk register

| ID   | Risk                                         | L   | I   | Mitigation                                                  | Residual |
| ---- | -------------------------------------------- | --- | --- | ----------------------------------------------------------- | -------- |
| R-01 | Confusion with Test Runs naming              | M   | H   | ADR-0077; ubiquitous language                               | L        |
| R-02 | Pressure to mutate frozen Plans for progress | M   | H   | Progress owned by Execution; separate Plan change if needed | M        |
| R-03 | Workbench invents actions                    | M   | H   | availableActions sole authority; ADR-0083                   | L        |
| R-04 | Automated ingestion corrupts finals          | M   | H   | Trust boundary; reject after terminal                       | L        |
| R-05 | Evidence blob creep into Execution           | M   | M   | ADR-0080                                                    | L        |
| R-06 | Reviewer = executor weakens assurance        | M   | M   | Policy flag for independence                                | M        |
| R-07 | Sensitive actual results in search/events    | M   | H   | Exclusion/redaction architecture                            | M        |

---

## 8. Architecture acceptance criteria

| ID    | Criterion                                   | Status                            |
| ----- | ------------------------------------------- | --------------------------------- |
| AC-01 | Conforms to Document 000, Constitution, OES | **MET**                           |
| AC-02 | No frozen baseline modified                 | **MET**                           |
| AC-03 | Capability purpose/scope/boundary precise   | **MET**                           |
| AC-04 | Test Runs boundary explicit                 | **MET** (ADR-0077)                |
| AC-05 | Domain completeness                         | **MET**                           |
| AC-06 | Lifecycle completeness                      | **MET**                           |
| AC-07 | Historical integrity                        | **MET** (manifest + supersession) |
| AC-08 | Outcome integrity                           | **MET** (ADR-0078)                |
| AC-09 | Workbench purity                            | **MET**                           |
| AC-10 | availableActions sole authority             | **MET** (ADR-0083)                |
| AC-11 | Integration with five frozen capabilities   | **MET**                           |
| AC-12 | Evidence boundary                           | **MET** (ADR-0080)                |
| AC-13 | Defect boundary                             | **MET** (ADR-0081)                |
| AC-14 | Manual + automated support                  | **MET** (ADR-0079)                |
| AC-15 | External trust boundary                     | **MET** (ADR-0084)                |
| AC-16 | Security and tenancy                        | **MET**                           |
| AC-17 | Audit and observability                     | **MET**                           |
| AC-18 | Accessibility architecturally defined       | **MET**                           |
| AC-19 | AI boundary                                 | **MET** (ADR-0086)                |
| AC-20 | Implementation independent                  | **MET**                           |
| AC-21 | Architecture validation performed           | **MET** — see validation report   |
| AC-22 | Honest limitations                          | **MET**                           |
| AC-23 | Documentation indexed                       | **MET** upon index update         |
| AC-24 | Programme isolation (no ENG/CERT/Freeze)    | **MET**                           |

---

## 9. Engineering Specification readiness

Upon Owner Architecture Acceptance, a separately authorised programme **MAY** begin:

**Recommended id:** `APZQEP-OES-ENG-090A` — Test Execution Domain Engineering Specification.

That programme is **NOT AUTHORISED** by ARCH-015.

Ready inputs: aggregates, lifecycle, outcomes, commands/queries, events, API resources, permissions concepts, integration boundaries, ADRs.

---

## 10. Conclusion

APZQEP-ARCH-015 defines a complete, implementation-independent architecture for Test Execution that preserves Foundation and all five frozen baselines, keeps Workbench pure, and cleanly separates future Test Runs, Evidence, Defects, and AI concerns.

**Programme status after pack completion:**

```text
IMPLEMENTED
AWAITING OWNER ARCHITECTURE DECISION
```

---

## STOP

```text
PART 5 COMPLETE
BOUNDARIES EXPLICIT
ACCEPTANCE CRITERIA EVALUATED
NO ENGINEERING AUTHORISED
```
