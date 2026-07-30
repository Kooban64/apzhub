# Capability Portfolio Assessment — APZQEP-CAPABILITY-002

## Already delivered (not candidates for CAPABILITY-002)

| Capability          | Status              | Note                              |
| ------------------- | ------------------- | --------------------------------- |
| Requirements        | **1.0.0 FROZEN**    | Foundation                        |
| Traceability        | **1.0.0 FROZEN**    | Foundation                        |
| Verification        | **1.0.0 FROZEN**    | Foundation                        |
| Test Specifications | **1.0.0 FROZEN**    | Foundation                        |
| Test Plans          | **1.0.0 FROZEN**    | Foundation                        |
| Test Execution      | **1.0.1 BASELINED** | Limited Availability; L-02 closed |

“Requirements” and “Test Planning” from the assessment list are **already delivered** and are scored only for integration context.

## Candidate assessments

Sizing key: **S** ≈ 1 Architecture + ES + ~2–3 ENG waves · **M** ≈ full 5-wave path · **L** ≈ M + heavy platform/storage/ops · **XL** ≈ multi-capability programme.

### 1. Test Suites

| Field                  | Assessment                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Purpose                | Group test specifications / plans into reusable suite definitions (not executions)      |
| Primary users          | Test authors; QA leads                                                                  |
| Dependencies           | Test Specs, Test Plans (done); optional link from Execution context                     |
| Business value         | Medium — organisation & reuse; TE already runnable without suites                       |
| Engineering complexity | Medium                                                                                  |
| Architectural impact   | New SoR; careful boundary vs Plans and Verification Library “suites” naming             |
| Sequence position      | After Specs/Plans; before/parallel Runs                                                 |
| Delivery size          | **M**                                                                                   |
| Reuse                  | Plan/Specs patterns, Workbench shell, authz                                             |
| Key risks              | Catalogue confusion with Verification Library suites; low incremental value vs Evidence |

### 2. Test Runs

| Field                  | Assessment                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Purpose                | Orchestrate / group many Test Executions (ADR-0077 — not an alias of Execution)             |
| Primary users          | QA managers; release managers; campaign owners                                              |
| Dependencies           | **Test Execution 1.0.1** (done); Plans                                                      |
| Business value         | High — campaign visibility, progress aggregation                                            |
| Engineering complexity | Medium–High (orchestration, progress, permissions)                                          |
| Architectural impact   | New aggregate root over executions; events/search                                           |
| Sequence position      | Wave 2 indicative #2                                                                        |
| Delivery size          | **M–L**                                                                                     |
| Reuse                  | Execution DTOs/events, Plan readiness, Workbench patterns from Plans/Execution              |
| Key risks              | Scope creep into scheduling/CI; can proceed without Evidence SoR but remains reference-thin |

### 3. Requirements

| Field          | Assessment                                                                    |
| -------------- | ----------------------------------------------------------------------------- |
| Purpose        | Already delivered Foundation capability                                       |
| Recommendation | **Do not select** — enhance only via future Owner-authorised delta programmes |

### 4. Evidence Management — **RECOMMENDED**

| Field                  | Assessment                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose                | System of Record for evidence blobs, packs, retention, integrity, lock-for-cert, chain of custody; fine-grained access (ADR-0080 / M09) |
| Primary users          | Testers; reviewers; compliance; release/cert managers                                                                                   |
| Dependencies           | Platform storage/authz/audit; **consumes Execution EvidenceReferences**; unlocks Analytics/Coverage                                     |
| Business value         | **Very High** — trust, auditability, certification packs; closes TE’s largest deferred product boundary                                 |
| Engineering complexity | High (storage, retention, ACL, integrity) but well-bounded by ADRs                                                                      |
| Architectural impact   | New SoR + Integration Adapter to storage; TE remains reference-only                                                                     |
| Sequence position      | Wave 2 indicative #4 — elevated by foundation/value criteria                                                                            |
| Delivery size          | **L**                                                                                                                                   |
| Reuse                  | TE reference contracts; baseline evidence-access hook; PermissionService; audit; search; stub `modules/qep-evidence`                    |
| Key risks              | Storage ops; ACL design; must not absorb Execution business rules                                                                       |

### 5. Defects

| Field                  | Assessment                                                                        |
| ---------------------- | --------------------------------------------------------------------------------- |
| Purpose                | Promote observations/failure facts into managed defect lifecycle (ADR-0081 / M08) |
| Primary users          | Testers; developers; QA managers                                                  |
| Dependencies           | Execution observations (done); stronger with Evidence attachments                 |
| Business value         | High — daily workflow                                                             |
| Engineering complexity | Medium–High                                                                       |
| Architectural impact   | New SoR; ALM integration later                                                    |
| Sequence position      | After Execution; better after Evidence for attachments                            |
| Delivery size          | **M–L**                                                                           |
| Reuse                  | Observation model; Workbench patterns; stub `modules/qep-defects`                 |
| Key risks              | ALM duplication; premature without Evidence packs                                 |

### 6. Test Planning

| Field          | Assessment                                       |
| -------------- | ------------------------------------------------ |
| Purpose        | Already delivered as Test Plans **1.0.0 FROZEN** |
| Recommendation | **Do not select**                                |

### 7. Reporting

| Field             | Assessment                                                     |
| ----------------- | -------------------------------------------------------------- |
| Purpose           | Cross-capability reports (M15)                                 |
| Dependencies      | Execution outcomes; Evidence; preferably Defects               |
| Business value    | High for executives — **premature** as SoR before facts mature |
| Complexity / size | **L**; sequence late                                           |
| Recommendation    | Defer                                                          |

### 8. Analytics

| Field          | Assessment                                        |
| -------------- | ------------------------------------------------- |
| Purpose        | Coverage & quality analytics (Wave 2 #6)          |
| Dependencies   | Evidence + Execution (+ Specs/Requirements links) |
| Business value | High later; **blocked** on Evidence depth         |
| Recommendation | Defer                                             |

### 9. AI Assistance

| Field          | Assessment                                                  |
| -------------- | ----------------------------------------------------------- |
| Purpose        | AI-assisted testing (Wave 2 #8; ADR-0086 non-authoritative) |
| Dependencies   | Stable domain facts; AI OFF until authorised                |
| Business value | Differentiator later                                        |
| Recommendation | Defer — governance + product risk if early                  |

### 10. Dashboards

| Field          | Assessment                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| Purpose        | Command-centre / reporting surfaces (overlaps M01/M15)                     |
| Dependencies   | Downstream of Execution/Evidence/Defects facts                             |
| Recommendation | Defer as dedicated capability; extend Home widgets opportunistically later |

## Scoring summary (next-capability suitability)

| Capability                         | Business value      | Foundation strength | Readiness now | Rank              |
| ---------------------------------- | ------------------- | ------------------- | ------------- | ----------------- |
| Evidence Management                | Very High           | **Highest**         | High          | **1 — RECOMMEND** |
| Test Runs                          | High                | High                | High          | 2                 |
| Defects                            | High                | Medium              | Medium–High   | 3                 |
| Test Suites                        | Medium              | Medium              | High          | 4                 |
| Reporting / Analytics / Dashboards | High (later)        | Low now             | Low           | Defer             |
| AI Assistance                      | Medium–High (later) | Low now             | Low           | Defer             |
| Requirements / Test Planning       | N/A                 | N/A                 | Delivered     | Skip              |
