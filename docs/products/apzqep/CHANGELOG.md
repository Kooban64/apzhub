# APZ QEP — Changelog

## 2026-07-29 — APZQEP-RELEASE-001 Production Release · IMPLEMENTED / AWAITING OWNER DECISION

- **APZQEP-FREEZE-001** Owner Decision — **ACCEPTED / PRODUCTION BASELINE FROZEN / CLOSED** (`20260729T164500Z-APZQEP-FREEZE-001-ACCEPTANCE.json`)
- **APZQEP-RELEASE-001** — Production Release — **IMPLEMENTED / AWAITING OWNER PRODUCTION RELEASE DECISION**
- Version promotion: `1.0.0-rc.1` → **`@apzhub/qep-test-execution` 1.0.0**
- Git tag: `apzqep-test-execution-v1.0.0`
- Pack: [test-execution/RELEASE-001/](./test-execution/RELEASE-001/README.md)
- Release pack: [docs/releases/apzqep/test-execution/1.0.0/](../../releases/apzqep/test-execution/1.0.0/README.md)
- GA recommendation: **LIMITED_AVAILABILITY_APPROVED** (L-02 blocks unrestricted GA)
- Stop: Do **not** commence unrestricted GA or post-release engineering without a separate Owner Instruction
- Strategic suggestion noted (not authorised): APZ Engineering Lifecycle Standard v1.0

## 2026-07-29 — APZQEP-FREEZE-001 Production Freeze · IMPLEMENTED / AWAITING OWNER DECISION

- **APZQEP-CERT-001** Owner Decision — **ACCEPTED / CERTIFICATION BASELINED / CLOSED** (`20260729T152900Z-APZQEP-CERT-001-ACCEPTANCE.json`)
- Class **PRODUCTION_READY_WITH_LIMITATIONS** · Risk Acceptance **APPROVED** (RA-02: mandatory L-02 remediation before unrestricted GA)
- **APZQEP-FREEZE-001** — Production Freeze — **IMPLEMENTED / AWAITING OWNER PRODUCTION FREEZE DECISION**
- Pack: [test-execution/FREEZE-001/](./test-execution/FREEZE-001/README.md)
- RC: `@apzhub/qep-test-execution` **1.0.0-rc.1** · Evidence `20260729T153121Z-APZQEP-FREEZE-001.json`
- Release pack: [docs/releases/apzqep/test-execution/1.0.0-rc.1/](../../releases/apzqep/test-execution/1.0.0-rc.1/README.md)
- Recommendation: **PROCEED TO PRODUCTION RELEASE** (commit RC tree before deploy)
- Stop: Do **not** deploy / Release / GA without a separate Owner Instruction
- Strategic suggestion noted (not authorised): APZ Engineering Lifecycle Standard after Production Release

## 2026-07-29 — APZQEP-CERT-001 Certification · IMPLEMENTED / AWAITING OWNER DECISION

- **APZQEP-ECR-001** Owner Decision — **ACCEPTED / ENGINEERING COMPLETION REVIEW BASELINED / CLOSED** (`20260729T151200Z-APZQEP-ECR-001-ACCEPTANCE.json`)
- **APZQEP-CERT-001** — Test Execution Capability Certification — **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION**
- Pack: [test-execution/CERT-001/](./test-execution/CERT-001/README.md)
- Evidence: `20260729T151506Z-APZQEP-CERT-001.json`
- Revalidated: package 56/56 · Workbench+handlers 24/24
- Recommended class: **PRODUCTION_READY_WITH_LIMITATIONS**
- Freeze recommendation: **PROCEED TO PRODUCTION FREEZE** (with Risk Acceptance Register)
- Limitation dispositions: L-01 Accept · L-02 Defer+RA (Correct before unrestricted GA) · L-03 Accept · L-04 Defer+RA
- Stop: Do **not** start Freeze / Release / GA without a separate Owner Instruction
- Strategic suggestion noted (not authorised): APZ Engineering Lifecycle Standard

## 2026-07-29 — APZQEP-ECR-001 Engineering Completion Review · IMPLEMENTED / AWAITING OWNER DECISION

- **APZQEP-ENG-100E** Owner Wave 5 Decision — **ACCEPTED / ENGINEERING WAVE 5 BASELINED / CLOSED** (`20260729T150347Z-APZQEP-ENG-100E-ACCEPTANCE.json`)
- **APZQEP-ECR-001** — Engineering Completion Review — **IMPLEMENTED / AWAITING OWNER ENGINEERING COMPLETION REVIEW DECISION**
- Pack: [test-execution/ECR-001/](./test-execution/ECR-001/README.md)
- Evidence: `20260729T150751Z-APZQEP-ECR-001.json`
- Waves 1–5 reviewed · conformance matrices · debt/risk/security/performance/testing/docs reviews complete
- Verdict: **READY_WITH_LIMITATIONS** · Certification recommendation: **READY_WITH_LIMITATIONS**
- Stop: Do **not** start Certification / Freeze / Release without a separate Owner Instruction
- Strategic suggestion noted (not authorised): APZ Engineering Lifecycle Standard

## 2026-07-29 — APZQEP-ENG-100E Workbench · IMPLEMENTED / AWAITING OWNER WAVE 5 DECISION

- **APZQEP-ENG-100D** Owner Wave 4 Decision — **ACCEPTED / ENGINEERING WAVE 4 BASELINED / CLOSED** (`20260729T143538Z-APZQEP-ENG-100D-ACCEPTANCE.json`)
- **APZQEP-ENG-100E** — Engineering Wave 5 Workbench — **IMPLEMENTED / AWAITING OWNER ENGINEERING WAVE 5 DECISION**
- Pack: [test-execution/ENG-100E/](./test-execution/ENG-100E/README.md)
- Evidence: `20260729T145837Z-APZQEP-ENG-100E.json`
- Workbench: module nav · presentation routes · client API · explorer/assigned/review/detail · `availableActions` action bar
- Validation: package 56/56 · Workbench unit 16 PASS
- Parallel plan: [ECR-001-PLAN/](./test-execution/ECR-001-PLAN/README.md) — **NOT AUTHORISED**
- Stop: Do **not** start ECR / Certification / Freeze without a separate Owner Instruction

## 2026-07-29 — APZQEP-ENG-100D Infrastructure & API · IMPLEMENTED / AWAITING OWNER WAVE 4 DECISION

- **APZQEP-ENG-100D** — Engineering Wave 4 Infrastructure & API — **IMPLEMENTED / AWAITING OWNER ENGINEERING WAVE 4 DECISION**
- Pack: [test-execution/ENG-100D/](./test-execution/ENG-100D/README.md)
- Evidence: `20260729T142836Z-APZQEP-ENG-100D.json`
- Persistence: `qep_test_execution*` schema · migrations `0087`/`0088` · postgres adapters · outbox/audit
- Platform: `gateway.qep.executions` · authz map · REST `/api/v1/qep/executions/*`
- Marker: `QEP_TEST_EXECUTION_INFRASTRUCTURE_STATUS = implemented-eng-100d`
- Validation: package 48/48 · config/platform typecheck PASS · handler + platform tests PASS
- Parallel plan: [ENG-100E-PLAN/](./test-execution/ENG-100E-PLAN/README.md) — **NOT AUTHORISED**
- Stop: Do **not** start Workbench Engineering without a separate Owner Instruction

## 2026-07-29 — APZQEP-ENG-100C Owner Wave 3 Acceptance · ENGINEERING WAVE 3 BASELINED / CLOSED

- **APZQEP-ENG-100C** — Owner Engineering Wave 3 Decision — **ACCEPTED / APPROVED / ENGINEERING WAVE 3 BASELINED / CLOSED**
- Decision: [test-execution/ENG-100C/OWNER-ACCEPTANCE.md](./test-execution/ENG-100C/OWNER-ACCEPTANCE.md)
- Evidence: `20260729T131604Z-APZQEP-ENG-100C-ACCEPTANCE.json`
- Application Layer baselined (`implemented-eng-100c`)
- Production baselines: Scaffolding · Domain · Application
- ENG-100D Infrastructure & API plan acknowledged as planning only — **does not authorise** Infrastructure Engineering
- Recommended next: **APZQEP-ENG-100D** — **RECOMMENDATION ONLY / NOT AUTHORISED**
- Owner recommendation: complete Waves 4–5 before further OM enhancements (not an authorisation)
- Standing Programme Record updated — governance pause; authorised next delivery: **None**

## 2026-07-29 — APZQEP-ENG-100C Application Engineering · IMPLEMENTED / AWAITING OWNER WAVE 3 DECISION

- **APZQEP-ENG-100C** — Engineering Wave 3 Application — **IMPLEMENTED / AWAITING OWNER ENGINEERING WAVE 3 DECISION**
- Pack: [test-execution/ENG-100C/](./test-execution/ENG-100C/README.md)
- Evidence: `20260729T125657Z-APZQEP-ENG-100C.json`
- Application: command/query/ingestion/`availableActions` services · ports expanded · DTOs · 40/40 tests PASS
- Marker: `QEP_TEST_EXECUTION_APPLICATION_STATUS = implemented-eng-100c`
- Parallel plan: [ENG-100D-PLAN/](./test-execution/ENG-100D-PLAN/README.md) — **NOT AUTHORISED**
- Stop: Do **not** start Infrastructure Engineering without a separate Owner Instruction

## 2026-07-29 — APZQEP-ENG-100B Owner Wave 2 Acceptance · ENGINEERING WAVE 2 BASELINED / CLOSED

- **APZQEP-ENG-100B** — Owner Engineering Wave 2 Decision — **ACCEPTED / APPROVED / ENGINEERING WAVE 2 BASELINED / CLOSED**
- Decision: [test-execution/ENG-100B/OWNER-ACCEPTANCE.md](./test-execution/ENG-100B/OWNER-ACCEPTANCE.md)
- Evidence: `20260729T124554Z-APZQEP-ENG-100B-ACCEPTANCE.json`
- Domain Layer baselined (`implemented-eng-100b`)
- ENG-100C Application plan acknowledged as planning only — **does not authorise** Application Engineering
- Continuous evidence: recognised good practice; **not mandatory** until future OM 1.2.0 (recommendation only)
- Recommended next: **APZQEP-ENG-100C** — **RECOMMENDATION ONLY / NOT AUTHORISED**
- Standing Programme Record updated — governance pause; authorised next delivery: **None**

## 2026-07-29 — APZQEP-ENG-100B Domain Engineering · IMPLEMENTED / AWAITING OWNER WAVE 2 DECISION

- **APZQEP-ENG-100B** — Engineering Wave 2 Domain — **IMPLEMENTED / AWAITING OWNER ENGINEERING WAVE 2 DECISION**
- Pure `TestExecution` Domain: aggregate, 17 commands, policies, services, events, errors
- Tests: **27 PASS** · typecheck / lint **PASS**
- Pack: [test-execution/ENG-100B/](./test-execution/ENG-100B/README.md)
- Parallel planning: [ENG-100C-PLAN/](./test-execution/ENG-100C-PLAN/) — Application plan only
- Evidence: `20260729T100000Z-APZQEP-ENG-100B.json`
- No Application / Infrastructure / API / Workbench implementation

## 2026-07-29 — APZQEP-ENG-100A Owner Wave 1 Acceptance · ENGINEERING WAVE 1 BASELINED / CLOSED

- **APZQEP-ENG-100A** — Owner Engineering Wave 1 Decision — **ACCEPTED / APPROVED / ENGINEERING WAVE 1 BASELINED / CLOSED**
- Decision: [test-execution/ENG-100A/OWNER-ACCEPTANCE.md](./test-execution/ENG-100A/OWNER-ACCEPTANCE.md)
- Evidence: `20260729T094459Z-APZQEP-ENG-100A-ACCEPTANCE.json`
- Repository Scaffolding baselined (`@apzhub/qep-test-execution` **0.0.0**)
- ENG-100B Domain Engineering Plan acknowledged as planning only — **does not authorise** Domain Engineering
- Recommended next: **APZQEP-ENG-100B** — **RECOMMENDATION ONLY / NOT AUTHORISED**
- Standing Programme Record updated — governance pause; authorised next delivery: **None**

## 2026-07-29 — APZQEP-ENG-100A Repository Scaffolding · IMPLEMENTED / AWAITING OWNER WAVE 1 DECISION

- **APZQEP-ENG-100A** — Engineering Wave 1 Repository Scaffolding — **IMPLEMENTED / AWAITING OWNER ENGINEERING WAVE 1 DECISION**
- Package: `@apzhub/qep-test-execution` **0.0.0** — layer barrels, port identities, boundary tests
- Module: `modules/qep-test-execution/module.yaml` (permissions; Workbench deferred)
- Reserved: API path `apps/web/.../qep/executions/`, event catalogue docs
- Validation: typecheck / lint / tests / prettier / web typecheck **PASS**
- Parallel planning: [ENG-100B-PLAN/](./test-execution/ENG-100B-PLAN/) — Domain plan only, **no implementation**
- Pack: [test-execution/ENG-100A/](./test-execution/ENG-100A/README.md)
- Evidence: `20260729T093000Z-APZQEP-ENG-100A.json`
- Business functionality: **NONE** · ENG-100B…E **NOT AUTHORISED**

## 2026-07-29 — APZQEP-GOV-ENG-BUILD-001 Owner Acceptance · OPERATING MODEL AMENDMENT BASELINED / CLOSED

- **APZQEP-GOV-ENG-BUILD-001** — Owner Operating Model Amendment Decision — **ACCEPTED / APPROVED / OPERATING MODEL AMENDMENT BASELINED / CLOSED**
- Decision: [governance/GOV-ENG-BUILD-001/OWNER-ACCEPTANCE.md](./governance/GOV-ENG-BUILD-001/OWNER-ACCEPTANCE.md)
- Evidence: `20260729T053932Z-APZQEP-GOV-ENG-BUILD-001-ACCEPTANCE.json`
- Effect: Engineering Build Contract **IN FORCE** · Wave-Based Engineering **IN FORCE** · OM Enhancement **1.1.0 BASELINED** · Monolithic Engineering **SUPERSEDED** · OES-003 **IN FORCE**
- Engineering Waves **ENG-100A…100E** remain **Reserved · Not Authorised**
- Recommended next: **APZQEP-ENG-100A — Repository Scaffolding** — **Recommendation Only · Not Authorised**
- Standing Programme Record updated — governance pause; authorised next delivery: **None**

## 2026-07-28 — APZQEP-GOV-ENG-BUILD-001 Engineering Build Contract & Wave Engineering · AWAITING OWNER DECISION

- **APZQEP-GOV-ENG-BUILD-001** — Engineering Operating Model Amendment — **IMPLEMENTED / AWAITING OWNER OPERATING MODEL AMENDMENT DECISION**
- Pack: [governance/GOV-ENG-BUILD-001/](./governance/GOV-ENG-BUILD-001/README.md)
- Normative: [ENGINEERING-BUILD-CONTRACT.md](../engineering/oes/ENGINEERING-BUILD-CONTRACT.md) · [OES-003](../engineering/oes/OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md)
- Lifecycle Handbook / Standing Record / Operating Model Validation updated for Enhancement 1.1.0 (pending Acceptance)
- Test Execution Waves reserved: **ENG-100A…100E** — all **NOT AUTHORISED**; monolithic ENG-100A **superseded** as recommendation
- Evidence: `20260728T201800Z-APZQEP-GOV-ENG-BUILD-001.json`
- Production code / Engineering Waves: **NONE**

## 2026-07-28 — APZQEP-OES-ENG-090A Owner Engineering Specification Acceptance · ACCEPTED / APPROVED / CLOSED

- **APZQEP-OES-ENG-090A** — Owner Engineering Specification Decision recorded — **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED**
- Decision: [test-execution/OES-ENG-090A/OWNER-ACCEPTANCE.md](./test-execution/OES-ENG-090A/OWNER-ACCEPTANCE.md)
- Evidence: `20260728T200514Z-APZQEP-OES-ENG-090A-ACCEPTANCE.json`
- Engineering Specification is now the authoritative implementation blueprint for Test Execution
- This decision **does not** authorise Engineering
- Recommended next programme: **APZQEP-ENG-100A** — Test Execution Engineering — **RECOMMENDATION ONLY / NOT AUTHORISED**
- Standing Programme Record updated — governance pause; authorised next delivery: **None**

## 2026-07-28 — APZQEP-OES-ENG-090A Test Execution Engineering Specification · IMPLEMENTED / AWAITING OWNER DECISION

- **APZQEP-OES-ENG-090A** — Test Execution Engineering Specification — **IMPLEMENTED / AWAITING OWNER ENGINEERING SPECIFICATION DECISION**
- Owner AUTHORISED TO COMMENCE executed; sole architectural authority **APZQEP-ARCH-015**
- Pack: [test-execution/OES-ENG-090A/](./test-execution/OES-ENG-090A/README.md) — COMPLETE + PART-01…05 + APPENDIX-A…E + Owner Summary + Owner Decision template + Completion Report (**PASS**)
- Scope: package boundaries · module structure · Domain · Application · Infrastructure · API · persistence · events · security · Workbench · testing · observability · acceptance · traceability
- Evidence: `20260728T193500Z-APZQEP-OES-ENG-090A.json`
- Production code / packages / migrations / Engineering / ECR / certification / freeze: **NONE**
- Next: Owner Engineering Specification Decision via [OWNER-ACCEPTANCE.md](./test-execution/OES-ENG-090A/OWNER-ACCEPTANCE.md)

## 2026-07-28 — Operating Convention interaction types (Decision / Execution / Exception)

- Standing Programme Record: three interaction types — Governance Decision (Owner), Repository Execution (no Owner), Operational Exception (Owner)
- Single governance cycle: decision → implement/record → END
- No lifecycle advancement

## 2026-07-28 — Operating Convention anti-feedback-loop rule

- Standing Programme Record: repository state confirmations do not require Owner acknowledgement unless a governance decision is requested
- Silence means state unchanged; routine updates end with the recording agent
- No lifecycle advancement

## 2026-07-28 — Governance model complete · Standing Record as sole bootstrap

- Owner confirms governance model **complete**; [STANDING-PROGRAMME-RECORD.md](./STANDING-PROGRAMME-RECORD.md) is the **single authoritative bootstrap document**
- Three-layer model recorded: Constitutional (how governed) · Programme (what happened) · Operational (where we are = Standing Record)
- No further need to re-establish context in conversation; repository-driven state only
- No lifecycle advancement; governance pause unchanged

## 2026-07-28 — Standing Programme Record bootloader role confirmed

- Standing Programme Record framed as programme **bootloader** for AI agents and new engineers (start from this document alone)
- Explicit non-behaviours: no Foundation re-open, no inferred authority, no automatic lifecycle advance, acknowledgements ≠ decisions
- Example Owner transition verbs documented (AUTHORISE ENG-090A / ARCH-016 / constitution / foundation change, RETURN ARCH-015)
- No lifecycle advancement; governance pause unchanged

## 2026-07-28 — APZQEP Operating Convention locked (permanent operational contract)

- Standing Programme Record encodes the permanent **APZQEP Operating Convention**: Owner decisions create authority; evidence records/proves only; Acknowledge/Recognise/Confirmed = state confirmation unless an explicit Owner decision verb is used
- Default conversation premise fixed: assume standing baseline; governance pause; no active programmes; proceed only on explicit Owner authorisation
- Current position unchanged: `APZQEP-OES-ENG-090A` **RECOMMENDATION ONLY / NOT AUTHORISED**
- No lifecycle advancement

## 2026-07-28 — Standing record operating clarification (Owner decisions vs evidence)

- Clarifies that Owner decisions (Accept / Approve / Close / Authorise) create authority; standing records and evidence JSON only prove decisions occurred
- Owner “acknowledge / recognise” = confirmation of repository state, not a new governance artefact unless an explicit decision is issued
- Default future-conversation premise locked in [STANDING-PROGRAMME-RECORD.md](./STANDING-PROGRAMME-RECORD.md): assume standing baseline; no active programmes; proceed only on explicit Owner authorisation
- No lifecycle advancement; `APZQEP-OES-ENG-090A` remains **NOT AUTHORISED**

## 2026-07-28 — Standing Baseline Owner Acknowledgement

- Owner acknowledges [STANDING-PROGRAMME-RECORD.md](./STANDING-PROGRAMME-RECORD.md) as the authoritative standing baseline for all future APZQEP discussions unless explicitly superseded
- Operating rules locked: Foundation immutable; Platform v1 governing; five frozen baselines immutable; ARCH-015 baselined; no automatic lifecycle progression; every programme requires explicit Owner authorisation
- Governance pause confirmed — no active programmes; `APZQEP-OES-ENG-090A` remains **RECOMMENDATION ONLY / NOT AUTHORISED**
- Evidence: `20260728T171200Z-APZQEP-STANDING-BASELINE-ACKNOWLEDGEMENT.json`

## 2026-07-28 — Standing Programme State · IN FORCE (official standing state)

- [STANDING-PROGRAMME-RECORD.md](./STANDING-PROGRAMME-RECORD.md) updated as the **official standing state** of APZQEP
- Restates: Foundation permanently closed; Engineering Platform v1 stable; Constitution baselined; five frozen baselines immutable; Test Execution Architecture baselined; Engineering Specification **NOT AUTHORISED**; governance pause; no automatic lifecycle progression
- Evidence: `20260728T143900Z-APZQEP-STANDING-PROGRAMME-STATE.json`
- Authorised next delivery: **None**
- Live status indexes updated for pointer/status only

## 2026-07-28 — APZQEP-ARCH-015 Owner Record · first Expansion Architecture complete · governance pause

- Owner Record filed: [test-execution/OES-ARCH-015/OWNER-RECORD.md](./test-execution/OES-ARCH-015/OWNER-RECORD.md) — recognises ARCH-015 as the first completed Architecture programme of the Expansion era
- Standing position restated: Test Execution Architecture **BASELINED**; Engineering Specification **PENDING OWNER AUTHORISATION** / **NOT AUTHORISED**
- Governance pause confirmed — no automatic commencement of `APZQEP-OES-ENG-090A` or any other programme
- Evidence: `20260728T142705Z-APZQEP-ARCH-015-OWNER-RECORD.json`
- Live status indexes updated for pointer/status only

## 2026-07-28 — APZQEP-ARCH-015 Owner Architecture Acceptance · ACCEPTED / APPROVED / CLOSED

- **APZQEP-ARCH-015** — Owner Architecture Decision recorded — **ACCEPTED / APPROVED / ARCHITECTURE BASELINED / CLOSED**
- Decision: [test-execution/OES-ARCH-015/OWNER-ACCEPTANCE.md](./test-execution/OES-ARCH-015/OWNER-ACCEPTANCE.md)
- Evidence: `20260728T141840Z-APZQEP-ARCH-015-ACCEPTANCE.json`
- ADRs **ADR-0075…ADR-0086** status updated to **Accepted**
- Architecture is now the authoritative baseline for Test Execution
- **Does not** authorise Engineering Specification, Engineering, certification, freeze, or versioning
- Recommended next programme remains **APZQEP-OES-ENG-090A** — **RECOMMENDATION ONLY / NOT AUTHORISED**
- Live status indexes updated for pointer/status only

## 2026-07-28 — APZQEP-ARCH-015 Test Execution Capability Architecture · IMPLEMENTED / AWAITING OWNER DECISION

- **APZQEP-ARCH-015** — Test Execution Capability Architecture — **IMPLEMENTED / AWAITING OWNER ARCHITECTURE DECISION**
- Pack: [test-execution/OES-ARCH-015/](./test-execution/OES-ARCH-015/README.md) — COMPLETE + PART-01…05 + APPENDIX-A…E + Owner Summary + Owner Decision template + Architecture Validation (**PASS**)
- ADRs **ADR-0075…ADR-0086** filed as **Proposed** pending Architecture Acceptance
- Frozen baselines preserved by reference only — no production engineering, no Engineering Specification, no certification, no freeze, no version change
- Evidence: `20260728T131515Z-APZQEP-ARCH-015.json`
- Recommended Owner decision: **ACCEPT**
- Recommended next programme (NOT AUTHORISED): `APZQEP-OES-ENG-090A` Domain Engineering Specification
- **Programme stop: OWNER ARCHITECTURE DECISION REQUIRED**

## 2026-07-28 — Standing Programme Record · IN FORCE

- Standing Programme Record filed: [STANDING-PROGRAMME-RECORD.md](./STANDING-PROGRAMME-RECORD.md) — **IN FORCE — OFFICIAL STARTING STATE**
- Foundation treated as **immutable history** (no further Foundation workstreams, no retroactive redesign, no reopening of governance without constitutional amendment)
- Operating principle locked: every new capability begins with an Owner-authorised Architecture programme — nothing else
- Live status indexes updated for pointer only — no Wave 2 programme invented; no frozen package modified
- Evidence: `20260728T125026Z-APZQEP-STANDING-PROGRAMME-RECORD.json`
- **Authorised next delivery: None.**

## 2026-07-28 — Final Executive Declaration · Foundation Programme permanently closed

- Owner Final Executive Declaration filed: [FINAL-EXECUTIVE-DECLARATION.md](./FINAL-EXECUTIVE-DECLARATION.md) — **DECLARED — FOUNDATION PROGRAMME PERMANENTLY CLOSED**
- Recognises **APZQEP Engineering Platform v1**; restates complete constitutional governance hierarchy; locks Foundation assets and five **1.0.0 CERTIFIED / FROZEN** production baselines as the reference for future capabilities
- Expansion remains **READY** but **not authorised** — indicative Wave 2 order recorded as planning guidance only; each capability still requires its own Owner-authorised Architecture programme
- Milestone cross-link updated: [ENGINEERING-PLATFORM-V1-MILESTONE.md](./ENGINEERING-PLATFORM-V1-MILESTONE.md)
- Live status indexes updated for pointer/status only: this README, foundation indexes — no re-litigation of already-closed decisions; no Wave 2 programme invented
- Evidence: `20260728T124501Z-APZQEP-FOUNDATION-FINAL-EXECUTIVE-DECLARATION.json`
- **APZQEP FOUNDATION PROGRAMME PERMANENTLY CLOSED. ENGINEERING PLATFORM V1. CAPABILITY EXPANSION READY. NO WAVE-2 PROGRAMMES AUTHORISED.**
- Authorised next delivery: **None.**

## 2026-07-28 — APZQEP-CONSTITUTION v1.0.0 Owner Ratification · RATIFIED / APPROVED / BASELINED

- **APZQEP-CONSTITUTION v1.0.0** — Owner Ratification recorded — **RATIFIED / APPROVED / BASELINED**
- Decision: [APZQEP-CONSTITUTION-OWNER-RATIFICATION.md](./APZQEP-CONSTITUTION-OWNER-RATIFICATION.md) — every constitutional area (Vision and Purpose, Authority Hierarchy, Architectural Principles, Engineering Principles, Governance Principles, Certification Principles, Versioning Policy, Freeze Policy, Change Control Principles, AI Engineering Principles, Platform Invariants, Mandatory Capability Lifecycle) ratified
- Constitution status updated: [APZQEP-CONSTITUTION.md](./APZQEP-CONSTITUTION.md) now **RATIFIED / APPROVED / BASELINED** — the constitutional entry point for APZQEP
- Milestone updated: [ENGINEERING-PLATFORM-V1-MILESTONE.md](./ENGINEERING-PLATFORM-V1-MILESTONE.md) — Product Constitution now cited as **v1.0.0 RATIFIED / BASELINED**
- Final declaration (Owner): the APZQEP Foundation Programme is fully complete; the engineering platform is Version 1, constitutionally governed, operationally validated, and supported by five certified and frozen production capabilities. Capability Expansion may begin only when an Owner authorises the first Wave 2 Architecture programme
- Live status indexes updated for pointer/status only: this README, `CHANGELOG.md`, `constitution/README.md`, `OWNER-PORTFOLIO-DECLARATION.md`, `ENGINEERING-LIFECYCLE-HANDBOOK.md`, foundation indexes (`CURRENT-MILESTONE`, `AI-MANIFEST`, `DOCUMENT-MAP`, `ACTIVE-BACKLOG`, `CURRENT-STATE`) — no re-litigation of any already-closed decision
- Evidence: `20260728T102844Z-APZQEP-CONSTITUTION-1.0.0-RATIFICATION.json`
- **APZQEP FOUNDATION FULLY COMPLETE. ENGINEERING PLATFORM V1. CAPABILITY EXPANSION READY. NO WAVE-2 PROGRAMMES AUTHORISED.**
- Authorised next delivery: **None.** Wave 2 requires a separate, future Owner-authorised Architecture programme — do not invent or start a Wave 2 ENG/ARCH programme id. No package source modified.

## 2026-07-28 — APZQEP-CONSTITUTION v1.0.0 prepared · Engineering Platform v1 recognised

- Permanent product entry Constitution authored: [APZQEP-CONSTITUTION.md](./APZQEP-CONSTITUTION.md) **v1.0.0** — **IMPLEMENTED / AWAITING OWNER RATIFICATION**
- Ratification template: [APZQEP-CONSTITUTION-OWNER-RATIFICATION.md](./APZQEP-CONSTITUTION-OWNER-RATIFICATION.md)
- Engineering Platform v1 milestone recognised: [ENGINEERING-PLATFORM-V1-MILESTONE.md](./ENGINEERING-PLATFORM-V1-MILESTONE.md)
- Distinguishes mature **engineering platform** from continuing **product capability** expansion
- Encodes Foundation-validated invariants (Domain / Infrastructure / Workbench separation; Workbench never owns behaviour; `availableActions` sole UI authority; CERT independence; Freeze separate from CERT; mandatory lifecycle)
- References Document 000, OES trilogy, and [constitution/](./constitution/README.md) companion articles — does not duplicate them
- Evidence: `20260728T102538Z-APZQEP-CONSTITUTION-1.0.0.json`
- No Wave 2 engineering authorised

## 2026-07-28 — APZQEP-PORTFOLIO-001 Owner Acceptance · ACCEPTED / APPROVED / CLOSED · APZQEP FOUNDATION FORMALLY COMPLETE

- **APZQEP-PORTFOLIO-001** — Owner Acceptance Decision recorded — **ACCEPTED / APPROVED / CLOSED**
- Decision: [portfolio/PORTFOLIO-001/OWNER-ACCEPTANCE.md](./portfolio/PORTFOLIO-001/OWNER-ACCEPTANCE.md) — every portfolio artefact (Frozen Capability Register, Certification Register, Architecture Register, Version Register, Accepted Limitations Register, Programme Metrics, Lessons Learned, Engineering Template Index, Foundation Completion Statement, Indicative Wave 2 Roadmap) accepted
- Formal declaration: **APZQEP FOUNDATION IS FORMALLY COMPLETE** — see [portfolio/PORTFOLIO-001/FOUNDATION-COMPLETION-STATEMENT.md](./portfolio/PORTFOLIO-001/FOUNDATION-COMPLETION-STATEMENT.md) — **EFFECTIVE**
- Governance directives now in force: Foundation Locked (future work extends rather than modifies the Foundation except through formally governed change programmes); APZOR remains the mandatory delivery lifecycle; the indicative Wave 2 roadmap remains a planning artefact only, **not** an engineering authorisation; no Wave 2 capability may commence without its own Owner-approved Architecture programme and the full lifecycle
- Status updated across the pack: `README.md`, `OWNER-SUMMARY.md`, `COMPLETE.md`, `EXECUTIVE-SUMMARY.md` all now **ACCEPTED / APPROVED / CLOSED**; `portfolio/README.md` current-programme row updated
- Live status indexes updated for pointer/status only: this README, `OWNER-PORTFOLIO-DECLARATION.md`, `ENGINEERING-LIFECYCLE-HANDBOOK.md`, foundation indexes (`CURRENT-MILESTONE`, `AI-MANIFEST`, `DOCUMENT-MAP`, `ACTIVE-BACKLOG`, `CURRENT-STATE`), `docs/engineering/oes/README.md` — no re-litigation of any already-closed decision
- Evidence: `20260728T100955Z-APZQEP-PORTFOLIO-001-ACCEPTANCE.json`
- No frozen package source modified; no Wave 2 programme identifier created or started
- Next: **None** under existing identifiers. **Authorised next delivery: None.** Any Wave 2 capability (Test Execution, Test Runs, Test Suites, Evidence Management, Defect Management, Coverage & Quality Analytics, Reporting & Dashboards, AI-Assisted Testing) requires a separate, future Owner-authorised Architecture programme — do not invent or start a Wave 2 ENG/ARCH programme id

## 2026-07-28 — APZQEP-PORTFOLIO-001 Foundation Completion & Portfolio Baseline authored · IMPLEMENTED / AWAITING OWNER ACCEPTANCE

- **APZQEP-PORTFOLIO-001** — Foundation Completion & Portfolio Baseline — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**
- Nature: **portfolio / documentation baseline only** — no new functionality, no React/Next.js, no Domain/Infrastructure/Workbench engineering, no version bumps to any frozen package
- Authority: Owner Portfolio Declaration (2026-07-28) — [OWNER-PORTFOLIO-DECLARATION.md](./OWNER-PORTFOLIO-DECLARATION.md) — recommending this programme be inserted before Wave 2
- Consolidates the complete First Capability Wave (Requirements, Traceability, Verification, Test Specifications, Test Plans — all **1.0.0 CERTIFIED / FROZEN**) into a single canonical pack: Frozen Capability Register, Certification Register, Architecture Baseline Register, Version Baseline Register, Known Limitations Register (by reference, no new limitations invented), Programme Metrics, Lessons Learned, Standard Templates Index
- Publishes an **indicative, NOT authorised** Wave 2 roadmap (Test Execution, Test Runs, Test Suites, Evidence Management, Defect Management, Coverage & Quality Analytics, Reporting & Dashboards, AI-Assisted Testing) — each requires its own future, separate Owner-authorised Architecture programme reusing the validated APZOR model
- Publishes a formal Foundation Completion Statement — Foundation phase recorded as complete; Expansion begins only after Owner Acceptance of this pack **and** separate Wave 2 programme instructions
- Cites (does not amend) [APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md](../../engineering/oes/APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md) — Operating Model **FULLY VALIDATED THROUGH PRACTICE**
- Pack: [portfolio/PORTFOLIO-001/](./portfolio/PORTFOLIO-001/README.md) · pointer: [portfolio/README.md](./portfolio/README.md)
- Lightly updated for pointer/status only: this README, `ENGINEERING-LIFECYCLE-HANDBOOK.md`, foundation indexes (`CURRENT-MILESTONE`, `AI-MANIFEST`, `DOCUMENT-MAP`, `ACTIVE-BACKLOG`, `CURRENT-STATE`), `docs/engineering/oes/README.md` — no re-litigation of any already-closed decision
- Evidence: `20260728T094331Z-APZQEP-PORTFOLIO-001.json`
- No frozen package source modified; no Wave 2 programme identifier created or started
- Next: Owner Acceptance of `APZQEP-PORTFOLIO-001` (separate Owner Decision) — **not performed** under this instruction; no Wave 2 programme authorised

## 2026-07-28 — APZQEP-FREEZE-080A Owner Freeze Decision · FROZEN / APPROVED / CLOSED · `@apzhub/qep-test-plans` 1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED

- **APZQEP-FREEZE-080A** — Owner Freeze Decision recorded — **FROZEN / APPROVED / CLOSED**
- Decision: [OWNER-FREEZE-DECISION.md](./test-plans/freeze/OWNER-FREEZE-DECISION.md) — Test Plans capability **1.0.0** confirmed as the authoritative production baseline; class **PRODUCTION_READY_WITH_LIMITATIONS** preserved
- `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED** — Domain, Infrastructure, and Workbench surfaces, public REST `/api/v1/qep/plans/*`, contracts, and domain events are now under freeze control; only the **1.0.x** patch line is available, and only under new Owner-authorised programmes
- Freeze notice published: [test-plans/capability-certification/FREEZE-NOTICE.md](./test-plans/capability-certification/FREEZE-NOTICE.md); freeze pack: [test-plans/freeze/README.md](./test-plans/freeze/README.md)
- Permanent release evidence updated: [docs/releases/apzqep/test-plans/1.0.0/](../../releases/apzqep/test-plans/1.0.0/README.md) — **CERTIFIED / FROZEN / BASELINE ESTABLISHED**
- Recorded limitations L-01, L-02, L-03, P-01…P-04 accepted in the frozen baseline as scope-defining, not blocking
- Governance documentation across `capability-certification/`, `test-plans/`, `apzqep/`, foundation, and OES trees updated to reflect **FROZEN / APPROVED / CLOSED**
- Portfolio note: Requirements, Traceability, Verification, Test Specifications, and Test Plans are now **all 1.0.0 CERTIFIED / FROZEN**
- Evidence: `20260728T092059Z-APZQEP-TEST-PLANS-1.0.0-FREEZE.json`
- No further Test Plans work is authorised under existing identifiers (`APZQEP-CERT-080A`, `APZQEP-FREEZE-080A`, or any consumed upstream identifier). Future work requires a new, separate Owner-authorised programme.

## 2026-07-28 — APZQEP-CERT-080A Owner Certification Decision · CERTIFIED / APPROVED / CLOSED · `@apzhub/qep-test-plans` promoted to 1.0.0 · APZQEP-FREEZE-080A prepared

- **APZQEP-CERT-080A** — Owner Certification Decision recorded — **CERTIFIED / APPROVED / CLOSED**
- Decision: [OWNER-ACCEPTANCE.md](./test-plans/capability-certification/OWNER-ACCEPTANCE.md) — Owner selected **Option A**, accepting class **PRODUCTION_READY_WITH_LIMITATIONS** and authorising Version Promotion to **1.0.0**
- Version Promotion **APPLIED**: `@apzhub/qep-test-plans` **0.2.0 → 1.0.0** — see [VERSION-PROMOTION.md](./test-plans/capability-certification/VERSION-PROMOTION.md); `packages/qep-test-plans/package.json` and `modules/qep-test-plans/module.yaml` both now **1.0.0**
- Permanent release evidence published: [docs/releases/apzqep/test-plans/1.0.0/](../../releases/apzqep/test-plans/1.0.0/README.md) — **CERTIFIED / APPROVED / CLOSED**
- Freeze decision: **ELIGIBLE / NOT YET AUTHORISED** — no Freeze applied under CERT-080A; a separate Owner Freeze Decision is required
- Governance documentation across `capability-certification/`, `test-plans/`, `apzqep/`, foundation, and OES trees updated to reflect **CERTIFIED / CLOSED**, package **1.0.0**, and Freeze **ELIGIBLE / NOT YET AUTHORISED**
- Authorises next: **APZQEP-FREEZE-080A — Test Plans Capability Freeze Decision** — pack prepared and **IMPLEMENTED / AWAITING OWNER FREEZE DECISION**; see [test-plans/freeze/README.md](./test-plans/freeze/README.md) and [test-plans/freeze/OWNER-FREEZE-DECISION.md](./test-plans/freeze/OWNER-FREEZE-DECISION.md) (template, PENDING)
- Evidence: `20260728T090246Z-APZQEP-CERT-080A-ACCEPTANCE.json`, `20260728T090300Z-APZQEP-FREEZE-080A.json`
- Next: Owner Freeze Decision for `APZQEP-FREEZE-080A` (separate Owner Decision) — **not performed** under this instruction; no Freeze applied; no further code changes

## 2026-07-28 — APZQEP-CERT-080A Test Plans Integrated Capability Certification implemented · awaiting Owner Certification Decision

- **APZQEP-CERT-080A** — independent Capability assurance — **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION**
- Certification level: **Capability Certification** (Domain + Infrastructure + Workbench assessed together, end-to-end) — following the pattern established by **APZQEP-CERT-050D** for Test Specifications ([OES-CERTIFICATION-LEVELS.md](../../engineering/oes/OES-CERTIFICATION-LEVELS.md))
- Evaluates the complete Test Plans capability **as delivered** across three already Component-Certified layers (**CERT-060A** Domain 0.1.0, **CERT-060B** Infrastructure 0.2.0, **CERT-070A** Workbench 0.2.0) — no engineering, no remediation, no behavioural code changes performed under this programme ([OES-CERTIFICATION-INDEPENDENCE.md](../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md))
- Assessed: cross-layer architecture integration, consolidated engineering evidence, `availableActions` cross-layer contract integrity (Domain → Infrastructure → Workbench), end-to-end lifecycle completeness, security/permission flow (`qep.plan.*`), audit and observability, documentation completeness, consolidated known-limitations review, and full-capability operational readiness
- Tests re-verified independently: **124/124 PASS** (11 test files — `packages/qep-test-plans` 104 + `apps/web/components/qep/qep-test-plan-views.test.tsx` 15 + `apps/web/lib/api/v1/handlers/qep-test-plan.test.ts` 5); typecheck **PASS**; Playwright spec confirmed present, not re-executed
- Recommended class: **PRODUCTION_READY_WITH_LIMITATIONS**
- Version recommendation: promote **0.2.0 → 1.0.0** upon Owner Certification Decision — **not applied** under this programme
- Freeze recommendation: **FREEZE ELIGIBLE** upon Owner Certification Acceptance — a **separate** subsequent Owner Freeze Decision would be required (mirrors CERT-050D → Owner Freeze Decision); **not executed** under this programme
- Consolidated limitations reviewed as scope-defining, not blocking: inherited Infrastructure **L-01** (Compare deferred), **L-02** (items DTO-bound), **L-03** (coverage, justified); inherited Workbench **P-01…P-04** (test-authoring breadth, saved-view preferences) — see [KNOWN-LIMITATIONS.md](./test-plans/capability-certification/KNOWN-LIMITATIONS.md)
- Pack: [test-plans/capability-certification/](./test-plans/capability-certification/README.md) · pointer: [test-plans/CERT-080A/](./test-plans/CERT-080A/README.md)
- Draft release evidence: [docs/releases/apzqep/test-plans/1.0.0/](../../releases/apzqep/test-plans/1.0.0/README.md) — DRAFT / PENDING OWNER CERTIFICATION DECISION
- Evidence: `20260728T081500Z-APZQEP-CERT-080A.json`
- CERT-070A closure status reconciled: **APZQEP-CERT-070A** Owner Certification Decision (already recorded 2026-07-28) now correctly reflected as **CERTIFIED / APPROVED / CLOSED** across its README/COMPLETE/OWNER-SUMMARY (previously stale at "awaiting decision" in those three documents only; `OWNER-ACCEPTANCE.md` itself already recorded the decision)
- Next: Owner Certification Decision for `APZQEP-CERT-080A` (separate Owner Decision) — **not performed** under this instruction; no Version Promotion or Freeze applied

## 2026-07-28 — APZQEP-CERT-070A Test Plans Workbench Component Certification implemented · awaiting Owner Certification Decision

- **APZQEP-CERT-070A** — independent Workbench Component assurance — **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION**
- Certification level: **Component Certification** (Workbench) — explicitly **not** Capability Certification ([OES-CERTIFICATION-LEVELS.md](../../engineering/oes/OES-CERTIFICATION-LEVELS.md))
- Evaluates the Workbench **as delivered** under `APZQEP-ENG-070A` (ACCEPTED / CLOSED, 2026-07-28) — no engineering, no remediation, no React/Next.js edits performed under this programme ([OES-CERTIFICATION-INDEPENDENCE.md](../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md))
- Assessed: governance lifecycle completeness, ARCH-014/OES-ENG-070A conformance, presentation-layer integrity, `availableActions` sole action authority, Domain/Infrastructure contract preservation, L-01/L-02 honesty, accessibility (WCAG AA intent), documentation, and operational readiness
- Tests re-verified independently: **104/104 package tests PASS**, **20/20 presentation-specific PASS** (5 route + 15 views/journey), typecheck **PASS**; Playwright spec confirmed present, not re-executed
- Recommended class: **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS**
- Version recommendation: remain **0.2.0** (label **WORKBENCH COMPONENT CERTIFIED** upon Owner Decision) · Freeze **NOT AUTHORISED** · 1.0.0 **not recommended**
- Limitations reviewed as scope-defining, not blocking: inherited Infrastructure **L-01** (Compare governed unavailable), **L-02** (items DTO-bound); presentation-level **P-01…P-04** (test-authoring breadth, saved-view preferences) from [workbench/KNOWN-LIMITATIONS.md](./test-plans/workbench/KNOWN-LIMITATIONS.md)
- Pack: [test-plans/CERT-070A/](./test-plans/CERT-070A/README.md)
- Evidence: `20260728T073000Z-APZQEP-CERT-070A.json`
- Next: Owner Certification Decision for `APZQEP-CERT-070A` (separate Owner Decision) — **not performed** under this instruction; no Capability Certification, Version Promotion, or Freeze

## 2026-07-28 — APZQEP-ENG-070A Owner Acceptance · PROGRAMME CLOSED

- **APZQEP-ENG-070A** — **ACCEPTED / APPROVED / PROGRAMME CLOSED**
- Owner assessment confirmed: correct consumption of certified Domain 0.1.0 and Infrastructure 0.2.0 without contract change; complete Workbench presentation layer; Compare presented as governed unavailable per L-01; Items presented per the approved L-02 contract; actions derived exclusively from `availableActions`; no business rules introduced
- Binding invariant reaffirmed: _"The Workbench is a pure presentation layer. It renders state supplied by the certified Infrastructure and executes only actions explicitly authorised through the `availableActions` contract."_
- Decision: [OWNER-ACCEPTANCE.md](./test-plans/workbench/OWNER-ACCEPTANCE.md)
- Evidence: `20260728T072749Z-APZQEP-ENG-070A-ACCEPTANCE.json`
- Authorises next: **APZQEP-CERT-070A — Test Plans Workbench Component Certification** (independent assurance; no engineering)

## 2026-07-28 — APZQEP-ENG-070A Test Plans Workbench Engineering implemented · Engineering Completion Review PASS · awaiting Owner Acceptance

- **APZQEP-ENG-070A** — Test Plans Workbench Engineering — **IMPLEMENTED / ENGINEERING COMPLETION REVIEW: PASS / READY FOR OWNER ACCEPTANCE**
- Presentation only — package remains `@apzhub/qep-test-plans` **0.2.0**; no Domain/Infrastructure contract changes
- Delivers: module registration & Sidebar IA, routes & deep links, typed REST client, Dashboard/Explorer/Review/Search, Inspector (Summary/Metadata/Items/Relationships/History/Versions), Create/Edit Draft, the `availableActions`-only Action Bar (all 19 catalogued actions incl. `updateMetadata`/`transferOwnership`/`updateAssignment`/`updateSchedule` structural dialogs), a governed-unavailable Compare route (**L-01**), and an Items panel bound to the Plan DTO (**L-02**)
- Test evidence: **20/20 Vitest PASS** (5 presentation-route + 15 views/journey) + Playwright suite (`apzqep-eng-070a-test-plans-workbench.spec.ts`) covering smoke, authenticated journeys, accessibility (axe), and keyboard operability
- Consumes as immutable baselines: **APZQEP-ARCH-014** (ACCEPTED / ARCHITECTURE BASELINED / CLOSED), **APZQEP-OES-ENG-070A** (ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED), Domain `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** (CERT-060A), Infrastructure `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (CERT-060B)
- Pack: [test-plans/workbench/](./test-plans/workbench/README.md)
- Evidence: `20260728T071000Z-APZQEP-ENG-070A-ECR.json`
- Next: Owner Acceptance Review of `APZQEP-ENG-070A` (separate Owner Decision) — **not performed** under this instruction; no Component/Capability Certification, Version Promotion, or Freeze

## 2026-07-28 — APZQEP-OES-ENG-070A Owner Acceptance · ENGINEERING SPECIFICATION BASELINED / PROGRAMME CLOSED

- **APZQEP-OES-ENG-070A** — **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / PROGRAMME CLOSED**
- Decision: [OWNER-ACCEPTANCE.md](./test-plans/OES-ENG-070A/OWNER-ACCEPTANCE.md)
- Evidence: `20260728T065105Z-APZQEP-OES-ENG-070A-ACCEPTANCE.json`
- Authorises next: **APZQEP-ENG-070A** — Test Plans Workbench Engineering implementation (authorised; delivered — see entry above)

## 2026-07-28 — APZQEP-OES-ENG-070A Test Plans Workbench Engineering Specification implemented · awaiting Owner Acceptance

- **APZQEP-OES-ENG-070A** — Test Plans Workbench Engineering Specification — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**
- Specification only — no React/Next.js, no production code; translates the Accepted Architecture (APZQEP-ARCH-014) into an implementable delivery contract
- Consumes as immutable baselines: **APZQEP-ARCH-014** (ACCEPTED / ARCHITECTURE BASELINED / CLOSED), Domain `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** (CERT-060A), Infrastructure `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (CERT-060B)
- Defines 18 ordered work packages (WP-01…WP-18) mapped 1:1 to ARCH-014 surfaces, a technical approach (Next.js App Router, React, TS strict, Tailwind, shadcn, Lucide, TanStack Query, RHF+Zod), the normative `availableActions` action rendering algorithm, and a full testing/accessibility pyramid (14 Playwright journeys, 6 a11y gates, 6 negative tests)
- Honestly specifies the **Compare presentation contract** for Infrastructure limitation **L-01** (governed unavailable route, no fabricated client-side diff) and the **items binding contract** for **L-02** (items read from the Plan DTO; no dedicated endpoint invented)
- AI/MCP boundaries with an explicit, non-bypassable no-approve-bypass rule
- Pack: [test-plans/OES-ENG-070A/](./test-plans/OES-ENG-070A/README.md)
- Pointer: [engineering/oes/APZQEP/OES-ENG-070A-Test-Plans-Workbench-Engineering/](../../engineering/oes/APZQEP/OES-ENG-070A-Test-Plans-Workbench-Engineering/README.md)
- Evidence: `20260728T063000Z-APZQEP-OES-ENG-070A.json`
- Next: Owner Acceptance of this OES, then a **separate** Owner Programme Instruction to authorise `APZQEP-ENG-070A` implementation — **no Workbench code before then**

## 2026-07-28 — APZQEP-ARCH-014 Owner Architecture Acceptance · ARCHITECTURE BASELINED / PROGRAMME CLOSED

- **APZQEP-ARCH-014** — **ACCEPTED / APPROVED / ARCHITECTURE BASELINED / PROGRAMME CLOSED**
- Owner directive (binding invariant): _"The Workbench SHALL never determine what a user may do"_ — actions only from server `availableActions`
- Decision: [OWNER-ACCEPTANCE.md](./test-plans/OES-ARCH-014/OWNER-ACCEPTANCE.md)
- Evidence: `20260728T062849Z-APZQEP-ARCH-014-ACCEPTANCE.json`
- Authorises next: **APZQEP-OES-ENG-070A** — Test Plans Workbench Engineering Specification (preparation authorised)

## 2026-07-28 — APZQEP-ARCH-014 Test Plans Workbench Architecture implemented · awaiting Owner Acceptance

- **APZQEP-ARCH-014** — Test Plans Workbench Architecture — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**
- Architecture only — no React/Next.js, no Workbench Engineering, no production code
- Consumes as immutable baselines: **APZQEP-ARCH-013** (ACCEPTED / BASELINED), Domain `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** (CERT-060A), Infrastructure `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (CERT-060B)
- Defines shell placement, routes/deep links, session restore, Dashboard, Explorer, Review queue, Search, Plan Inspector panels (Summary, Metadata, Items/Linked Specifications, Relationships, History, Versions, Audit), Edit Draft, and an action surface driven solely by server `availableActions`
- Persona journeys (Viewer/Tester/Lead/QA Manager) mapped 1:1 to certified statuses and discrete lifecycle action endpoints
- Honestly represents Infrastructure limitations **L-01** (deferred version compare — governed unavailable slot with forward-compatible presentation contract) and **L-02** (no dedicated items GET) without requiring their remediation under this programme
- Performance (pageSize ≤ 50, virtualisation SHOULD), WCAG AA, security (no client-invented grants), observability (UI telemetry events), AI/MCP boundaries (no approve bypass)
- Pack: [test-plans/OES-ARCH-014/](./test-plans/OES-ARCH-014/README.md)
- Pointer: [engineering/oes/APZQEP/OES-ARCH-014-Test-Plans-Workbench-Architecture/](../../engineering/oes/APZQEP/OES-ARCH-014-Test-Plans-Workbench-Architecture/README.md)
- Evidence: `20260728T061500Z-APZQEP-ARCH-014.json`
- Next: Owner Architecture Acceptance, then a separate Owner Instruction for Test Plans Workbench Engineering (placeholder **APZQEP-OES-ENG-060C**)

## 2026-07-28 — APZQEP-CERT-060B Owner Certification Decision · PROGRAMME CLOSED

- **APZQEP-CERT-060B** — **CERTIFIED / APPROVED / CLOSED**
- Production classification: **INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS**
- Package `@apzhub/qep-test-plans` remains **0.2.0** — **INFRASTRUCTURE COMPONENT CERTIFIED**; 1.0.0 promotion not authorised
- Freeze: **NOT AUTHORISED** — Workbench not started, Capability integration not certified
- Limitations L-01/L-02/L-03 assessed as scope-defining, not blocking (see [KNOWN-LIMITATIONS-REVIEW.md](./test-plans/CERT-060B/KNOWN-LIMITATIONS-REVIEW.md))
- Decision: [OWNER-ACCEPTANCE.md](./test-plans/CERT-060B/OWNER-ACCEPTANCE.md)
- Evidence: `20260728T060500Z-APZQEP-CERT-060B-ACCEPTANCE.json`
- Authorises next: **APZQEP-ARCH-014** — Test Plans Workbench Architecture preparation

## 2026-07-27 — APZQEP-CERT-060B Infrastructure Component Certification prepared · awaiting Owner Decision

- **APZQEP-CERT-060B** — independent Infrastructure Component assurance — **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION**
- Recommended class: **INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS**
- Version recommendation: remain **0.2.0** · Freeze **NOT RECOMMENDED**
- Limitations assessed as scope-defining (not blocking)
- Tests re-verified: **99 PASS** · typecheck PASS · no engineering
- Pack: [test-plans/CERT-060B/](./test-plans/CERT-060B/README.md)
- Evidence: `20260727T201000Z-APZQEP-CERT-060B.json`

## 2026-07-27 — APZQEP-ENG-060B Owner Acceptance · PROGRAMME CLOSED

- **APZQEP-ENG-060B** — **ACCEPTED WITH RECORDED LIMITATIONS / APPROVED / CLOSED**
- ECR conditions disposed: C-01 deferred · C-02 approved variance · C-03 accepted · C-04 justification accepted
- Limitations: [KNOWN-LIMITATIONS.md](./test-plans/infrastructure/KNOWN-LIMITATIONS.md)
- Acceptance: [OWNER-ACCEPTANCE.md](./test-plans/infrastructure/OWNER-ACCEPTANCE.md)
- Evidence: `20260727T194000Z-APZQEP-ENG-060B-ACCEPTANCE.json`
- Reference orchestration Infrastructure (with limitations)
- Next named: **APZQEP-CERT-060B** (await Owner Programme Instruction)

## 2026-07-27 — APZQEP-ENG-060B Engineering Completion Review · PASS WITH CONDITIONS

- **APZQEP-ENG-060B** — ECR (OES-002 v1.1.0) — **PASS WITH CONDITIONS / READY FOR OWNER ACCEPTANCE**
- Domain integrity **PASS** · no Infrastructure business rules · no code changes under ECR
- Conditions: C-01 compare missing · C-02 GET items variance · C-03 discrete action paths · C-04 coverage justification (lines 77.07%)
- ECR: [ENGINEERING-COMPLETION-REVIEW.md](./test-plans/infrastructure/ENGINEERING-COMPLETION-REVIEW.md)
- Evidence: `20260727T193200Z-APZQEP-ENG-060B-ECR-PASS-WITH-CONDITIONS.json`

## 2026-07-27 — APZQEP-ENG-060B Test Plans Infrastructure Engineering implemented · awaiting ECR

- **APZQEP-ENG-060B** — Test Plans Infrastructure Engineering — **IMPLEMENTED / AWAITING ENGINEERING COMPLETION REVIEW (ECR)**
- Package: `@apzhub/qep-test-plans` **0.2.0** (Infrastructure layer added; Domain unchanged, still **0.1.0 CERTIFIED** semantics)
- Delivered: repositories (in-memory + Postgres via `@apzhub/config`), application service, DTO adapters, permissions, REST under `/api/v1/qep/plans/*`, platform gateway wiring (`gateway.qep.plans`), search/audit/observability hooks
- Migrations: **0085** (tables), **0086** (RLS)
- Contracts: `@apzhub/qep-contracts` `QEP_TEST_PLAN_PERMISSIONS`, `computeQepTestPlanAvailableActions`
- Module: `modules/qep-test-plans/module.yaml` — permissions catalogue only, no Workbench
- Pack: [test-plans/infrastructure/](./test-plans/infrastructure/README.md)
- Evidence: `20260727T182000Z-APZQEP-ENG-060B.json`
- No Domain command/lifecycle/invariant/event changes; no Workbench/UI
- Next: Engineering Completion Review (ECR), then Owner Acceptance

## 2026-07-27 — APZQEP-OES-ENG-060B Infrastructure Engineering Specification · Owner Accepted / BASELINED

- **APZQEP-OES-ENG-060B** — Test Plans Infrastructure Engineering Specification — **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED**
- Specification only — no migrations, repositories, REST, Workbench, or production code
- Consumes `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** as immutable
- Reference orchestration Infrastructure patterns recorded (reuse without shared business logic)
- Pack: [test-plans/OES-ENG-060B/](./test-plans/OES-ENG-060B/README.md)
- Evidence: `20260727T180300Z-APZQEP-OES-ENG-060B.json`
- Next after Acceptance: **APZQEP-ENG-060B** (separate Owner Instruction)

## 2026-07-27 — APZQEP-CERT-060A Owner Certification Decision · PROGRAMME CLOSED

- **APZQEP-CERT-060A** — **CERTIFIED / APPROVED / CLOSED** (Component / Domain Certification)
- Class: **DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS** (distinct from capability PRWL)
- Package: `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** (no 1.0.0 promotion)
- Freeze: **NOT AUTHORISED**
- Decision: [OWNER-ACCEPTANCE.md](./test-plans/domain-certification/OWNER-ACCEPTANCE.md)
- Evidence: `20260727T174500Z-APZQEP-CERT-060A-ACCEPTANCE.json`
- Precedent: [OES-CERTIFICATION-LEVELS.md](../engineering/oes/OES-CERTIFICATION-LEVELS.md) — Component / Capability / Platform
- Next named: **APZQEP-OES-ENG-060B** (await Owner Programme Instruction)

## 2026-07-27 — APZQEP-CERT-060A Domain Certification prepared · awaiting Owner Decision

- **APZQEP-CERT-060A** — independent Domain assurance — **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION**
- Quality gates ALL PASS · tests **62 PASS** · typecheck PASS · no engineering
- Recommended class: **DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS**
- Version recommendation: remain **0.1.0** (no capability 1.0.0 / Freeze)
- Pack: [test-plans/domain-certification/](./test-plans/domain-certification/README.md)
- Evidence: `20260727T174000Z-APZQEP-CERT-060A.json`
- Lifecycle Handbook: [ENGINEERING-LIFECYCLE-HANDBOOK.md](./ENGINEERING-LIFECYCLE-HANDBOOK.md) **1.0.0**
- Operating Model Validation: [APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md](../engineering/oes/APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md)

## 2026-07-27 — APZQEP-ENG-060A Owner Acceptance · PROGRAMME CLOSED

- **APZQEP-ENG-060A** — **ACCEPTED / APPROVED / CLOSED**
- Coverage justification **ACCEPTED** — behavioural completeness precedent established
- Acceptance: [OWNER-ACCEPTANCE.md](./test-plans/domain/OWNER-ACCEPTANCE.md)
- Evidence: `20260727T165200Z-APZQEP-ENG-060A-ACCEPTANCE.json`
- Next named programme: **APZQEP-CERT-060A** (await Owner Programme Instruction)
- No further engineering under ENG-060A

## 2026-07-27 — APZQEP-ENG-060A Engineering Completion Review PASS

- **APZQEP-ENG-060A** — **ECR PASS / READY FOR OWNER ACCEPTANCE** (OES-002 v1.1.0)
- Coverage deviations justified (defensive residuals only) — no artificial inflation
- ECR: [ENGINEERING-COMPLETION-REVIEW.md](./test-plans/domain/ENGINEERING-COMPLETION-REVIEW.md)
- Evidence: `20260727T163600Z-APZQEP-ENG-060A-ECR-PASS.json`
- Practice note (OES-000 candidate): [OES-COVERAGE-AND-BEHAVIOURAL-COMPLETENESS.md](../engineering/oes/OES-COVERAGE-AND-BEHAVIOURAL-COMPLETENESS.md)

## 2026-07-27 — APZQEP-ENG-060A Domain Engineering implemented · awaiting ECR

- **APZQEP-ENG-060A** — Test Plans Domain Engineering — **IMPLEMENTED / AWAITING ECR**
- Package: `@apzhub/qep-test-plans` **0.1.0** (Domain only)
- Tests: **62 PASS** · typecheck PASS
- Coverage (package-scoped): lines 92.94% · funcs 94.59% · branches 78.91%
- Pack: [test-plans/domain/](./test-plans/domain/README.md)
- Evidence: `20260727T155500Z-APZQEP-ENG-060A.json`
- No Infrastructure / REST / Workbench; ECR / Acceptance / CERT / Freeze not authorised

## 2026-07-27 — APZQEP-OES-ENG-060A Owner Acceptance · ENGINEERING SPECIFICATION BASELINED

- **APZQEP-OES-ENG-060A** — **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED**
- Evidence: `20260727T151900Z-APZQEP-OES-ENG-060A-ACCEPTANCE.json`
- Next named programme: **APZQEP-ENG-060A** (await Owner Programme Instruction)
- No production code under OES identifier

## 2026-07-27 — APZQEP-OES-ENG-060A Domain Engineering Specification implemented

- **APZQEP-OES-ENG-060A** — Test Plans Domain Engineering Specification
- Status: **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**
- Nature: Domain specification only — no implementation / no production code
- Pack: [test-plans/OES-ENG-060A/](./test-plans/OES-ENG-060A/README.md)
- Evidence: `20260727T104200Z-APZQEP-OES-ENG-060A.json`
- Architecture baseline: ARCH-013 **ACCEPTED**

## 2026-07-27 — APZQEP-ARCH-013 Owner Architecture Acceptance · BASELINED

- **APZQEP-ARCH-013** — **ACCEPTED / APPROVED / ARCHITECTURE BASELINED / CLOSED**
- Evidence: `20260727T101800Z-APZQEP-ARCH-013-ACCEPTANCE.json`
- Next named programme: **APZQEP-OES-ENG-060A** (await Owner Programme Instruction)
- No engineering under ARCH-013

## 2026-07-27 — APZQEP-ARCH-013 Test Plans Architecture implemented

- **APZQEP-ARCH-013** / **APZQEP-OES-ARCH-013** — Test Plans Capability Architecture
- Status: **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**
- Nature: architecture only — no engineering / no production code
- Pack: [test-plans/OES-ARCH-013/](./test-plans/OES-ARCH-013/README.md)
- Evidence: `20260727T100000Z-APZQEP-ARCH-013.json`
- Frozen dependencies: Requirements · Traceability · Verification · Test Specs **1.0.0**

## 2026-07-27 — Test Specifications 1.0.0 Owner Freeze · BASELINE ESTABLISHED

- `@apzhub/qep-test-specifications` **1.0.0 CERTIFIED / FROZEN**
- Class preserved: **PRODUCTION_READY_WITH_LIMITATIONS**
- Freeze decision: [test-specifications/freeze/OWNER-FREEZE-DECISION.md](./test-specifications/freeze/OWNER-FREEZE-DECISION.md)
- Evidence: `20260727T095000Z-APZQEP-TEST-SPECIFICATIONS-1.0.0-FREEZE.json`
- Release: [docs/releases/apzqep/test-specifications/1.0.0/](../../releases/apzqep/test-specifications/1.0.0/README.md)
- Foundational quartet complete: Requirements · Traceability · Verification · Test Specifications — all **1.0.0 CERTIFIED / FROZEN**

## 2026-07-27 — APZQEP-CERT-050D Owner Certification Decision CERTIFIED / CLOSED

- **APZQEP-CERT-050D** — **CERTIFIED / APPROVED / PROGRAMME CLOSED**
- Class: **PRODUCTION_READY_WITH_LIMITATIONS**
- Package: `@apzhub/qep-test-specifications` **1.0.0 PROMOTED / CERTIFIED**
- Freeze: **eligible, not granted** — Owner Freeze Review opened
- Evidence: `20260727T081100Z-APZQEP-CERT-050D-ACCEPTANCE.json`
- Freeze pack: [test-specifications/freeze/](./test-specifications/freeze/README.md)

## 2026-07-27 — APZQEP-CERT-050D implemented · awaiting Owner Certification Decision

- **APZQEP-CERT-050D** — Test Specifications Capability Certification pack complete
- Recommended class: **PRODUCTION_READY_WITH_LIMITATIONS** · outcome **PASS**
- Package packaging: `@apzhub/qep-test-specifications` **1.0.0** (freeze not binding)
- Tests: **139 PASS** · typecheck PASS
- Independence practice recorded: [OES-CERTIFICATION-INDEPENDENCE.md](../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md)
- Certification Hold acknowledged; ENG-050C remains CLOSED
- Evidence: `20260727T072100Z-APZQEP-ENG-050C-CERTIFICATION-HOLD.json` · `20260727T073000Z-APZQEP-CERT-050D.json`
- Status: **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION**

## 2026-07-27 — ENG-050C Owner Acceptance ACCEPTED / CLOSED

- **APZQEP-ENG-050C** — Owner Acceptance Review — **ACCEPTED / APPROVED / PROGRAMME CLOSED**
- Evidence: `20260727T065800Z-APZQEP-ENG-050C-ACCEPTANCE.json`
- Capability **authorised for Capability Certification** (separate CERT programme)
- Version Promotion to 1.0.0 / Freeze — not yet authorised
- Programme closed; no further ENG-050C engineering

## 2026-07-27 — ENG-050C Engineering Completion Review PASS

### Review

- **ECR PASS** under OES-002 v1.1.0 — [ENGINEERING-COMPLETION-REVIEW.md](./test-specifications/workbench/ENGINEERING-COMPLETION-REVIEW.md)
- Evidence: `20260727T063400Z-APZQEP-ENG-050C-ECR-PASS.json`
- Status: **READY FOR OWNER ACCEPTANCE** (Acceptance not yet granted)
- Certification / Version Promotion / Freeze remain **NOT AUTHORISED**

## 2026-07-27 — ENG-050C implementation complete · OES-002 v1.1.0 ECR · ready for ECR

### Governance

- **OES-002** revised to **v1.1.0** — Engineering Completion Review (ECR) mandatory before ENG Owner Acceptance
- ENG-050C Interim Owner Review recorded — Acceptance withheld pending gates

### Engineering

- WP-01…18 completed (a11y focus trap, Playwright authenticated journeys + axe, Completion Report)
- Pack: [test-specifications/workbench/COMPLETION-REPORT.md](./test-specifications/workbench/COMPLETION-REPORT.md)
- Status: **READY FOR ECR** — Owner Acceptance **not** yet granted

## 2026-07-27 — OES-ENG-050C Accepted · ENG-050C Workbench implementation started

### Owner Decisions

- **OES-ENG-050C** — **ACCEPTED / IMPLEMENTATION AUTHORISED**
- **ADR-0074** — no contract change in ENG-050C; `returnToDraft` deferred to separate delta

### Engineering (Workbench)

- Presentation contracts in `@apzhub/qep-test-specifications` **0.3.0**
- Module `modules/qep-test-specifications/module.yaml`
- Views / API client / router branch under `apps/web`
- Product pack: [test-specifications/workbench/](./test-specifications/workbench/README.md)
- Playwright: `apzqep-eng-050c-test-specifications-workbench.spec.ts`

## 2026-07-27 — Governance trilogy frozen · ARCH-012 Accepted · OES-ENG-050C ready

### Governance

- **OES-002** — **ACCEPTED / APPROVED / FROZEN 1.0.0** — [acceptance](../../engineering/oes/OES-002-OWNER-ACCEPTANCE.md)
- OES-000 / OES-001 / OES-002 governance trilogy complete — change control via semantic versioning

### Test Specifications

- **ENG-050B** — **ACCEPTED** — [OWNER-ACCEPTANCE](./test-specifications/engine/OWNER-ACCEPTANCE.md)
- **OES-ARCH-012** — **ACCEPTED / ARCHITECTURE BASELINED** — [COMPLETE.md](../../engineering/oes/APZQEP/OES-ARCH-012-Test-Specifications-Workbench-Architecture/COMPLETE.md)
- **ADR-0074** — Rejected → Draft vs `availableActions` — **ACCEPTED**
- **OES-ENG-050C** — Workbench Engineering OES — **READY FOR OWNER REVIEW** — [COMPLETE.md](../../engineering/oes/APZQEP/OES-ENG-050C-Test-Specifications-Workbench-Engineering/COMPLETE.md)

### Next (gated)

- Owner Acceptance of OES-ENG-050C before Workbench implementation
- Certification **NOT AUTHORISED**

## 2026-07-26 — OES-000 FROZEN + OES-001 + OES-ARCH-012 Part 1

### Methodology

- **OES-000** Owner Engineering Specification Standard — **ACCEPTED / APPROVED / FROZEN**
- Acceptance: [OES-000-OWNER-ACCEPTANCE.md](../../engineering/oes/OES-000-OWNER-ACCEPTANCE.md) · `20260726T233500Z-OES-000-ACCEPTANCE.json`
- **OES-001** Engineering Writing Standard — **AUTHORISED** (awaiting freeze)
- Catalogue: [docs/engineering/oes/](../../engineering/oes/README.md)

### Workbench Architecture OES

- **APZQEP-OES-ARCH-012** Part 1 filed; canonical pack layout with `COMPLETE.md` (not ready)
- Pack: [OES-ARCH-012](../../engineering/oes/APZQEP/OES-ARCH-012-Test-Specifications-Workbench-Architecture/README.md)
- Parts 2–5 + Appendices pending; Workbench Engineering **NOT AUTHORISED**

## 2026-07-26 — APZQEP-ENG-050B (implemented; awaiting Owner Acceptance)

### Engineering (infrastructure)

- **APZQEP-ENG-050B** Test Specifications Infrastructure
- Package: `@apzhub/qep-test-specifications` **0.2.0**
- Migrations: **0083**, **0084**
- REST: `/api/v1/qep/specifications`
- Pack: [test-specifications/engine/](./test-specifications/engine/README.md)
- Evidence: `20260726T223000Z-APZQEP-ENG-050B.json`

### Also recorded

- **APZQEP-ENG-050A** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE**

### Next (gated)

- Owner Acceptance of ENG-050B
- Workbench Architecture / Engineering / Certification **NOT AUTHORISED**

## 2026-07-26 — APZQEP-ENG-050A (accepted)

### Engineering (domain)

- **APZQEP-ENG-050A** Test Specifications Domain Model — **ACCEPTED**
- Package baseline: `@apzhub/qep-test-specifications` **0.1.0** (superseded by 0.2.0 under ENG-050B)
- Pack: [test-specifications/engine-domain/](./test-specifications/engine-domain/README.md)
- Evidence: `20260726T214500Z-APZQEP-ENG-050A.json`

### Also recorded

- **APZQEP-ARCH-011** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE**
- Acceptance: `20260726T212000Z-APZQEP-ARCH-011-ACCEPTANCE.json`

## 2026-07-26 — APZQEP-ARCH-011 (accepted)

### Architecture (Owner-accepted)

- **APZQEP-ARCH-011** Test Specifications Capability Architecture — **ACCEPTED**
- Pack: [architecture/test-specifications/](./architecture/test-specifications/README.md)
- Authoritative: [TEST-SPECIFICATIONS-ARCHITECTURE.md](./architecture/test-specifications/TEST-SPECIFICATIONS-ARCHITECTURE.md)
- Evidence: `20260726T210000Z-APZQEP-ARCH-011.json`
- Acceptance: `20260726T212000Z-APZQEP-ARCH-011-ACCEPTANCE.json`

### Next (gated)

- **APZQEP-ENG-050A** Domain Model — implemented; awaiting Owner Acceptance

## 2026-07-26 — APZQEP-CERT-040D (accepted)

### Certification (Owner-accepted)

- **APZQEP-CERT-040D** Verification Capability Certification — **ACCEPTED**
- Class: **PRODUCTION_READY_WITH_LIMITATIONS**
- Package: `@apzhub/qep-verification` **1.0.0 CERTIFIED / FROZEN**
- Pack: [verification/capability-certification/](./verification/capability-certification/README.md)
- Acceptance: `20260726T205000Z-APZQEP-CERT-040D-ACCEPTANCE.json`

### Also recorded

- **APZQEP-ENG-040C** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE**
- Acceptance: `20260726T200000Z-APZQEP-ENG-040C-ACCEPTANCE.json`

### Next (gated)

- APZQEP-ARCH-011 Test Specifications Capability Architecture

## 2026-07-26 — APZQEP-ENG-040C (accepted)

### Engineering (Owner-accepted)

- **APZQEP-ENG-040C** Verification Workbench — **ACCEPTED**
- Package at acceptance: `@apzhub/qep-verification` **0.3.0**
- Routes: `/workspace/qep/verification/*`
- Pack: [verification/workbench/](./verification/workbench/README.md)
- Evidence: `20260726T194500Z-APZQEP-ENG-040C.json`
- Acceptance: `20260726T200000Z-APZQEP-ENG-040C-ACCEPTANCE.json`

### Also recorded

- **APZQEP-ARCH-010** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE**
- Acceptance: `20260726T193000Z-APZQEP-ARCH-010-ACCEPTANCE.json`

### Next (gated)

- APZQEP-CERT-040D Verification Capability Certification

## 2026-07-26 — APZQEP-ARCH-010 (accepted)

### Architecture (Owner-accepted)

- **APZQEP-ARCH-010** Verification Workbench Architecture — **ACCEPTED**
- Pack: [architecture/verification-workbench/](./architecture/verification-workbench/README.md)
- Evidence: `20260726T191500Z-APZQEP-ARCH-010.json`
- Acceptance: `20260726T193000Z-APZQEP-ARCH-010-ACCEPTANCE.json`

### Also recorded

- **APZQEP-ENG-040B** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE**
- Acceptance: [OWNER-ACCEPTANCE.md](./verification/engine/OWNER-ACCEPTANCE.md) · `20260726T190000Z-APZQEP-ENG-040B-ACCEPTANCE.json`

### Next (gated)

- APZQEP-ENG-040C Verification Workbench Engineering

## 2026-07-26 — APZQEP-ENG-040B (accepted)

### Engineering (Owner-accepted)

- **APZQEP-ENG-040B** Verification Infrastructure — **ACCEPTED**
- Package: `@apzhub/qep-verification` **0.2.0**
- Migrations: **0081**, **0082**
- REST: `/api/v1/qep/verifications/*`
- Search: `verificationToSearchDraft` / `onVerificationUpserted` (`verification_record`)
- Permissions: `qep.verification.*`
- Tests: **133 PASS**
- Pack: [verification/engine/](./verification/engine/README.md)
- Evidence: `20260726T181500Z-APZQEP-ENG-040B.json`
- Acceptance: `20260726T190000Z-APZQEP-ENG-040B-ACCEPTANCE.json`

### Also recorded

- **APZQEP-ENG-040A** Owner Acceptance — **ACCEPTED**
- Acceptance: `20260726T180000Z-APZQEP-ENG-040A-ACCEPTANCE.json`

### Next (gated)

- APZQEP-ARCH-010 Verification Workbench Architecture (authorised under ENG-040B acceptance)

## 2026-07-26 — APZQEP-ENG-040A (accepted)

### Engineering (Owner-accepted)

- **APZQEP-ENG-040A** Verification Engine Domain — **ACCEPTED**
- Package baseline: `@apzhub/qep-verification` **0.1.0**
- Tests at acceptance: **112 PASS**
- Pack: [verification/engine-domain/](./verification/engine-domain/README.md)
- Evidence: `20260726T175000Z-APZQEP-ENG-040A.json`
- Acceptance: `20260726T180000Z-APZQEP-ENG-040A-ACCEPTANCE.json`

### Also recorded

- **APZQEP-ARCH-009** Owner Acceptance — **ACCEPTED**
- Acceptance: `20260726T174500Z-APZQEP-ARCH-009-ACCEPTANCE.json`

### Next (gated)

- APZQEP-ENG-040B infrastructure (authorised under ENG-040A acceptance)

## 2026-07-26 — APZQEP-ARCH-009 (accepted)

### Architecture (Owner-accepted)

- **APZQEP-ARCH-009** Verification Capability Architecture — **ACCEPTED**
- Pack: [architecture/verification/](./architecture/verification/README.md)
- Evidence: `20260726T173000Z-APZQEP-ARCH-009.json`
- Acceptance: `20260726T174500Z-APZQEP-ARCH-009-ACCEPTANCE.json`

### Also recorded

- **APZQEP-TRACE-001** Owner Acceptance — Traceability **1.0.0 CERTIFIED / FROZEN**

### Next (gated)

- APZQEP-ENG-040A domain (authorised under acceptance)

## 2026-07-26 — APZQEP-TRACE-001 (implemented; subsequently accepted)

### Certification (subsequently Owner-accepted)

- **APZQEP-TRACE-001** Traceability Capability Certification & Baseline
- Class: **PRODUCTION_READY_WITH_LIMITATIONS**
- Package promotion: `@apzhub/qep-traceability` **0.3.0 → 1.0.0**
- Pack: [traceability/capability-certification/](./traceability/capability-certification/README.md)
- Release evidence: `docs/releases/apzqep/traceability/1.0.0/`
- Evidence: `20260726T165000Z-APZQEP-TRACE-001.json`

### Also recorded

- **APZQEP-ENG-030C** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE**
- Acceptance: `20260726T172000Z-APZQEP-TRACE-001-ACCEPTANCE.json` — Traceability **1.0.0 CERTIFIED / FROZEN**

## 2026-07-26 — APZQEP-ENG-030C (implemented; subsequently accepted) + ARCH-008 accepted

### Implemented (subsequently Owner-accepted)

- **APZQEP-ENG-030C** Traceability Workbench UI
- `@apzhub/qep-traceability` **0.3.0** (later promoted to **1.0.0** under TRACE-001)
- Routes under `/workspace/qep/traceability/*` — Explorer, Create, Detail, History, Supersede, Matrix (presentation), Taxonomy
- Server-authoritative `availableActions` · 52 package + 13 UI tests + Playwright smoke
- Pack: [traceability/workbench/](./traceability/workbench/README.md)
- Evidence: `20260726T155000Z-APZQEP-ENG-030C.json`
- Acceptance: `20260726T164000Z-APZQEP-ENG-030C-ACCEPTANCE.json`

### Also recorded

- **APZQEP-ARCH-008** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE**
- Acceptance: `20260726T154500Z-APZQEP-ARCH-008-ACCEPTANCE.json`

## 2026-07-26 — APZQEP-ARCH-008 (implemented; subsequently accepted)

### Architecture (subsequently Owner-accepted)

- **APZQEP-ARCH-008** Traceability Workbench Architecture
- Extends **APZQEP-ARCH-006**; Traceability-specific Explorer / Matrix / Inspector / lineage / analysis slots
- Pack: [architecture/traceability-workbench/](./architecture/traceability-workbench/README.md)
- Evidence: `20260726T153500Z-APZQEP-ARCH-008.json`
- Acceptance: `20260726T154500Z-APZQEP-ARCH-008-ACCEPTANCE.json`

### Also recorded

- **APZQEP-ENG-030A Part 2** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE**

## 2026-07-26 — APZQEP-ENG-030A Part 2 (implemented; subsequently accepted)

### Implemented (subsequently Owner-accepted)

- **APZQEP-ENG-030A Part 2** Traceability Engine — Persistence, Application, APIs, Platform Integration
- `@apzhub/qep-traceability` **0.2.0**
- Migrations **0079** / **0080**
- REST `/api/v1/qep/traceability/*` · search entity `trace_link` · permissions `qep.traceability.*`
- Evidence: `20260726T141500Z-APZQEP-ENG-030A-PART2.json`
- Acceptance: `20260726T153000Z-APZQEP-ENG-030A-PART2-ACCEPTANCE.json`
- Docs: [traceability/engine/](./traceability/engine/README.md)

### Also recorded

- **APZQEP-ENG-030A Part 1** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE**

## 2026-07-26 — APZQEP-ENG-030A Part 1 (implemented; subsequently accepted)

### Implemented (not Owner-accepted)

- **APZQEP-ENG-030A Part 1** Traceability Engine — Domain Model and Business Rules
- Package `@apzhub/qep-traceability` **0.1.0**
- TraceLink aggregate, taxonomy, lifecycle, policies, pure domain services, event builders
- Evidence: `20260726T133000Z-APZQEP-ENG-030A-PART1.json`
- Docs: [traceability/engine-domain/](./traceability/engine-domain/README.md)

### Also recorded

- **APZQEP-ARCH-007** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE**

### Next (gated)

- Owner Acceptance of Part 1
- Do **not** begin Part 2 without Owner Instruction

## 2026-07-26 — APZQEP-ARCH-007 Traceability Architecture

### Architecture (subsequently accepted)

- **APZQEP-ARCH-007** Requirements Traceability Architecture — pack complete
- Authoritative spec + companions: [architecture/requirements-traceability/](./architecture/requirements-traceability/README.md)
- Evidence: `20260726T123000Z-APZQEP-ARCH-007.json`
- Defines Trace model, coverage/impact architecture, governance, Workbench integration principles, AI/MCP consumer rules
- Explicitly excluded: engineering, code, APIs, UI, coverage calculations, impact engine

### Also recorded

- **APZQEP-REQ-001** Owner Acceptance — Requirements **1.0.0 CERTIFIED / FROZEN** (`20260726T120000Z-APZQEP-REQ-001-ACCEPTANCE.json`)

### Next (gated)

- Owner Acceptance of **APZQEP-ARCH-007**
- Then separate Owner Engineering Instruction before Traceability engineering

## 2026-07-26 — APZQEP-REQ-001 Requirements Capability Certification

### Certification (subsequently accepted)

- **APZQEP-REQ-001** Requirements Capability Certification & Baseline
- ENG-020A–020F and ARCH-005/006 confirmed consistent and feature-complete within authorised scope
- ENG-020F Part 3 recorded **ACCEPTED / CLOSED / COMPLETE**
- `@apzhub/qep-requirements` promoted **0.10.0 → 1.0.0**
- Pack: [requirements/capability-certification/](./requirements/capability-certification/README.md)
- Release evidence: [releases/apzqep/requirements/1.0.0/](../../releases/apzqep/requirements/1.0.0/README.md)
- Evidence: `20260726T110000Z-APZQEP-REQ-001.json`
- Class: **PRODUCTION_READY_WITH_LIMITATIONS** · Recommendation: **PRODUCTION READY**

### Next (gated)

- Owner Acceptance of **APZQEP-REQ-001**
- Do **not** begin APZQEP-ARCH-007

## 2026-07-26 — APZQEP-ENG-020F Part 3 (implemented; subsequently accepted)

### Implemented (not Owner-accepted)

- **APZQEP-ENG-020F Part 3** Requirements Relationship Workbench — Explorer, Inspector, create/edit/lifecycle, `availableActions`, Baseline/CV context
- **APZQEP-ARCH-006** — **ACCEPTED / CLOSED / COMPLETE** (via Part 3 Owner Instruction)
- `@apzhub/qep-requirements` **0.10.0**
- Evidence: `20260726T100000Z-APZQEP-ENG-020F-PART3.json` · Acceptance ARCH-006 `20260726T095000Z-APZQEP-ARCH-006-ACCEPTANCE.json`
- Docs: [requirements/relationships/](./requirements/relationships/README.md)

### Next (gated)

- Owner Acceptance of **APZQEP-ENG-020F Part 3**
- Do **not** begin Traceability, Verification, graphs, AI, or MCP

## 2026-07-26 — APZQEP-ARCH-006 (architecture complete; subsequently accepted)

### Architecture (now Owner-accepted)

- **APZQEP-ARCH-006** Requirements Workbench Architecture — pack complete
- Authoritative spec + companions: [architecture/requirements-workbench/](./architecture/requirements-workbench/README.md)
- Evidence: `20260726T093000Z-APZQEP-ARCH-006.json`
- Defines reusable Workbench grammar for Requirements and future Traceability/Verification modules

### Also recorded

- **APZQEP-ENG-020F Part 2** Owner Acceptance — **ACCEPTED / CLOSED / COMPLETE** (`20260726T092900Z-APZQEP-ENG-020F-PART2-ACCEPTANCE.json`)

## 2026-07-26 — APZQEP-ENG-020F Part 2 (implemented; subsequently accepted)

### Implemented (now Owner-accepted)

- **APZQEP-ENG-020F Part 2** Requirements Relationship Engine — Persistence, Application Services, APIs and Platform Integration
- `@apzhub/qep-requirements` **0.9.0**
- Migrations `0077` / `0078` (relationship + history + taxonomy + RLS)
- PostgreSQL + in-memory repositories; application commands/queries; REST API; permissions; audit; search projection; observability hooks
- Docs: [requirements/relationships/](./requirements/relationships/README.md)
- Evidence: `20260726T090200Z-APZQEP-ENG-020F-PART2.json`

## 2026-07-26 — APZQEP-ENG-020F Part 1 Owner Acceptance

### Accepted / closed / complete (Part 1)

- **APZQEP-ENG-020F Part 1** Requirements Relationship Engine Domain — **ACCEPTED / CLOSED / COMPLETE**
- Acceptance evidence: `20260726T083000Z-APZQEP-ENG-020F-PART1-ACCEPTANCE.json`
- Pack: [OWNER-ACCEPTANCE-PART1.md](./requirements/relationships/OWNER-ACCEPTANCE-PART1.md)

### Authorised next

- **APZQEP-ENG-020F Part 2** — **AUTHORISED TO BEGIN** (persistence, application, repositories, commands, queries, APIs, permissions, audit, search, observability)
- Part 3 remains **NOT AUTHORISED**

## 2026-07-26 — APZQEP-ENG-020F Part 1 (domain complete)

### Implemented (subsequently Owner-accepted)

- **APZQEP-ENG-020F Part 1** Requirements Relationship Engine — Domain Model and Business Rules
- `@apzhub/qep-requirements` **0.8.0**
- Aggregate `RequirementsRelationship` / entity `Relationship`, normative taxonomy, value objects, policies, pure domain service, domain events (builders only), 27 domain tests
- Docs: [requirements/relationships/](./requirements/relationships/README.md)
- Evidence: `20260726T081600Z-APZQEP-ENG-020F-PART1.json`
- Explicitly excluded from Part 1: persistence, repositories, APIs, UI, search, audit runtime, Traceability, Verification, AI, MCP

## 2026-07-26 — APZQEP-ARCH-005 Owner Architecture Acceptance

### Accepted / closed / complete

- **APZQEP-ARCH-005** Requirements Relationship Architecture — **ACCEPTED / CLOSED / COMPLETE** (Authoritative Architecture)
- Acceptance evidence: `20260726T075000Z-APZQEP-ARCH-005-ACCEPTANCE.json`
- Pack: [architecture/requirements-relationship/](./architecture/requirements-relationship/README.md)

### Next (gated)

- **APZQEP-ENG-020F** — Phase **PLANNING** · Implementation **AUTHORISED TO BEGIN**
- Await Owner Engineering Programme Instruction (recommended: Owner Engineering Specification Parts 1–3 before coding)

## 2026-07-26 — APZQEP-ENG-020E Owner Acceptance

### Accepted / closed / complete

- **APZQEP-ENG-020E** Requirements Baselines — **ACCEPTED / CLOSED / COMPLETE**
- Acceptance evidence: `20260726T080000Z-APZQEP-ENG-020E-ACCEPTANCE.json`
- Package baseline: `@apzhub/qep-requirements` **0.7.0**
- Binding foundations recorded in [OWNER-ACCEPTANCE.md](./requirements/baselines/OWNER-ACCEPTANCE.md)

## 2026-07-25 — APZQEP-ENG-020E Parts 1–3 (implementation)

### Implemented (now accepted)

- **APZQEP-ENG-020E** Requirements Baselines (Parts 1–3) — subsequently **ACCEPTED / CLOSED / COMPLETE** on 2026-07-26
- `@apzhub/qep-requirements` **0.7.0**
- Part 1: baseline domain aggregate, lifecycle policy (draft → locked → archived, no reverse/unlock), repository port, event contracts
- Part 2: application service (`createBaseline`, `updateDraftBaseline`, `addRequirementVersion`, `removeRequirementVersion`, `lockBaseline`, `archiveBaseline`, `compareBaselines`), PostgreSQL + in-memory persistence (migrations `0074`–`0076`), REST API, permissions `qep.requirements.baselines.*`
- Part 3: integrity fingerprinting (SHA-256 canonical hash over membership + content-version snapshots) with mandatory empty-lock rejection, `verifyBaselineIntegrity` command + API + permission, `availableActions` on the baseline DTO, and the Workbench UI (list, create, detail, add/remove version, lock/archive/verify confirmations, compare with version-changed detection, Requirement Baseline History panel)
- Docs: `docs/products/apzqep/requirements/baselines/`
- Evidence: `20260725T174800Z-APZQEP-ENG-020E-PART1.json`, `20260725T190000Z-APZQEP-ENG-020E-PART2.json`, `20260725T203000Z-APZQEP-ENG-020E.json`
- Explicitly excluded: clone, unlock, restore, delete, merge, import/export, requirement relationships, Verification domain capabilities, AI, MCP

## 2026-07-25 — APZQEP-ENG-020D (implementation)

### Implemented / awaiting Owner acceptance

- **APZQEP-ENG-020D** Requirements Content Versioning — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**
- `@apzhub/qep-requirements` **0.4.0** — append-only content versions, canonical snapshots, SHA-256 integrity, comparison
- Migrations `0072` / `0073` — `qep_requirement_content_version` + RLS
- Backfill: `pnpm backfill:qep-requirements-content-versions` (no Platform business audit during migration)
- Version history / detail / compare APIs and Workbench UI; permissions `qep.requirements.versions.*`
- Docs: `docs/products/apzqep/requirements/versioning/`
- Evidence: `20260725T160000Z-APZQEP-ENG-020D.json`
- Explicitly excluded: baselines, generic versioning engine, relationships, AI/MCP

### Next (gated)

- **APZQEP-ENG-020E** Requirements Baselines — only after Owner acceptance of ENG-020D

## 2026-07-25 — APZQEP-ENG-020C (Owner Acceptance)

### Accepted / closed

- **APZQEP-ENG-020C** Requirements Lifecycle Engine & State Machine — **ACCEPTED / CLOSED / COMPLETE**
- Binding: status changes only via lifecycle engine; CRUD must not mutate status; audit triad (Platform audit + lifecycle history + domain event); server-authoritative UI actions
- Evidence: `20260724T230000Z-APZQEP-ENG-020C.json` · `20260725T071300Z-APZQEP-ENG-020C-ACCEPTANCE.json`

## 2026-07-24 — APZQEP-ENG-020C (implementation)

### Added

- `@apzhub/lifecycle-engine` **0.1.0** — reusable lifecycle abstractions
- `@apzhub/qep-requirements` **0.3.0** — Requirements lifecycle policy, history, transition services
- Migrations `0070` / `0071` — `qep_requirement_lifecycle_history`
- Lifecycle API, permissions, UI actions/history; docs under `requirements/lifecycle/`

## 2026-07-24 — APZQEP-ENG-010

### Added

- `@apzhub/qep-types`, `@apzhub/qep-contracts`, `@apzhub/qep-foundation`, `@apzhub/qep-ui` (0.1.0 stubs)
- `modules/qep-*` — 22 module.yaml stubs (M01–M22)
- `services/qep/` — platform + 16 domain service.yaml stubs
- `events/qep/*` — 8 lifecycle event.yaml stubs
- `@apzhub/integration-qep-github` stub
- `pnpm audit:qep-foundation` · `pnpm test:qep` · `pnpm typecheck:qep`
- `docs/products/apzqep/engineering/` foundation documentation pack
- Evidence `20260724T191200Z-APZQEP-ENG-010.json`

### Changed

- APZQEP-PLAN-001 recorded **ACCEPTED**
- Active programme → APZQEP-ENG-010
- Next after Foundation Acceptance: **APZQEP-ENG-020**

### Not done (prohibited)

- Requirements / Verification / Execution / Certification business implementation
- Database schemas, API endpoints, shell routes, deploy

## 2026-07-24 — APZQEP-PLAN-001

### Added

- `docs/products/apzqep/engineering-plan/` Engineering Delivery Plan & Implementation Roadmap (13 deliverables)
- Roadmap 0.1–1.0 GA; epics; Sprint Zero; dependency map; team plan; MVP plan; testing roadmap
- COMPLETION-REPORT, OWNER-ACCEPTANCE (**AWAITING OWNER ACCEPTANCE**)
- Evidence `20260724T183600Z-APZQEP-PLAN-001.json`

### Changed

- APZQEP-ARCH-001 recorded **ACCEPTED**
- Active programme → APZQEP-PLAN-001
- Next after Plan Acceptance: **APZQEP-ENG-010** Repository Bootstrap & Sprint Zero

### Not done (prohibited)

- Production code, repository bootstrap implementation, schemas, API specs, Engineering execution

## 2026-07-24 — APZQEP-ARCH-001

### Added

- `docs/products/apzqep/architecture/` Enterprise Architecture Baseline (26 deliverables)
- Business, application, domain, bounded contexts, information architectures
- Integration, API, event, security, identity, authorisation architectures
- AI, MCP, search, workflow, reporting, notification, observability architectures
- Deployment architecture, technology standards, architecture decision catalogue
- COMPLETION-REPORT, OWNER-ACCEPTANCE (**AWAITING OWNER ACCEPTANCE**)
- Evidence `20260724T181500Z-APZQEP-ARCH-001.json`

### Changed

- APZQEP-DEF-002 recorded **ACCEPTED**
- Active programme → APZQEP-ARCH-001
- Next after Architecture Acceptance: **APZQEP-ENG-001**

### Not done (prohibited)

- Production code, database schemas, migrations, API endpoint specs, GraphQL/protobuf, AI/MCP/integration implementation, Engineering

## 2026-07-24 — APZQEP-DEF-002

### Changed

- Expanded Product Definition pack to enterprise depth (no product redesign)
- All 21 personas to full field standard; all 35 workflows individually expanded
- Model documents, UX, information architecture, navigation, modules deepened
- Active programme → APZQEP-DEF-002; DEF-001 retained as structure baseline
- Evidence `20260724T175100Z-APZQEP-DEF-002.json`

### Not done (prohibited)

- Architecture, ADRs, database/API design, UX mockups, production code, Platform 1.4 or 2.0 changes

## 2026-07-24 — APZQEP-DEF-001

### Added

- `docs/products/apzqep/product-definition/` Product Definition Baseline (36 deliverables)
- Module catalogue (M01–M22), personas, workspaces, UX/IA, lifecycle, verification models
- AI/MCP/user workflows, navigation, QI, readiness, certification, evidence, traceability, risk
- Capabilities, MVP, editions, deployment, commercial, extensibility, boundaries
- Decision register, requirements-to-definition traceability, glossary, validation checklist
- COMPLETION-REPORT, OWNER-ACCEPTANCE (**AWAITING OWNER ACCEPTANCE**)
- Evidence `20260724T164339Z-APZQEP-DEF-001.json`

### Changed

- APZQEP-CONSTITUTION-001 recorded **ACCEPTED / CLOSED**
- Product Governance phase **CLOSED**
- Active programme → APZQEP-DEF-001
- Next after Definition Acceptance: **APZQEP-ARCH-001**

### Not done (prohibited)

- Architecture, ADRs, database/API design, UX mockups, production code, Platform 1.4 or 2.0 changes

## 2026-07-24 — APZQEP-CONSTITUTION-001

### Added

- `docs/products/apzqep/constitution/` Product Constitution & Engineering Guardrails
- PRODUCT-CONSTITUTION, SYSTEM-OF-RECORD, AI/CERTIFICATION/SECURITY constitutions
- ENGINEERING-GUARDRAILS, PRODUCT-GUARDRAILS, LONG-TERM-COMMITMENTS, DECISION-PRINCIPLES
- COMPLETION-REPORT, OWNER-ACCEPTANCE (**ACCEPTED / CLOSED**)

### Changed

- APZQEP-DISCOVERY-001 recorded **ACCEPTED**
- Active programme → APZQEP-CONSTITUTION-001 (later closed; superseded by DEF-001 as active)
- Product Governance phase completed on Constitution Acceptance

### Not done (prohibited at the time)

- Architecture, UX mockups, ADRs, schema, APIs, production code, Platform 1.4 changes

## 2026-07-24 — APZQEP-DISCOVERY-001

### Added

- `docs/products/apzqep/discovery/` Product Discovery & Competitive Intelligence pack
- Competitive landscape, market analysis, customer expectations, differentiators
- AI discovery, MCP discovery, quality trends, gap analysis
- Product strategy, principles, innovation roadmap, discovery summary
- COMPLETION-REPORT, OWNER-ACCEPTANCE (AWAITING OWNER ACCEPTANCE)

### Changed

- APZQEP-REQ-001 recorded **ACCEPTED**
- Active programme → APZQEP-DISCOVERY-001
- Next Definition gate deferred until Discovery Acceptance

### Not done (prohibited)

- Product Definition, UX/wireframes, ADRs, schema, APIs, production code, Platform 1.4 changes

## 2026-07-24 — APZQEP-REQ-001

### Added

- `docs/products/apzqep/requirements/` Product Requirements Baseline 1.0.0-req
- Business, functional, NFR, AI, integration, security, reporting requirements
- Personas, user journeys, maturity model, roadmap, glossary, traceability
- COMPLETION-REPORT, OWNER-ACCEPTANCE (AWAITING OWNER ACCEPTANCE)

### Changed

- APZQEP-TRANSITION-001 recorded **ACCEPTED**
- Active programme → APZQEP-REQ-001
- Governance indexes updated

### Preserved

- APZTCMS-REQ-001 pack under `docs/products/apztcms/requirements/`

### Not done (prohibited)

- Product Definition, Architecture, ADRs, schema, APIs, UI, production code, Platform 1.4 changes

## 2026-07-24 — APZQEP-TRANSITION-001

### Added

- Official product root `docs/products/apzqep/`
- PRODUCT-VISION, PRODUCT-PHILOSOPHY, MODULE-ARCHITECTURE
- AI-STRATEGY, MCP-INTEGRATION-STRATEGY
- PRODUCT-TRANSITION-REPORT, DOCUMENT-MAPPING, this CHANGELOG
- COMPLETION-REPORT, OWNER-ACCEPTANCE

### Changed

- Product identity: APZ TCMS → **APZ QEP** (documentation & governance)
- Indexes and document maps updated to official QEP name
- Historical TCMS paths bridged (not deleted)

### Preserved

- `docs/products/apz-tcms/**`
- `docs/products/apztcms/**` including APZTCMS-REQ-001 requirements
- `docs/releases/tcms/**`
- Prior Owner decisions and certification evidence

### Not done (prohibited)

- Product implementation, schema, APIs, UI, Architecture ADRs, Platform 1.4 changes
